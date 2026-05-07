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
        "platform": getattr(m, "platform", "x"),
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
    platform: str | None = None,
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
    if platform:
        q = q.filter(models.Mention.platform == platform)
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


@router.post("/generate")
def generate_platform_posts(
    platform: str = Query("facebook", regex="^(facebook|instagram|reddit|x)$"),
    count: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """Inject simulated posts from a given platform for demo purposes."""
    from random import Random
    rng = Random()

    _BANK: dict[str, list[tuple]] = {
        "facebook": [
            ("babatundeoshin", "My MTN 5GB data bundle vanished in under 48 hours. I have not streamed video or downloaded large files. @MTNNigeria this is the third incident this month. I am requesting a full refund and an explanation. If unresolved I will file a formal NCC complaint.", 28, 0, 14),
            ("amaka_writes", "I was deducted ₦3,000 for a 'Monthly Premium Bundle' that I never subscribed to. I have called 180 four times this week. Each agent says they will escalate but nothing changes. @MTNNigeria this is unacceptable and borders on fraud.", 61, 0, 23),
            ("naijajourno", "MTN network coverage in Abuja has deteriorated significantly in the past 2 months. I have measured signal strength at multiple locations — down 40% from last year. @MTNNigeria what investment is going into infrastructure? NCC should audit this.", 287, 0, 94),
            ("hauwa_mall", "My SIM has been inactive for 6 days following NIN linking. I run a business. I have visited the MTN shop in Kano twice. The staff cannot help me beyond saying 'wait 24-48 hours'. @MTNNigeria please escalate this case immediately.", 43, 0, 17),
            ("zaratu_n", "After 11 years as an MTN subscriber, the service quality has become unbearable. Poor network, unexplained deductions, and unhelpful customer service. @MTNNigeria I am genuinely considering porting to Airtel next week unless something changes.", 118, 0, 52),
            ("uche_dev", "WARNING: There is an active SIM swap scam targeting MTN numbers in Lagos. I received an OTP I did not request. @MTNNigeria your fraud detection needs urgent improvement. I have reported this but the line is still at risk.", 234, 0, 88),
            ("kemi.tech", "Auto-subscription to 'MTN Xtra Value Plus' cost me ₦500 this morning without consent. Dialing *312# does not cancel it properly. @MTNNigeria please fix this. Your opt-out system is broken.", 37, 0, 15),
            ("chioma_olu", "Positive feedback: the @MTNNigeria agent who handled my complaint today (reference #CMP-29847) was professional, empathetic, and resolved my billing issue within 20 minutes. More agents like this please.", 92, 0, 31),
        ],
        "instagram": [
            ("yemi_b", "@mtnnigeria data gone in 12 hours 😭 bought 3GB yesterday barely touched my phone #MTNNigeria #DataGone #NigeriaProblems", 341, 0, 87),
            ("kemi.tech", "POV: you buy MTN data and it vanishes by morning 🕵️ @mtnnigeria explain yourself #DataTheft #MTNNigeria #Lagos", 512, 0, 134),
            ("oluwafunmi_x", "Network in Ikeja is 0 bars since 6am 📵 @mtnnigeria what's happening?? #NetworkDown #MTNNigeria #Lagos", 289, 0, 76),
            ("emekar", "Just got charged ₦200 for a subscription I never activated 😤 @mtnnigeria this needs to stop #BillingIssue #MTNNigeria", 178, 0, 44),
            ("chioma_olu", "Finally got my MTN issue resolved after 2 weeks 🙏 the escalation team actually came through @mtnnigeria #MTNNigeria #CustomerService", 203, 0, 58),
            ("zaratu_n", "MTN USSD codes down for 3 hours 📱 can't check balance can't buy airtime @mtnnigeria fix this asap #MTNDown #Nigeria", 445, 0, 112),
            ("ibrahim_yola", "Switched to MTN 6 months ago and already considering switching back 😔 poor network everywhere in Adamawa @mtnnigeria #MTNNigeria #Network", 167, 0, 39),
            ("hauwa_mall", "My SIM blocked AGAIN after NIN 😩 @mtnnigeria how many times do I have to verify?? Business is suffering #MTNNigeria #NIN #SIM", 223, 0, 67),
        ],
        "reddit": [
            ("uche_dev", "[r/Nigeria] Documenting MTN data depletion anomalies — join me in reporting to NCC\n\nI've been using NetGuard to monitor my actual data usage vs what MTN reports. Over 3 months I see consistent 35-50% over-reporting by MTN. Has anyone else done this analysis? I want to compile a structured complaint for NCC. Comment below with your data.", 0, 0, 156),
            ("naijajourno", "[r/Lagos] MTN infrastructure decline 2025-2026: A data-driven analysis\n\nI pulled NCC quarterly QoS reports and overlaid them with crowd-sourced network test data from this sub. The results are alarming. MTN's urban network quality scores have dropped 28% since Q2 2024 while subscriber count grew 12%. Full breakdown with charts in comments.", 0, 0, 203),
            ("ibrahim_yola", "[r/Nigeria] PSA: How to identify and cancel unwanted MTN auto-subscriptions\n\nI've compiled every method to check and cancel VAS subscriptions after dealing with mystery deductions for 2 months:\n1. Dial *312# → 3 (Manage subscriptions)\n2. Text 'STOP' to 3123\n3. MyMTN app → Subscriptions tab\n4. If all fail: email vas@mtnnigeria.com with your MSISDN\nSave this post.", 0, 0, 312),
            ("uche_dev", "[r/cybersecurity_ng] MTN SIM swap fraud vector — technical breakdown\n\nReporting an active threat: attackers are using social engineering via MTN retail agents to process fraudulent SIM swaps. Victims lose access to mobile banking within hours. MTN's 24h SIM-lock after swap request is easily bypassed. Tagging @MTNNigeria — please review your agent verification protocol.", 0, 0, 89),
            ("amaka_writes", "[r/personalfinance_ng] Calculating the true cost of MTN's unauthorized subscriptions\n\nI tracked every mystery deduction over 6 months: ₦14,700 in unauthorized VAS charges. Class action anyone? NCC's consumer portal is at ncc.gov.ng/consumer. Filing a formal complaint takes 10 minutes. Let's flood them with data.", 0, 0, 178),
        ],
        "x": [
            ("babatundeoshin", "@MTNNigeria data vanished again. 2GB in 6 hours with just WhatsApp. Fourth time this month. Last warning before I port.", 89, 23, 7),
            ("naijajourno", ".@MTNNigeria network in Abuja been terrible for 2 weeks. Already filed NCC complaint. Others should do the same ncc.gov.ng/consumer", 412, 187, 34),
            ("uche_dev", "@MTNNigeria someone just tried to swap my SIM. Got the OTP without requesting it. URGENT. Please freeze line 0809***55 now.", 234, 98, 19),
            ("zaratu_n", "@MTNNigeria your customer service line has been on hold for 55 minutes. This is 2026. Hire more agents or lose customers.", 156, 44, 12),
            ("kemi.tech", "@MTNNigeria charged me for 3 VAS subscriptions I never activated this week alone. I want a full audit of my account and refund.", 78, 21, 5),
        ],
    }

    posts = _BANK.get(platform, [])
    if not posts:
        return {"inserted": 0, "classified": 0, "platform": platform}

    customers = {c.handle: c for c in db.query(models.Customer).all()}
    now = datetime.utcnow()
    inserted = 0
    selected = rng.choices(posts, k=min(count, len(posts)))

    for idx, (handle, text, likes, retweets, replies) in enumerate(selected):
        cust = customers.get(handle)
        uid = f"gen-{platform}-{int(now.timestamp())}-{idx}"
        if db.query(models.Mention).filter_by(tweet_id=uid).first():
            continue
        platform_urls = {
            "facebook": f"https://facebook.com/MTNNigeria/posts/{uid}",
            "instagram": f"https://instagram.com/p/{uid}",
            "reddit": f"https://reddit.com/r/Nigeria/comments/{uid}",
            "x": f"https://x.com/{handle}/status/{uid}",
        }
        m = models.Mention(
            tweet_id=uid,
            customer_id=cust.id if cust else None,
            text=text,
            posted_at=now - timedelta(minutes=rng.randint(1, 90)),
            likes=likes,
            retweets=retweets,
            replies=replies,
            url=platform_urls.get(platform, ""),
            raw_source="generated",
            platform=platform,
        )
        db.add(m)
        inserted += 1

    db.commit()
    classified = services.process_unclassified(db)
    return {"inserted": inserted, "classified": classified, "platform": platform}


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
