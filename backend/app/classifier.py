"""Tweet classifier.

Strategy:
- If ANTHROPIC_API_KEY is set, call Claude with a structured prompt that returns
  JSON ({category, urgency, pathway, sentiment, language, ai_summary,
  ai_reply, suggested_offer}).
- Otherwise, fall back to a deterministic keyword-based mock so the
  hackathon demo runs end-to-end without paid API access.

The mock matches the categories in PRD 5.3.1 well enough to drive a
believable demo on MTN-flavoured complaint text.
"""

from __future__ import annotations

import json
import re

from .config import settings

CATEGORIES = [
    "Data Depletion",
    "Network / Connectivity",
    "Billing & Charges",
    "SIM & Account Issues",
    "Recharge & Vouchers",
    "Service Activation",
    "Fraud & Security",
    "Customer Service Complaint",
    "General Rant / Feedback",
]

PATHWAY_BY_CATEGORY = {
    "Data Depletion": "AUTO_REPLY",
    "Network / Connectivity": "AGENT_PING",
    "Billing & Charges": "AGENT_PING",
    "SIM & Account Issues": "ESCALATE_FLAG",
    "Recharge & Vouchers": "AUTO_REPLY",
    "Service Activation": "AUTO_REPLY",
    "Fraud & Security": "ESCALATE_FLAG",
    "Customer Service Complaint": "AGENT_PING",
    "General Rant / Feedback": "AUTO_REPLY",
}

# Keyword patterns ordered by specificity. First match wins.
_KW_RULES: list[tuple[str, list[str]]] = [
    ("Fraud & Security", ["fraud", "stolen", "hacked", "unauthor", "compromis", "scam"]),
    ("SIM & Account Issues", ["sim swap", "sim card", "blocked", "barred", "nin", "deactivat", "ported"]),
    ("Billing & Charges", ["bill", "charged", "deduct", "tariff", "refund", "subscription", "auto-renew"]),
    ("Data Depletion", ["data finish", "data is gone", "mb gone", "gb gone", "data depleted",
                         "data disappear", "data vanished", "data wiped", "browsing data"]),
    ("Network / Connectivity", ["no signal", "no network", "call drop", "slow", "4g", "5g",
                                 "lte", "cant make calls", "can't make calls", "cant connect"]),
    ("Recharge & Vouchers", ["recharge", "voucher", "pin", "top up", "topup", "airtime not", "card"]),
    ("Service Activation", ["activate", "subscribe", "deactivate", "unsubscribe", "stop", "subbed me"]),
    ("Customer Service Complaint", ["agent", "rude", "hold", "wait", "support", "useless", "ignore"]),
]


def _mock_classify(text: str, *, customer_followers: int = 0,
                   customer_verified: bool = False, likes: int = 0,
                   retweets: int = 0) -> dict:
    t = text.lower()

    category = "General Rant / Feedback"
    for cat, kws in _KW_RULES:
        if any(kw in t for kw in kws):
            category = cat
            break

    # Urgency 1-5 from severity signals + virality
    urgency = 2
    if any(w in t for w in ["urgent", "asap", "immediately", "right now", "emergency"]):
        urgency = max(urgency, 4)
    if any(w in t for w in ["fraud", "stolen", "hacked", "scam"]):
        urgency = 5
    if retweets >= 50 or likes >= 200:
        urgency = max(urgency, 4)
    if customer_verified or customer_followers >= 25000:
        urgency = min(5, urgency + 1)
    if any(w in t for w in ["never again", "porting", "switch to airtel", "switch to glo",
                              "leaving mtn", "leaving you", "ncc"]):
        urgency = max(urgency, 4)

    sentiment = "negative" if re.search(
        r"\b(angry|frustrat|terrible|worst|horrible|nonsense|trash|useless|disappoint|annoy|never again)\b",
        t,
    ) else ("positive" if re.search(r"\b(thank|great|nice|appreciat|love)\b", t) else "neutral")

    language = "en"
    if any(w in t for w in [" abeg", " wahala", " na so", " no de", " sef", " ehn"]):
        language = "pcm"  # Nigerian Pidgin
    elif any(w in t for w in [" oga", " e don ", " no go ", " come dey "]):
        language = "pcm"

    pathway = PATHWAY_BY_CATEGORY.get(category, "AUTO_REPLY")
    if urgency >= 4 and pathway == "AUTO_REPLY":
        pathway = "AGENT_PING"

    summary = _mock_summary(category, text)
    reply = _mock_reply(category, text)

    return {
        "category": category,
        "urgency": urgency,
        "pathway": pathway,
        "sentiment": sentiment,
        "language": language,
        "confidence": 0.78,
        "ai_summary": summary,
        "ai_reply": reply,
    }


def _mock_summary(category: str, text: str) -> str:
    snippet = text[:140].rstrip()
    return f"{category} complaint. Customer wrote: \"{snippet}\". Resolution path follows the standard {category.lower()} workflow."


def _mock_reply(category: str, text: str) -> str:
    base = {
        "Data Depletion": "Apologies for the data issue. Please DM us your registered number so we can investigate the deduction and credit you back.",
        "Network / Connectivity": "We hear you on the network. Please share your location (LGA + landmark) via DM so engineering can prioritise your area.",
        "Billing & Charges": "We're sorry about that. Please DM your registered number with the date and amount and we'll review the deduction immediately.",
        "SIM & Account Issues": "We'll handle this with care. Please DM your registered number and the issue (SIM swap / NIN / barred) and a senior agent will reach you.",
        "Recharge & Vouchers": "Sorry for the recharge issue. Please DM us the voucher PIN and the number you tried to load — we'll reconcile it within minutes.",
        "Service Activation": "We can fix this now. Please DM your number and the service you want stopped or activated.",
        "Fraud & Security": "We take this seriously. A fraud-team agent will DM you within minutes — please do not share OTPs or PINs anywhere.",
        "Customer Service Complaint": "We're sorry for the experience. Please DM your number and a senior agent will personally call you back today.",
        "General Rant / Feedback": "We hear you and we want to do better. DM us your number and we'll personally check what's going on with your line.",
    }.get(category, "Thanks for flagging this. Please DM us your registered number and we'll look into it right away.")
    return base[:240]


# ── Anthropic-backed classifier ───────────────────────────────────────────────


_PROMPT = """You are ORCA, a complaint-classification engine for Nigerian telecom operators.
You will receive one tweet posted at the operator. Classify it and draft a reply.

Categories (pick exactly one):
- Data Depletion
- Network / Connectivity
- Billing & Charges
- SIM & Account Issues
- Recharge & Vouchers
- Service Activation
- Fraud & Security
- Customer Service Complaint
- General Rant / Feedback

Pathways:
- AUTO_REPLY  (low risk, can post a public reply)
- AGENT_PING  (a human agent should send the reply, but it can be drafted)
- ESCALATE_FLAG (sensitive — fraud, security, SIM, public-figure attack — must be human-handled)

Reply style: warm, direct, Nigerian English, max 240 characters, no markdown. Always
ask the customer to DM their registered number before sharing any account detail.

Return JSON only with this shape:
{
  "category": "<one of the 9 categories>",
  "urgency": <1-5>,
  "pathway": "<AUTO_REPLY | AGENT_PING | ESCALATE_FLAG>",
  "sentiment": "<negative | neutral | positive>",
  "language": "<en | pcm | yo | ha>",
  "confidence": <0..1>,
  "ai_summary": "<one sentence summary for an agent>",
  "ai_reply": "<the draft reply, <=240 chars>"
}

Tweet:
"""


def _claude_classify(text: str, **_) -> dict | None:
    try:
        from anthropic import Anthropic
    except Exception:
        return None
    if not settings.anthropic_api_key:
        return None
    try:
        client = Anthropic(api_key=settings.anthropic_api_key)
        msg = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=600,
            messages=[{"role": "user", "content": _PROMPT + text}],
        )
        body = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
        # extract first JSON object
        m = re.search(r"\{.*\}", body, re.DOTALL)
        if not m:
            return None
        data = json.loads(m.group(0))
        if data.get("category") not in CATEGORIES:
            return None
        data.setdefault("confidence", 0.85)
        return data
    except Exception:
        return None


def classify(text: str, *, customer_followers: int = 0, customer_verified: bool = False,
             likes: int = 0, retweets: int = 0) -> dict:
    out = _claude_classify(text)
    if out is None:
        out = _mock_classify(
            text,
            customer_followers=customer_followers,
            customer_verified=customer_verified,
            likes=likes,
            retweets=retweets,
        )
    # safety: fraud/security is ALWAYS escalated (PRD 5.2.3)
    if out["category"] == "Fraud & Security":
        out["pathway"] = "ESCALATE_FLAG"
    return out
