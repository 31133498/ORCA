<<<<<<< HEAD
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Customer(Base):
    """A telecom subscriber whose tweets we ingest. Identified by X handle."""

    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    handle: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(128), default="")
    msisdn: Mapped[str] = mapped_column(String(32), default="")
    region: Mapped[str] = mapped_column(String(64), default="")
    tenure_months: Mapped[int] = mapped_column(Integer, default=0)
    arpu_naira: Mapped[int] = mapped_column(Integer, default=0)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    followers: Mapped[int] = mapped_column(Integer, default=0)

    mentions: Mapped[list["Mention"]] = relationship(back_populates="customer")


class Mention(Base):
    """A single ingested tweet that mentions the operator."""

    __tablename__ = "mentions"

    id: Mapped[int] = mapped_column(primary_key=True)
    tweet_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    posted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    likes: Mapped[int] = mapped_column(Integer, default=0)
    retweets: Mapped[int] = mapped_column(Integer, default=0)
    replies: Mapped[int] = mapped_column(Integer, default=0)
    in_reply_to: Mapped[str] = mapped_column(String(64), default="")
    url: Mapped[str] = mapped_column(String(512), default="")
    raw_source: Mapped[str] = mapped_column(String(32), default="apify")
    ingested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    customer: Mapped[Customer | None] = relationship(back_populates="mentions")
    classification: Mapped["Classification | None"] = relationship(
        back_populates="mention", uselist=False, cascade="all, delete-orphan"
    )
    escalation: Mapped["Escalation | None"] = relationship(
        back_populates="mention", uselist=False, cascade="all, delete-orphan"
    )


class Classification(Base):
    """AI classification result for a mention."""

    __tablename__ = "classifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    mention_id: Mapped[int] = mapped_column(ForeignKey("mentions.id"), unique=True)

    category: Mapped[str] = mapped_column(String(64))  # e.g. "Data Depletion"
    urgency: Mapped[int] = mapped_column(Integer)  # 1-5
    pathway: Mapped[str] = mapped_column(String(32))  # AUTO_REPLY | AGENT_PING | ESCALATE_FLAG
    sentiment: Mapped[str] = mapped_column(String(16))  # negative | neutral | positive
    language: Mapped[str] = mapped_column(String(16), default="en")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)

    churn_risk: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    risk_level: Mapped[str] = mapped_column(String(16), default="LOW")
    risk_factors: Mapped[str] = mapped_column(Text, default="")  # newline-separated reasons

    ai_summary: Mapped[str] = mapped_column(Text, default="")
    ai_reply: Mapped[str] = mapped_column(Text, default="")
    suggested_offer: Mapped[str] = mapped_column(Text, default="")

    classified_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    mention: Mapped[Mention] = relationship(back_populates="classification")


class Escalation(Base):
    """A mention queued for human agent review."""

    __tablename__ = "escalations"

    id: Mapped[int] = mapped_column(primary_key=True)
    mention_id: Mapped[int] = mapped_column(ForeignKey("mentions.id"), unique=True)

    status: Mapped[str] = mapped_column(String(16), default="QUEUED")
    # QUEUED | ACCEPTED | RESOLVED | DISMISSED
    assigned_to: Mapped[str] = mapped_column(String(64), default="")
    queued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    final_reply: Mapped[str] = mapped_column(Text, default="")

    mention: Mapped[Mention] = relationship(back_populates="escalation")


class AutoReply(Base):
    """Auto-replies actually posted by the AI (or simulated for demo)."""

    __tablename__ = "auto_replies"

    id: Mapped[int] = mapped_column(primary_key=True)
    mention_id: Mapped[int] = mapped_column(ForeignKey("mentions.id"))
    body: Mapped[str] = mapped_column(Text)
    posted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    simulated: Mapped[bool] = mapped_column(Boolean, default=True)
=======
from pydantic import BaseModel
from typing import List, Dict, Optional

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []   # [{"role": "user", "content": "..."}, ...]

class ChatResponse(BaseModel):
    reply: str
    classification: str          # DATA_DEPLETION, NETWORK_ISSUE, BILLING, OTHER
    churn_score: int             # 0-100
    summary: str
    detected_language: str       # "en", "yo", "ha"
    action_taken: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    language: str                # "en", "yo", "ha"
    voice_id: Optional[str] = None

class TTSResponse(BaseModel):
    audio_url: str               # URL of generated audio (Spitch returns a direct URL)
    duration_sec: float
>>>>>>> 1913034eb5a34835c31253f370bb57628222bdc3
