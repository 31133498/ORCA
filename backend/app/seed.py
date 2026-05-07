"""MTN Nigeria-flavoured demo seed.

Builds a believable opening dataset: ~50 mentions across all 9 PRD
categories and all 4 platforms, with realistic engagement, account
profiles spread across Nigerian regions and ARPU bands.
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
    # Additional customers for platform diversity
    ("seun_abk",       "Seun Abikoye",   "0802******34", "Lagos",  15, 6200, False, 3800),
    ("fatima_kano",    "Fatima B.",       "0811******62", "Kano",   38, 7300, False, 2100),
    ("chidi_portharcourt", "Chidi O.",   "0703******88", "Rivers", 20, 5900, False, 710),
    ("ngozi_enugu",    "Ngozi A.",        "0815******47", "Enugu",  44, 8400, False, 1560),
    ("kunle_ibadan",   "Kunle F.",        "0806******91", "Oyo",    8,  3100, False, 289),
    ("adaeze_abuja",   "Adaeze N.",       "0817******05", "FCT",    29, 9800, False, 4200),
    ("musa_kaduna",    "Musa S.",         "0813******23", "Kaduna", 55, 6700, False, 960),
    ("blessing_delta", "Blessing O.",     "0808******76", "Delta",  17, 4100, False, 445),
]


# (handle, text, hours_ago, likes, retweets, replies) — X/Twitter mentions
_MENTIONS_X = [
    ("babatundeoshin",
     "@MTNNigeria my 5GB just got wiped out overnight without me browsing. Third time this month. Refund or I'm porting to Airtel today.",
     0.6, 142, 38, 12),
    ("amaka_writes",
     "@MTNNigeria charged me ₦1,500 for a subscription I never asked for. This is the 4th deduction this week. Y'all are stealing.",
     1.2, 86, 21, 4),
    ("yemi_b",
     "MTN network in Yaba is dead since morning. Can't make calls, can't even open WhatsApp. @MTNNigeria what's going on?",
     2.1, 18, 3, 1),
    ("hauwa_mall",
     "@MTNNigeria my SIM was barred during NIN linking 3 days ago. Nobody is responding. I run a business on this number, abeg.",
     3.4, 42, 9, 3),
    ("uche_dev",
     "@MTNNigeria I just got an alert that someone is trying to swap my SIM and I never made that request. Fraud!! Please freeze the line now.",
     0.3, 312, 124, 41),
    ("kemi.tech",
     "Recharged ₦1000 30 mins ago and the airtime hasn't reflected. @MTNNigeria please reverse it.",
     1.7, 11, 1, 0),
    ("emekar",
     "@MTNNigeria why did you auto-subscribe me to caller tunes again? I've cancelled this service four times.",
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
     "@MTNNigeria another day, another 'insufficient balance' message after I just topped up ₦2000. Where is my money?",
     14.0, 22, 5, 1),
    ("uche_dev",
     "@MTNNigeria the unauthorised SIM swap attempt is still showing in my dashboard. Why can't I reach a human?",
     0.5, 188, 64, 22),
    ("amaka_writes",
     "@MTNNigeria please STOP charging me ₦50 every Monday for 'MyMTN bonus' I never opted into. I've sent STOP three times.",
     22.0, 41, 8, 3),
    ("yemi_b",
     "MTN in Surulere — calls drop after 30 seconds. Every. Single. Time. @MTNNigeria",
     20.0, 16, 2, 0),
    ("kemi.tech",
     "@MTNNigeria my SIM got blocked even though my NIN is linked. App says 'active', calls say 'not authorised'. Help.",
     18.0, 28, 5, 2),
    ("hauwa_mall",
     "@MTNNigeria I've been on hold 47 minutes. I have a business to run. This is unacceptable customer service.",
     16.0, 19, 4, 1),
    ("emekar",
     "@MTNNigeria 1GB I bought yesterday is already showing 12MB. I literally only used WhatsApp. Refund please.",
     11.0, 33, 6, 2),
    ("naijajourno",
     "Quick shoutout to @MTNNigeria — coverage in Wuse 2 finally back. Now do the same for Garki.",
     30.0, 240, 19, 12),
    ("zaratu_n",
     "@MTNNigeria your USSD *312# has been broken since morning. Can't check my balance, can't recharge.",
     9.5, 48, 11, 4),
    ("oluwafunmi_x",
     "@MTNNigeria I'm switching to Glo this weekend if my line isn't restored. 4 days without service.",
     7.5, 102, 33, 8),
    ("ibrahim_yola",
     "@MTNNigeria the Pulse subscription you renewed without asking — that's ₦100 stolen. Reverse it.",
     5.0, 27, 4, 1),
    ("chioma_olu",
     "@MTNNigeria network in Owerri is patchy again. 2 bars indoors, 0 bars outdoors. Engineers needed.",
     2.6, 23, 3, 0),
]


# (handle, text, hours_ago, likes, retweets, replies, platform, url)
_MENTIONS_MULTI = [
    # ── FACEBOOK ── formal, longer, high reaction counts
    ("babatundeoshin",
     "Good morning. I need to report that my MTN 5GB data bundle purchased on Monday has already depleted by Wednesday with minimal usage. I have not streamed any video or downloaded any files. Please investigate @MTNNigeria. This is the third time this quarter. #MTNNigeria",
     3.5, 284, 0, 47, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-1"),
    ("amaka_writes",
     "Attention @MTNNigeria — I was charged ₦2,500 for a 'Weekly Xtra Value' bundle I never subscribed to. I have been calling 180 for two days with no resolution. I have screenshot proof of the unauthorized deduction. Please refund immediately or I will escalate to NCC.",
     5.0, 412, 0, 89, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-2"),
    ("naijajourno",
     "Network in Abuja Central has been extremely poor since yesterday. Multiple businesses in this area are losing money because MTN calls keep dropping. @MTNNigeria this is affecting thousands of subscribers. NCC should investigate this pattern.",
     2.0, 1243, 0, 312, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-3"),
    ("hauwa_mall",
     "My SIM has been blocked for 5 days now despite completing NIN verification. I run a fashion business from this number and I am losing income daily. @MTNNigeria I have visited the shop twice and called 180 four times. Nobody is helping. Please escalate urgently.",
     4.2, 567, 0, 134, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-4"),
    ("zaratu_n",
     "I want to formally complain about @MTNNigeria customer service. The agent I spoke with today was dismissive and ended the call without resolving my issue. I have been a loyal subscriber for over 10 years. This treatment is unacceptable. I am considering porting to Airtel.",
     6.8, 893, 0, 218, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-5"),
    ("seun_abk",
     "To whom it may concern at @MTNNigeria — my 20GB Night Plan data keeps disappearing before midnight. I am a remote worker and I depend on this plan for my livelihood. Three nights in a row this has happened. I need a full refund and explanation.",
     9.0, 341, 0, 97, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-6"),
    ("fatima_kano",
     "@MTNNigeria please address the service outage in Kano State. Small businesses in Sabon Gari market have been without reliable MTN connectivity for 48 hours. Many of us use your POS for transactions. We are losing customers. Please deploy engineers urgently.",
     7.5, 782, 0, 203, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-7"),
    ("ngozi_enugu",
     "I am sharing this publicly because private complaints have not worked. @MTNNigeria has charged me for 'Caller Ring Back Tunes' 6 months in a row despite repeated cancellation requests. I have all call records and screenshots. This will be sent to NCC and Consumer Protection Council.",
     11.0, 629, 0, 176, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-8"),
    ("musa_kaduna",
     "MTN network quality in Kaduna South has dropped drastically this week. As someone who uses mobile banking and runs an online business, this is directly costing me money. @MTNNigeria when will you send engineers to address the infrastructure in this area?",
     13.5, 418, 0, 112, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-9"),
    ("adaeze_abuja",
     "Positive feedback: @MTNNigeria resolved my port-in issue within 2 hours after I posted here yesterday. The social media team was responsive and the technical team followed up. This is how customer service should work. Thank you Chukwuemeka from the escalation desk.",
     18.0, 532, 0, 89, "facebook",
     "https://facebook.com/MTNNigeria/posts/fb-seed-10"),

    # ── INSTAGRAM ── short, emoji-heavy, hashtag-dense
    ("yemi_b",
     "@mtnnigeria my data just finished in 24 hours 😭 bought 2GB and barely used it #MTNNigeria #DataTheft #NigeriaProblems #DataDepletion",
     1.5, 1847, 0, 203, "instagram",
     "https://instagram.com/p/ig-seed-1"),
    ("kemi.tech",
     "Why does @mtnnigeria keep charging me for services I never signed up for?? 3rd time this month 😤 #MTNNigeria #BillingIssue #ConsumerRights",
     3.1, 2341, 0, 412, "instagram",
     "https://instagram.com/p/ig-seed-2"),
    ("oluwafunmi_x",
     "Network in VI is completely dead 📵 @mtnnigeria please fix this asap! I'm losing money 💸 #MTNNigeria #Lagos #NetworkDown",
     0.8, 3102, 0, 678, "instagram",
     "https://instagram.com/p/ig-seed-3"),
    ("emekar",
     "3 months with @mtnnigeria and already thinking of porting 😒 service quality keeps dropping #MTNNigeria #Airtel #PortingOut #Nigeria",
     7.2, 1562, 0, 287, "instagram",
     "https://instagram.com/p/ig-seed-4"),
    ("chioma_olu",
     "USSD codes not working since morning @mtnnigeria 📱 can't check balance, can't buy data #MTNNigeria #USSDDown #FixIt",
     2.3, 2089, 0, 456, "instagram",
     "https://instagram.com/p/ig-seed-5"),
    ("seun_abk",
     "My SIM just got deactivated out of nowhere 😳 I've been an @mtnnigeria customer for 5 years #MTNNigeria #SIMIssue #Nigeria",
     4.7, 1124, 0, 234, "instagram",
     "https://instagram.com/p/ig-seed-6"),
    ("blessing_delta",
     "POV: you buy ₦5000 worth of data and it finishes in 2 days 😭 @mtnnigeria is not explaining anything #DataBandits #MTNNigeria #ConsumerRights",
     6.1, 4712, 0, 891, "instagram",
     "https://instagram.com/p/ig-seed-7"),
    ("fatima_kano",
     "Called MTN customer care 5 times today 📞 nobody picked after the 1st minute 😡 @mtnnigeria #PoorService #MTNNigeria #Nigeria",
     8.4, 1893, 0, 378, "instagram",
     "https://instagram.com/p/ig-seed-8"),
    ("kunle_ibadan",
     "Network showing 4G but speed test says 0.2Mbps? 🤔 @mtnnigeria what is happening please #MTNNigeria #SlowData #Ibadan",
     5.6, 2234, 0, 512, "instagram",
     "https://instagram.com/p/ig-seed-9"),
    ("chidi_portharcourt",
     "Recharged ₦2000 and got ₦0 airtime 😤 @mtnnigeria this is fraud!! #MTNNigeria #Recharge #PH #RechargeIssue",
     1.1, 3478, 0, 734, "instagram",
     "https://instagram.com/p/ig-seed-10"),

    # ── REDDIT ── analytical, community-oriented, high comment counts
    ("uche_dev",
     "[r/Nigeria] MTN data bundle depletion pattern — collecting data to report to NCC. I've been tracking my MTN data usage with third-party apps for 3 months and consistently see 30-40% more depletion than my actual usage. Anyone else seeing this? Planning to compile and submit to NCC. DM me with your data.",
     8.5, 0, 0, 287, "reddit",
     "https://reddit.com/r/Nigeria/comments/rd-seed-1"),
    ("ibrahim_yola",
     "[r/Lagos] PSA: Unauthorized MTN auto-subscriptions on the rise — how to protect yourself. Multiple reports in this sub about surprise ₦100-500 deductions from MTN for 'value-added services'. Here's how to opt out: dial *312# → Manage subscriptions → Cancel all. Spread the word.",
     11.0, 0, 0, 412, "reddit",
     "https://reddit.com/r/Lagos/comments/rd-seed-2"),
    ("naijajourno",
     "[r/Nigeria] Analysis: Why MTN's network quality has declined in 2026 — a data-driven look. I've aggregated NCC quarterly reports and crowd-sourced network quality data from r/Nigeria users. The numbers show a clear degradation in urban areas. Full analysis with charts in comments. MTN needs to invest in infrastructure.",
     15.0, 0, 0, 891, "reddit",
     "https://reddit.com/r/Nigeria/comments/rd-seed-3"),
    ("uche_dev",
     "[r/tech] Serious security concern: MTN SIM swap fraud is becoming systematic. I'm a cybersecurity professional and I've seen 4 cases in my network in the last month where MTN SIM swaps were done without proper verification. MTN's KYC process needs urgent review. Here's how to check if you've been compromised.",
     3.2, 0, 0, 1243, "reddit",
     "https://reddit.com/r/tech/comments/rd-seed-4"),
    ("naijajourno",
     "[r/Nigeria] Megathread: MTN outage map for Nigeria — report your area. Use this thread to report your location and service status. I'll be updating a shared Google map. So far: Lagos Island (down), Abuja Central (degraded), Kano Sabon Gari (down), PH GRA (partial). Tag your LGA.",
     1.8, 0, 0, 567, "reddit",
     "https://reddit.com/r/Nigeria/comments/rd-seed-5"),
    ("ibrahim_yola",
     "[r/Adamawa] MTN coverage in Yola — is it getting worse? Long-time Yola resident here. Used to get solid 4G downtown. Since January it's been 3G at best, edge signal in most of Jimeta. Anyone know if MTN has plans to upgrade the tower infrastructure here? Or should we collectively port to Airtel?",
     19.0, 0, 0, 189, "reddit",
     "https://reddit.com/r/Adamawa/comments/rd-seed-6"),
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

    for i, (handle, text, hours_ago, likes, retweets, replies) in enumerate(_MENTIONS_X):
        cust = customers[handle]
        m = models.Mention(
            tweet_id=f"demo-x-{i+1}",
            customer_id=cust.id,
            text=text,
            posted_at=now - timedelta(hours=hours_ago),
            likes=likes,
            retweets=retweets,
            replies=replies,
            url=f"https://x.com/{handle}/status/demo-x-{i+1}",
            raw_source="seed",
            platform="x",
        )
        db.add(m)
        created += 1

    for i, (handle, text, hours_ago, likes, retweets, replies, platform, url) in enumerate(_MENTIONS_MULTI):
        cust = customers.get(handle)
        if not cust:
            continue
        m = models.Mention(
            tweet_id=f"demo-mp-{i+1}",
            customer_id=cust.id,
            text=text,
            posted_at=now - timedelta(hours=hours_ago),
            likes=likes,
            retweets=retweets,
            replies=replies,
            url=url,
            raw_source="seed",
            platform=platform,
        )
        db.add(m)
        created += 1

    db.commit()
    return created
