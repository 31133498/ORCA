"""Apify-backed X scraper.

Uses apify-client to run an X / Twitter scraper actor (default:
apidojo/tweet-scraper) and normalises the result rows into the shape we
persist as `Mention` rows.

When APIFY_TOKEN is unset (e.g. local hackathon judging without a paid
plan), `run_scrape` returns an empty list and the caller falls back to the
seeded MTN demo dataset, which is rich enough to drive the dashboard.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from dateutil import parser as dt_parser

from .config import settings

log = logging.getLogger("orca.scraper")


def _build_search_terms(handle: str, keywords: list[str] | None) -> list[str]:
    base = [f"@{handle}", f"#{handle}"]
    kws = keywords or [
        "data", "recharge", "billing", "SIM", "fraud",
        "deducted", "expired", "slow", "dropped", "MB gone",
    ]
    return base + [f"{handle} {k}" for k in kws]


def _normalise(row: dict[str, Any]) -> dict[str, Any] | None:
    """Map an Apify tweet-scraper row to the fields we persist."""
    try:
        tweet_id = str(row.get("id") or row.get("tweetId") or row.get("conversationId") or "")
        if not tweet_id:
            return None
        text = row.get("text") or row.get("fullText") or ""
        if not text:
            return None
        author = row.get("author") or {}
        handle = author.get("userName") or row.get("authorUsername") or "anonymous"
        display = author.get("name") or row.get("authorName") or handle
        verified = bool(author.get("isBlueVerified") or author.get("verified") or row.get("verified"))
        followers = int(author.get("followers") or row.get("followers") or 0)
        likes = int(row.get("likeCount") or row.get("favorite_count") or 0)
        retweets = int(row.get("retweetCount") or 0)
        replies = int(row.get("replyCount") or 0)
        created_raw = row.get("createdAt") or row.get("created_at")
        try:
            posted_at = dt_parser.parse(created_raw) if created_raw else datetime.utcnow()
        except Exception:
            posted_at = datetime.utcnow()
        url = row.get("url") or row.get("twitterUrl") or f"https://x.com/{handle}/status/{tweet_id}"
        return {
            "tweet_id": tweet_id,
            "text": text,
            "posted_at": posted_at,
            "likes": likes,
            "retweets": retweets,
            "replies": replies,
            "url": url,
            "in_reply_to": row.get("inReplyToId") or "",
            "author": {
                "handle": handle,
                "display_name": display,
                "verified": verified,
                "followers": followers,
            },
        }
    except Exception as e:
        log.warning("normalise failed: %s", e)
        return None


def run_scrape(*, handle: str | None = None, keywords: list[str] | None = None,
               max_items: int = 25) -> list[dict[str, Any]]:
    """Run the configured Apify actor. Returns [] if no token is configured."""
    if not settings.apify_token:
        log.info("APIFY_TOKEN not set — skipping live scrape")
        return []

    try:
        from apify_client import ApifyClient
    except Exception as e:
        log.warning("apify-client not installed: %s", e)
        return []

    target = handle or settings.operator_handle
    terms = _build_search_terms(target, keywords)

    client = ApifyClient(settings.apify_token)
    actor = client.actor(settings.apify_actor)
    run_input = {
        "searchTerms": terms,
        "maxItems": max_items,
        "sort": "Latest",
        "tweetLanguage": "en",
    }
    log.info("apify run: actor=%s terms=%s max=%s", settings.apify_actor, terms, max_items)
    try:
        run = actor.call(run_input=run_input, timeout_secs=180)
    except Exception as e:
        log.error("apify call failed: %s", e)
        return []
    dataset_id = run.get("defaultDatasetId")
    if not dataset_id:
        return []
    rows = list(client.dataset(dataset_id).iterate_items())
    out: list[dict[str, Any]] = []
    for r in rows:
        n = _normalise(r)
        if n:
            out.append(n)
    return out
