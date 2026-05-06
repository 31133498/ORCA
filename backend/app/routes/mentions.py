from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, services
from ..db import get_db
from ..scraper import run_scrape

router = APIRouter(prefix="/api/mentions", tags=["mentions"])


def _serialize(m: models.Mention) -> dict:
    cls = m.classification
    cust = m.customer
    esc = m.escalation
    return {
        "id": m.id,
        "tweet_id": m.tweet_id,
        "text": m.text,
        "posted_at": m.posted_at,
        "likes": m.likes,
        "retweets": m.retweets,
        "replies": m.replies,
        "url": m.url,
        "customer": (
            {
                "id": cust.id, "handle": cust.handle, "display_name": cust.display_name,
                "msisdn": cust.msisdn, "region": cust.region,
                "tenure_months": cust.tenure_months, "arpu_naira": cust.arpu_naira,
                "verified": cust.verified, "followers": cust.followers,
            }
            if cust else None
        ),
        "classification": (
            {
                "category": cls.category, "urgency": cls.urgency, "pathway": cls.pathway,
                "sentiment": cls.sentiment, "language": cls.language,
                "confidence": cls.confidence, "churn_risk": cls.churn_risk,
                "risk_level": cls.risk_level,
                "risk_factors": [f for f in cls.risk_factors.split("\n") if f],
                "ai_summary": cls.ai_summary, "ai_reply": cls.ai_reply,
                "suggested_offer": cls.suggested_offer,
            }
            if cls else None
        ),
        "escalation": (
            {
                "id": esc.id, "status": esc.status, "assigned_to": esc.assigned_to,
                "queued_at": esc.queued_at, "accepted_at": esc.accepted_at,
                "resolved_at": esc.resolved_at, "notes": esc.notes,
                "final_reply": esc.final_reply,
            }
            if esc else None
        ),
    }


@router.get("")
def list_mentions(
    category: str | None = None,
    pathway: str | None = None,
    risk_level: str | None = None,
    search: str | None = None,
    hours: int = Query(72, ge=1, le=720),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    q = (
        db.query(models.Mention)
        .options(
            joinedload(models.Mention.customer),
            joinedload(models.Mention.classification),
            joinedload(models.Mention.escalation),
        )
        .filter(models.Mention.posted_at >= cutoff)
    )
    if category:
        q = q.join(models.Classification).filter(models.Classification.category == category)
    if pathway:
        q = q.join(models.Classification, isouter=True).filter(models.Classification.pathway == pathway)
    if risk_level:
        q = q.join(models.Classification, isouter=True).filter(models.Classification.risk_level == risk_level)
    if search:
        q = q.filter(models.Mention.text.ilike(f"%{search}%"))
    total = q.count()
    rows = q.order_by(desc(models.Mention.posted_at)).limit(limit).offset(offset).all()
    return {"items": [_serialize(m) for m in rows], "total": total}


@router.get("/{mention_id}")
def get_mention(mention_id: int, db: Session = Depends(get_db)):
    m = (
        db.query(models.Mention)
        .options(
            joinedload(models.Mention.customer),
            joinedload(models.Mention.classification),
            joinedload(models.Mention.escalation),
        )
        .filter(models.Mention.id == mention_id)
        .first()
    )
    if not m:
        raise HTTPException(404, "Mention not found")

    # Customer's other recent complaints — used for the agent context panel.
    history = []
    if m.customer_id:
        sibling = (
            db.query(models.Mention)
            .options(joinedload(models.Mention.classification))
            .filter(models.Mention.customer_id == m.customer_id, models.Mention.id != m.id)
            .order_by(desc(models.Mention.posted_at))
            .limit(5)
            .all()
        )
        history = [
            {
                "id": s.id, "text": s.text, "posted_at": s.posted_at,
                "category": s.classification.category if s.classification else None,
                "risk_level": s.classification.risk_level if s.classification else None,
            }
            for s in sibling
        ]

    out = _serialize(m)
    out["customer_history"] = history
    return out


@router.post("/{mention_id}/reply/draft")
def regenerate_draft(mention_id: int, body: schemas.ReplyDraftIn, db: Session = Depends(get_db)):
    m = db.query(models.Mention).filter_by(id=mention_id).first()
    if not m:
        raise HTTPException(404, "Mention not found")
    if not m.classification:
        raise HTTPException(400, "Mention has not been classified yet")
    # Re-run the classifier to refresh the draft.
    services.process_mention(db, m)
    db.refresh(m)
    return {"ai_reply": m.classification.ai_reply}


@router.post("/{mention_id}/reply/post")
def post_reply(mention_id: int, body: schemas.ReplyPostIn, db: Session = Depends(get_db)):
    m = db.query(models.Mention).filter_by(id=mention_id).first()
    if not m:
        raise HTTPException(404, "Mention not found")
    if m.classification and m.classification.category == "Fraud & Security":
        raise HTTPException(400, "Fraud / Security cases must be resolved by a human via DM, not a public auto-reply.")
    db.add(models.AutoReply(mention_id=m.id, body=body.body, simulated=True))
    if m.escalation:
        m.escalation.status = "RESOLVED"
        m.escalation.resolved_at = datetime.utcnow()
        m.escalation.final_reply = body.body
    db.commit()
    return {"ok": True, "posted_at": datetime.utcnow().isoformat(), "simulated": True}


@router.post("/scrape")
def trigger_scrape(req: schemas.ScrapeRequest, db: Session = Depends(get_db)):
    """Run an Apify X scrape, persist new tweets, then classify them."""
    rows = run_scrape(handle=req.handle, keywords=req.keywords, max_items=req.max_items)
    inserted = 0
    for r in rows:
        existing = db.query(models.Mention).filter_by(tweet_id=r["tweet_id"]).first()
        if existing:
            continue
        author = r["author"]
        cust = db.query(models.Customer).filter_by(handle=author["handle"]).first()
        if not cust:
            cust = models.Customer(
                handle=author["handle"],
                display_name=author.get("display_name", author["handle"]),
                verified=author.get("verified", False),
                followers=int(author.get("followers", 0) or 0),
            )
            db.add(cust)
            db.flush()
        m = models.Mention(
            tweet_id=r["tweet_id"], customer_id=cust.id, text=r["text"],
            posted_at=r["posted_at"], likes=r["likes"], retweets=r["retweets"],
            replies=r["replies"], url=r["url"], in_reply_to=r.get("in_reply_to", ""),
            raw_source="apify",
        )
        db.add(m)
        inserted += 1
    db.commit()
    classified = services.process_unclassified(db)
    return {"scraped": len(rows), "inserted": inserted, "classified": classified,
            "live": bool(rows), "operator": req.handle or "MTNNigeria"}
