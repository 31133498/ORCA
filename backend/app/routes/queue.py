from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import case, desc
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..db import get_db
from .mentions import _serialize

router = APIRouter(prefix="/api/queue", tags=["queue"])


_RISK_RANK = case(
    {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1},
    value=models.Classification.risk_level,
    else_=0,
)


@router.get("")
def list_queue(open_only: bool = True, db: Session = Depends(get_db)):
    q = (
        db.query(models.Escalation)
        .join(models.Mention, models.Escalation.mention_id == models.Mention.id)
        .join(models.Classification, models.Classification.mention_id == models.Mention.id)
        .options(
            joinedload(models.Escalation.mention)
            .joinedload(models.Mention.customer),
            joinedload(models.Escalation.mention)
            .joinedload(models.Mention.classification),
        )
    )
    if open_only:
        q = q.filter(models.Escalation.status.in_(["QUEUED", "ACCEPTED"]))
    q = q.order_by(
        desc(models.Classification.urgency),
        desc(models.Classification.churn_risk),
        models.Escalation.queued_at.asc(),
    )
    rows = q.all()
    items = []
    for esc in rows:
        items.append({
            "escalation_id": esc.id,
            "queued_at": esc.queued_at,
            "status": esc.status,
            "assigned_to": esc.assigned_to,
            "mention": _serialize(esc.mention),
        })
    return {"items": items, "total": len(items)}


@router.post("/{escalation_id}/action")
def take_action(escalation_id: int, body: schemas.QueueAction, db: Session = Depends(get_db)):
    esc = db.query(models.Escalation).filter_by(id=escalation_id).first()
    if not esc:
        raise HTTPException(404, "Escalation not found")
    now = datetime.utcnow()
    if body.action == "accept":
        esc.status = "ACCEPTED"
        esc.assigned_to = body.agent
        esc.accepted_at = now
    elif body.action == "resolve":
        esc.status = "RESOLVED"
        esc.resolved_at = now
        esc.final_reply = body.final_reply or esc.final_reply
        esc.notes = (esc.notes + "\n" + body.notes) if body.notes else esc.notes
    elif body.action == "dismiss":
        esc.status = "DISMISSED"
        esc.resolved_at = now
        esc.notes = (esc.notes + "\n" + body.notes) if body.notes else esc.notes
    db.commit()
    return {"ok": True, "status": esc.status}
