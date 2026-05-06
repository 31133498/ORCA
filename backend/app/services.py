"""Pipeline orchestration: classify a Mention and route it.

Given a Mention row that hasn't been processed yet, run:
1. classifier.classify(...) → category/urgency/pathway/sentiment/ai_summary/ai_reply
2. churn.score_churn(...) → 0-100 + level + factors
3. churn.suggest_offer(...)
4. Persist a Classification row.
5. If pathway != AUTO_REPLY (or risk_level >= HIGH), create an Escalation.
6. If pathway == AUTO_REPLY, record a (simulated) AutoReply.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from . import classifier, churn, models


def _prior_complaints(db: Session, customer_id: int | None, before: datetime) -> int:
    if customer_id is None:
        return 0
    cutoff = before - timedelta(days=30)
    return (
        db.query(models.Mention)
        .join(models.Classification, models.Mention.id == models.Classification.mention_id)
        .filter(
            models.Mention.customer_id == customer_id,
            models.Mention.posted_at >= cutoff,
            models.Mention.posted_at < before,
        )
        .count()
    )


def process_mention(db: Session, mention: models.Mention) -> models.Classification:
    """Idempotent: if already classified, return existing classification."""
    if mention.classification is not None:
        return mention.classification

    cust = mention.customer
    cls_out = classifier.classify(
        mention.text,
        customer_followers=cust.followers if cust else 0,
        customer_verified=cust.verified if cust else False,
        likes=mention.likes,
        retweets=mention.retweets,
    )

    prior = _prior_complaints(db, mention.customer_id, mention.posted_at)
    score, level, factors = churn.score_churn(
        churn.ChurnInput(
            category=cls_out["category"],
            urgency=cls_out["urgency"],
            sentiment=cls_out["sentiment"],
            likes=mention.likes,
            retweets=mention.retweets,
            customer_followers=cust.followers if cust else 0,
            customer_verified=cust.verified if cust else False,
            customer_tenure_months=cust.tenure_months if cust else 0,
            customer_arpu_naira=cust.arpu_naira if cust else 0,
            prior_complaints_30d=prior,
        )
    )

    offer = ""
    if level in ("HIGH", "CRITICAL"):
        offer = churn.suggest_offer(
            cls_out["category"],
            cust.arpu_naira if cust else 0,
        )

    cls = models.Classification(
        mention_id=mention.id,
        category=cls_out["category"],
        urgency=cls_out["urgency"],
        pathway=cls_out["pathway"],
        sentiment=cls_out["sentiment"],
        language=cls_out.get("language", "en"),
        confidence=float(cls_out.get("confidence", 0.8)),
        churn_risk=score,
        risk_level=level,
        risk_factors="\n".join(factors),
        ai_summary=cls_out.get("ai_summary", ""),
        ai_reply=cls_out.get("ai_reply", ""),
        suggested_offer=offer,
    )
    db.add(cls)
    db.flush()

    pathway = cls_out["pathway"]
    needs_human = pathway in ("AGENT_PING", "ESCALATE_FLAG") or level in ("HIGH", "CRITICAL")
    if needs_human and mention.escalation is None:
        db.add(models.Escalation(mention_id=mention.id, status="QUEUED",
                                 queued_at=datetime.utcnow()))
    elif pathway == "AUTO_REPLY":
        db.add(models.AutoReply(mention_id=mention.id, body=cls_out.get("ai_reply", ""),
                                simulated=True))

    db.commit()
    db.refresh(cls)
    return cls


def process_unclassified(db: Session) -> int:
    """Process every mention that doesn't yet have a classification. Returns count."""
    pending = (
        db.query(models.Mention)
        .filter(~models.Mention.classification.has())
        .order_by(models.Mention.posted_at.asc())
        .all()
    )
    n = 0
    for m in pending:
        process_mention(db, m)
        n += 1
    return n
