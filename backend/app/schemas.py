from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class CustomerOut(BaseModel):
    id: int
    handle: str
    display_name: str
    msisdn: str
    region: str
    tenure_months: int
    arpu_naira: int
    verified: bool
    followers: int

    class Config:
        from_attributes = True


class ClassificationOut(BaseModel):
    category: str
    urgency: int
    pathway: str
    sentiment: str
    language: str
    confidence: float
    churn_risk: int
    risk_level: str
    risk_factors: list[str]
    ai_summary: str
    ai_reply: str
    suggested_offer: str

    class Config:
        from_attributes = True


class EscalationOut(BaseModel):
    id: int
    status: str
    assigned_to: str
    queued_at: datetime
    accepted_at: datetime | None
    resolved_at: datetime | None
    notes: str
    final_reply: str

    class Config:
        from_attributes = True


class MentionOut(BaseModel):
    id: int
    tweet_id: str
    text: str
    posted_at: datetime
    likes: int
    retweets: int
    replies: int
    url: str
    platform: str = "x"
    customer: CustomerOut | None
    classification: ClassificationOut | None
    escalation: EscalationOut | None

    class Config:
        from_attributes = True


class MentionListOut(BaseModel):
    items: list[MentionOut]
    total: int


class QueueItemOut(BaseModel):
    escalation_id: int
    mention: MentionOut
    queued_at: datetime
    status: str
    assigned_to: str


class QueueOut(BaseModel):
    items: list[QueueItemOut]
    total: int


class QueueAction(BaseModel):
    action: Literal["accept", "resolve", "dismiss"]
    agent: str = "agent.demo"
    notes: str = ""
    final_reply: str = ""


class ReplyDraftIn(BaseModel):
    body: str | None = None


class ReplyPostIn(BaseModel):
    body: str


class StatsOut(BaseModel):
    total_mentions_24h: int
    auto_resolved_24h: int
    escalated_24h: int
    avg_response_seconds: int
    auto_resolve_rate: float
    by_category: list[dict]
    by_pathway: list[dict]
    by_platform: list[dict]
    timeseries: list[dict]
    top_risk: list[dict]


class PriorityRow(BaseModel):
    category: str
    volume: int
    avg_urgency: float
    sentiment_trend: float
    resolution_rate: float
    score: float
    recommended_action: str
    owner_team: str


class HeatmapCell(BaseModel):
    region: str
    arpu_band: str
    customers: int
    avg_risk: float
    critical_count: int


class ScrapeRequest(BaseModel):
    handle: str | None = None
    keywords: list[str] | None = None
    max_items: int = 25
