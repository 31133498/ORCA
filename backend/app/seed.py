"""MTN Nigeria-flavoured demo seed.

Builds a believable opening dataset: ~24 mentions across all 9 PRD
categories, with realistic engagement, account profiles spread across
Nigerian regions and ARPU bands, and one fraud case that must be hard-routed.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from random import Random

from sqlalchemy.orm import Session

from . import models

_RAND = Random(42)


_CUSTOMERS = [
    # handle, display, msisdn, region, tenure_m, arpu, verified, followers
    ("babatundeoshin", "Babatunde Oshin", "0803******12", "Lagos", 48, 12500, False, 2400),
    ("amaka_writes",   "Amaka Eze",       "0805******87", "Anambra", 30, 6500,  False, 17200),
    ("yemi_b",         "Yemi B.",         "0806******41", "Lagos", 6,  3200,  False, 410),
    ("hauwa_mall",     "Hauwa M.",        "0810******09", "Kano",  62, 9100,  False, 5600),
    ("uche_dev",       "Uche Okafor",     "0809******55", "Lagos", 22, 7800,  True,  61400),
    ("kemi.tech",      "Kemi Adeyemi",    "0807******22", "Oyo",   18, 5400,  False, 940),
    ("emekar",         "Emeka R.",        "0813******78", "Rivers", 4, 2800,  False, 230),
    ("zaratu_n",       "Zaratu N.",       "0816******13", "Kaduna", 11, 4400, False, 880),
    ("naijajourno",    "Tola | Journalist","0708******99","FCT", 84, 14200, True, 128000),
    ("oluwafunmi_x",   "Funmi O.",        "0811******45", "Lagos",  9, 3800,  False, 312),
    ("ibrahim_yola",   "Ibrahim A.",      "0812******71", "Adamawa", 27, 4900, False, 540),
    ("chioma_olu",     "Chioma U.",       "0818******30", "Imo",    52, 8800, False, 1200),
]


# (handle, text, hours_ago, likes, retweets, replies)
_MENTIONS = [
    ("babatundeoshin",
     "@MTNNigeria my 5GB just got wiped out overnight without me browsing. Third time this month. Refund or I’m porting to Airtel today.",
     0.6, 142, 38, 12),
    ("amaka_writes",
     "@MTNNigeria charged me ₦1,500 for a subscription I never asked for. This is the 4th deduction this week. Y’all are stealing.",
     1.2, 86, 21, 4),
    ("yemi_b",
     "MTN network in Yaba is dead since morning. Can’t make calls, can’t even open WhatsApp. @MTNNigeria what’s going on?",
     2.1, 18, 3, 1),
    ("hauwa_mall",
     "@MTNNigeria my SIM was barred during NIN linking 3 days ago. Nobody is responding. I run a business on this number, abeg.",
     3.4, 42, 9, 3),
    ("uche_dev",
     "@MTNNigeria I just got an alert that someone is trying to swap my SIM and I never made that request. Fraud!! Please freeze the line now.",
     0.3, 312, 124, 41),
    ("kemi.tech",
     "Recharged ₦1000 30 mins ago and the airtime hasn’t reflected. @MTNNigeria please reverse it.",
     1.7, 11, 1, 0),
    ("emekar",
     "@MTNNigeria why did you auto-subscribe me to caller tunes again? I’ve cancelled this service four times.",
     4.0, 26, 5, 2),
    ("zaratu_n",
     "Called @MTNNigeria support 3 times today. Each agent is ruder than the last. The last one literally hung up. Disgraceful.",
     5.5, 73, 14, 6),
    ("naijajourno",
     "@MTNNigeria your network in Abuja Central is unusable today. Already missed 2 interviews. NCC needs to step in.",
     0.9, 1240, 412, 88),
    ("oluwafunmi_x",
     "@MTNNigeria I love how my data finishes the moment I sleep with the phone face down. Magic data plan. 😩",
     6.0, 9, 0, 0),
    ("ibrahim_yola",
     "@MTNNigeria my data bundle expired 2 days early. I bought it on the 30th and it ended on the 27th of next month. Wahala.",
     8.0, 14, 2, 1),
    ("chioma_olu",
     "Big up @MTNNigeria customer care today, the agent (Funmi) actually solved my SIM swap in 10 minutes. Pleasant surprise.",
     12.0, 55, 4, 7),
    ("babatundeoshin",
     "@MTNNigeria another day, another ‘insufficient balance’ message after I just topped up ₦2000. Where is my money?",
     14.0, 22, 5, 1),
    ("uche_dev",
     "@MTNNigeria the unauthorised SIM swap attempt is still showing in my dashboard. Why can’t I reach a human?",
     0.5, 188, 64, 22),
    ("amaka_writes",
     "@MTNNigeria please STOP charging me ₦50 every Monday for ‘MyMTN bonus’ I never opted into. I’ve sent STOP three times.",
     22.0, 41, 8, 3),
    ("yemi_b",
     "MTN in Surulere — calls drop after 30 seconds. Every. Single. Time. @MTNNigeria",
     20.0, 16, 2, 0),
    ("kemi.tech",
     "@MTNNigeria my SIM got blocked even though my NIN is linked. App says ‘active’, calls say ‘not authorised’. Help.",
     18.0, 28, 5, 2),
    ("hauwa_mall",
     "@MTNNigeria I’ve been on hold 47 minutes. I have a business to run. This is unacceptable customer service.",
     16.0, 19, 4, 1),
    ("emekar",
     "@MTNNigeria 1GB I bought yesterday is already showing 12MB. I literally only used WhatsApp. Refund please.",
     11.0, 33, 6, 2),
    ("naijajourno",
     "Quick shoutout to @MTNNigeria — coverage in Wuse 2 finally back. Now do the same for Garki.",
     30.0, 240, 19, 12),
    ("zaratu_n",
     "@MTNNigeria your USSD *312# has been broken since morning. Can’t check my balance, can’t recharge.",
     9.5, 48, 11, 4),
    ("oluwafunmi_x",
     "@MTNNigeria I’m switching to Glo this weekend if my line isn’t restored. 4 days without service.",
     7.5, 102, 33, 8),
    ("ibrahim_yola",
     "@MTNNigeria the Pulse subscription you renewed without asking — that’s ₦100 stolen. Reverse it.",
     5.0, 27, 4, 1),
    ("chioma_olu",
     "@MTNNigeria network in Owerri is patchy again. 2 bars indoors, 0 bars outdoors. Engineers needed.",
     2.6, 23, 3, 0),
]


def _ensure_customer(db: Session, row: tuple) -> models.Customer:
    handle, display, msisdn, region, tenure, arpu, verified, followers = row
    cust = db.query(models.Customer).filter_by(handle=handle).first()
    if cust:
        return cust
    cust = models.Customer(
        handle=handle, display_name=display, msisdn=msisdn,
        region=region, tenure_months=tenure, arpu_naira=arpu,
        verified=verified, followers=followers,
    )
    db.add(cust)
    db.flush()
    return cust


def seed_demo(db: Session) -> int:
    """Insert mentions+customers if the DB is empty. Returns rows created."""
    if db.query(models.Mention).count() > 0:
        return 0

    customers = {row[0]: _ensure_customer(db, row) for row in _CUSTOMERS}

    now = datetime.utcnow()
    created = 0
    for i, (handle, text, hours_ago, likes, retweets, replies) in enumerate(_MENTIONS):
        cust = customers[handle]
        m = models.Mention(
            tweet_id=f"demo-{i+1}",
            customer_id=cust.id,
            text=text,
            posted_at=now - timedelta(hours=hours_ago),
            likes=likes,
            retweets=retweets,
            replies=replies,
            url=f"https://x.com/{handle}/status/demo-{i+1}",
            raw_source="seed",
        )
        db.add(m)
        created += 1

    db.commit()
    return created
