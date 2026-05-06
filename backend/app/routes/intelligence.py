"""Intelligence reports — Priority Issue Matrix + Churn Risk Heatmap.

Per PRD section 5.5.2 the priority matrix ranks complaint categories by
volume, average urgency, sentiment trend, and resolution rate. The
heatmap groups customers by region × ARPU band.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


_RECOMMENDED_ACTION = {
    "Data Depletion": ("Deploy auto-reconciliation rule for overnight depletion",
                        "Network Engineering"),
    "Network / Connectivity": ("Push tower-health audit for top 3 affected LGAs",
                                 "Field Operations"),
    "Billing & Charges": ("Pause auto-renew for flagged subscriptions; manual audit",
                            "Billing Ops"),
    "SIM & Account Issues": ("Senior agent SLA review; dedicated NIN-link queue",
                               "Subscriber Care"),
    "Recharge & Vouchers": ("Reconcile gateway logs; broadcast retry advisory",
                              "Payments"),
    "Service Activation": ("Audit auto-subscription pipelines; opt-in flow review",
                             "Product"),
    "Fraud & Security": ("Hard-route to Fraud team; freeze affected SIM range",
                            "Fraud / Security"),
    "Customer Service Complaint": ("Coaching review; recompose IVR routing",
                                       "Customer Care Leadership"),
    "General Rant / Feedback": ("Sentiment dipstick; publish 1-pager response",
                                   "Brand"),
}


@router.get("/priority-matrix")
def priority_matrix(days: int = 7, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=days)
    half = datetime.utcnow() - timedelta(days=days // 2 if days >= 2 else 1)

    rows = (
        db.query(
            models.Classification.category,
            func.count(models.Classification.id).label("volume"),
            func.avg(models.Classification.urgency).label("avg_urgency"),
        )
        .join(models.Mention, models.Mention.id == models.Classification.mention_id)
        .filter(models.Mention.posted_at >= cutoff)
        .group_by(models.Classification.category)
        .all()
    )

    out = []
    for category, volume, avg_urg in rows:
        # Sentiment trend = share of negative tweets in second half - first half.
        first = (
            db.query(func.count(models.Classification.id))
            .join(models.Mention, models.Mention.id == models.Classification.mention_id)
            .filter(
                models.Classification.category == category,
                models.Classification.sentiment == "negative",
                models.Mention.posted_at >= cutoff,
                models.Mention.posted_at < half,
            )
            .scalar() or 0
        )
        second = (
            db.query(func.count(models.Classification.id))
            .join(models.Mention, models.Mention.id == models.Classification.mention_id)
            .filter(
                models.Classification.category == category,
                models.Classification.sentiment == "negative",
                models.Mention.posted_at >= half,
            )
            .scalar() or 0
        )
        sentiment_trend = (second - first) / max(1, volume)

        # Resolution rate = resolved auto-replies + resolved escalations.
        resolved_auto = (
            db.query(func.count(models.AutoReply.id))
            .join(models.Mention, models.Mention.id == models.AutoReply.mention_id)
            .join(models.Classification, models.Classification.mention_id == models.Mention.id)
            .filter(models.Classification.category == category,
                    models.Mention.posted_at >= cutoff)
            .scalar() or 0
        )
        resolved_escalations = (
            db.query(func.count(models.Escalation.id))
            .join(models.Mention, models.Mention.id == models.Escalation.mention_id)
            .join(models.Classification, models.Classification.mention_id == models.Mention.id)
            .filter(models.Classification.category == category,
                    models.Escalation.status == "RESOLVED",
                    models.Mention.posted_at >= cutoff)
            .scalar() or 0
        )
        resolved = resolved_auto + resolved_escalations
        resolution_rate = resolved / max(1, volume)

        # Composite priority score: volume × urgency × (1 + max(0, sentiment delta)) ÷ (1 + resolution_rate)
        composite = (
            volume * float(avg_urg or 0) *
            (1 + max(0.0, sentiment_trend)) /
            (1 + resolution_rate)
        )
        action, owner = _RECOMMENDED_ACTION.get(category, ("Manual triage", "Customer Care"))
        out.append({
            "category": category,
            "volume": volume,
            "avg_urgency": round(float(avg_urg or 0), 2),
            "sentiment_trend": round(sentiment_trend, 2),
            "resolution_rate": round(resolution_rate, 2),
            "score": round(composite, 1),
            "recommended_action": action,
            "owner_team": owner,
        })

    out.sort(key=lambda r: r["score"], reverse=True)
    return {"rows": out, "window_days": days}


@router.get("/heatmap")
def churn_heatmap(db: Session = Depends(get_db)):
    """Region × ARPU band → average churn risk. Includes regions even if
    we have no mention yet so the heatmap stays visually stable."""

    bands = [
        ("LOW", 0, 4000),
        ("MID", 4000, 8000),
        ("HIGH", 8000, 12000),
        ("PREMIUM", 12000, 1_000_000),
    ]

    customers = db.query(models.Customer).all()
    regions = sorted({c.region for c in customers if c.region}) or ["Lagos"]

    cells = []
    for region in regions:
        for band_label, low, high in bands:
            cust_in_cell = [
                c for c in customers
                if c.region == region and low <= c.arpu_naira < high
            ]
            if not cust_in_cell:
                continue
            cust_ids = [c.id for c in cust_in_cell]
            risks = (
                db.query(models.Classification.churn_risk)
                .join(models.Mention, models.Mention.id == models.Classification.mention_id)
                .filter(models.Mention.customer_id.in_(cust_ids))
                .all()
            )
            if not risks:
                avg_risk = 0
                critical = 0
            else:
                vals = [r[0] for r in risks]
                avg_risk = sum(vals) / len(vals)
                critical = sum(1 for v in vals if v >= 90)
            cells.append({
                "region": region,
                "arpu_band": band_label,
                "customers": len(cust_in_cell),
                "avg_risk": round(avg_risk, 1),
                "critical_count": critical,
            })
    return {"cells": cells, "regions": regions, "bands": [b[0] for b in bands]}


@router.get("/top-risk")
def top_risk(limit: int = 10, db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Customer.id, models.Customer.handle, models.Customer.display_name,
            models.Customer.region, models.Customer.arpu_naira,
            func.max(models.Classification.churn_risk).label("max_risk"),
            func.count(models.Classification.id).label("complaints"),
        )
        .join(models.Mention, models.Mention.customer_id == models.Customer.id)
        .join(models.Classification, models.Classification.mention_id == models.Mention.id)
        .group_by(models.Customer.id)
        .order_by(func.max(models.Classification.churn_risk).desc())
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "customer_id": r.id, "handle": r.handle, "display_name": r.display_name,
                "region": r.region, "arpu_naira": r.arpu_naira,
                "max_risk": r.max_risk, "complaints": r.complaints,
            }
            for r in rows
        ]
    }
