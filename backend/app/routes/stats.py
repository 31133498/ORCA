from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/live")
def live_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    cutoff_24 = now - timedelta(hours=24)

    total = (
        db.query(func.count(models.Mention.id))
        .filter(models.Mention.posted_at >= cutoff_24)
        .scalar() or 0
    )
    auto_resolved = (
        db.query(func.count(models.AutoReply.id))
        .join(models.Mention, models.Mention.id == models.AutoReply.mention_id)
        .filter(models.Mention.posted_at >= cutoff_24)
        .scalar() or 0
    )
    escalated = (
        db.query(func.count(models.Escalation.id))
        .join(models.Mention, models.Mention.id == models.Escalation.mention_id)
        .filter(models.Mention.posted_at >= cutoff_24)
        .scalar() or 0
    )
    resolution_seconds = (
        db.query(
            func.avg(
                func.julianday(models.Escalation.resolved_at)
                - func.julianday(models.Escalation.queued_at)
            )
        )
        .filter(models.Escalation.resolved_at.isnot(None))
        .scalar()
    )
    avg_response_seconds = int((resolution_seconds or 0) * 86400)

    by_category = [
        {"category": cat, "count": cnt}
        for cat, cnt in (
            db.query(models.Classification.category,
                     func.count(models.Classification.id))
            .join(models.Mention, models.Mention.id == models.Classification.mention_id)
            .filter(models.Mention.posted_at >= cutoff_24)
            .group_by(models.Classification.category)
            .all()
        )
    ]

    by_pathway = [
        {"pathway": p, "count": c}
        for p, c in (
            db.query(models.Classification.pathway,
                     func.count(models.Classification.id))
            .join(models.Mention, models.Mention.id == models.Classification.mention_id)
            .filter(models.Mention.posted_at >= cutoff_24)
            .group_by(models.Classification.pathway)
            .all()
        )
    ]

    # 24-bucket hourly time series.
    timeseries = []
    for i in range(24, -1, -1):
        bucket_start = now - timedelta(hours=i + 1)
        bucket_end = now - timedelta(hours=i)
        cnt = (
            db.query(func.count(models.Mention.id))
            .filter(
                models.Mention.posted_at >= bucket_start,
                models.Mention.posted_at < bucket_end,
            )
            .scalar() or 0
        )
        timeseries.append({"hour": bucket_end.strftime("%H:00"), "count": cnt})

    by_platform = [
        {"platform": p, "count": c}
        for p, c in (
            db.query(models.Mention.platform, func.count(models.Mention.id))
            .filter(models.Mention.posted_at >= cutoff_24)
            .group_by(models.Mention.platform)
            .all()
        )
    ]

    top_risk = (
        db.query(
            models.Customer.handle, models.Customer.display_name,
            models.Customer.region, models.Customer.arpu_naira,
            func.max(models.Classification.churn_risk).label("risk"),
        )
        .join(models.Mention, models.Mention.customer_id == models.Customer.id)
        .join(models.Classification, models.Classification.mention_id == models.Mention.id)
        .group_by(models.Customer.id)
        .order_by(func.max(models.Classification.churn_risk).desc())
        .limit(5)
        .all()
    )

    return {
        "total_mentions_24h": total,
        "auto_resolved_24h": auto_resolved,
        "escalated_24h": escalated,
        "avg_response_seconds": avg_response_seconds,
        "auto_resolve_rate": round(auto_resolved / total, 3) if total else 0.0,
        "by_category": by_category,
        "by_pathway": by_pathway,
        "by_platform": by_platform,
        "timeseries": timeseries,
        "top_risk": [
            {
                "handle": h, "display_name": d, "region": r,
                "arpu_naira": a, "risk": rk,
            }
            for h, d, r, a, rk in top_risk
        ],
    }
