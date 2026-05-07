"""Churn risk scoring per PRD section 5.3.

Inputs: complaint category, urgency, customer profile, historical complaint count.
Output: 0-100 composite score + risk level + human-readable factors.
"""

from dataclasses import dataclass

# Category weight on churn (PRD 5.3.1)
CATEGORY_WEIGHT = {
    "Data Depletion": 22,
    "Network / Connectivity": 14,
    "Billing & Charges": 22,
    "SIM & Account Issues": 22,
    "Recharge & Vouchers": 8,
    "Service Activation": 12,
    "Fraud & Security": 32,
    "Customer Service Complaint": 18,
    "General Rant / Feedback": 10,
}

CATEGORY_AUTO_RESOLVE = {
    "Data Depletion": "auto",
    "Network / Connectivity": "partial",
    "Billing & Charges": "partial",
    "SIM & Account Issues": "escalate",
    "Recharge & Vouchers": "auto",
    "Service Activation": "auto",
    "Fraud & Security": "escalate-urgent",
    "Customer Service Complaint": "partial",
    "General Rant / Feedback": "auto",
}

CATEGORY_RISK_TIER = {
    "Data Depletion": "HIGH",
    "Network / Connectivity": "MEDIUM",
    "Billing & Charges": "HIGH",
    "SIM & Account Issues": "HIGH",
    "Recharge & Vouchers": "LOW",
    "Service Activation": "MEDIUM",
    "Fraud & Security": "CRITICAL",
    "Customer Service Complaint": "HIGH",
    "General Rant / Feedback": "LOW-MEDIUM",
}


PLATFORM_REACH_WEIGHT = {
    "facebook": 8,    # ~38-47M Nigerian users — widest mass-market reach
    "instagram": 6,   # ~10M users — younger demographic
    "x": 4,           # ~7.5M users — vocal but smaller
    "reddit": 4,      # niche, tech-savvy
}


@dataclass
class ChurnInput:
    category: str
    urgency: int
    sentiment: str
    likes: int
    retweets: int
    customer_followers: int
    customer_verified: bool
    customer_tenure_months: int
    customer_arpu_naira: int
    prior_complaints_30d: int
    platform: str = "x"


def score_churn(inp: ChurnInput) -> tuple[int, str, list[str]]:
    factors: list[str] = []
    score = 0

    # 1. Category severity contribution (0-32)
    cat_w = CATEGORY_WEIGHT.get(inp.category, 12)
    score += cat_w
    factors.append(f"Category weight: {inp.category} (+{cat_w})")

    # 2. Urgency 1-5 → 0-20
    urg = max(0, min(5, inp.urgency))
    urg_contrib = urg * 4
    score += urg_contrib
    factors.append(f"Urgency level {urg}/5 (+{urg_contrib})")

    # 3. Sentiment
    if inp.sentiment == "negative":
        score += 8
        factors.append("Negative sentiment (+8)")
    elif inp.sentiment == "positive":
        score -= 4
        factors.append("Positive sentiment (-4)")

    # 4. Repeat complainer
    if inp.prior_complaints_30d >= 3:
        score += 14
        factors.append(f"{inp.prior_complaints_30d} prior complaints in 30d (+14)")
    elif inp.prior_complaints_30d >= 1:
        score += 6
        factors.append(f"{inp.prior_complaints_30d} prior complaint(s) in 30d (+6)")

    # 5. Engagement velocity (viral risk)
    engagement = inp.likes + inp.retweets * 2
    if engagement >= 200:
        score += 10
        factors.append(f"High engagement ({engagement} signals) (+10)")
    elif engagement >= 50:
        score += 5
        factors.append(f"Moderate engagement ({engagement} signals) (+5)")

    # 6. Account influence
    if inp.customer_verified:
        score += 8
        factors.append("Verified account (+8)")
    if inp.customer_followers >= 50000:
        score += 6
        factors.append(f"{inp.customer_followers:,} followers (+6)")

    # 7. Platform reach risk — wider audience = higher reputational exposure
    plat_w = PLATFORM_REACH_WEIGHT.get(inp.platform, 4)
    score += plat_w
    factors.append(f"Public {inp.platform.title()} channel (+{plat_w})")

    # 8. ARPU and tenure adjust threshold sensitivity
    if inp.customer_arpu_naira >= 8000 and inp.customer_tenure_months >= 24:
        score += 6
        factors.append("High-value long-tenure subscriber (+6)")
    elif inp.customer_tenure_months <= 3:
        score -= 4
        factors.append("New subscriber, lower ARPU at risk (-4)")

    score = max(0, min(100, score))

    if score >= 90:
        level = "CRITICAL"
    elif score >= 70:
        level = "HIGH"
    elif score >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"

    return score, level, factors


def suggest_offer(category: str, arpu_naira: int) -> str:
    """Per PRD 5.3.3 — pick a retention offer template by complaint and ARPU."""
    tier_high = arpu_naira >= 8000
    if category == "Data Depletion":
        return "5GB bonus data on next recharge" if tier_high else "1.5GB bonus data on next recharge"
    if category == "Billing & Charges":
        return "Refund + 200 free minutes" if tier_high else "Refund + 50 free minutes"
    if category == "Network / Connectivity":
        return "₦1,500 airtime credit + priority routing on engineering ticket"
    if category == "SIM & Account Issues":
        return "VIP SIM-swap with retention call within 1h"
    if category == "Customer Service Complaint":
        return "Senior-agent callback + ₦1,000 goodwill airtime"
    if category == "Fraud & Security":
        return "Account freeze + immediate fraud team callback"
    if category == "Recharge & Vouchers":
        return "Auto-reconciliation + ₦200 goodwill credit"
    if category == "Service Activation":
        return "Auto-reactivation + 1GB welcome-back data"
    return "Personalised retention call within 24h"
