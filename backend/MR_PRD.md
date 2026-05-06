# ORCA Voice Demo — Refined Hackathon Plan

## The refined plan

### Core decision: Option C with Option D as instant fallback

Go with browser mic + Spitch TTS as the primary. Option D (scripted playback) should live on the *same page* as a toggle — so if the mic fails or the judge's laptop has no mic, you flip a switch and the demo keeps going seamlessly. Never tell the judge you're switching to a fallback. It just works.

---

### The "wow" stack — what makes judges pause

**1. Spitch.app for TTS, not browser SpeechSynthesis**

Browser SpeechSynthesis sounds like a GPS. Spitch has actual Nigerian-accent English, Yoruba, and Hausa voices. The moment the AI responds in Yoruba or accented English, the demo room goes quiet. That's your money moment. Set it up: call the Spitch REST API with the response text + language code, get back an audio URL, play it. Maybe 20 lines of code.

**2. Language detection built into Gemini**

Add one line to the system prompt: *"Detect the language the user spoke in. If Yoruba or Hausa, respond in that language. Always tell the backend what language was detected."* Then route the TTS call to the correct Spitch voice. Now Baba Sikira can say *"Data mi ti pari"* (Yoruba: "my data is finished") and the AI responds in Yoruba. That's the differentiator no other team will have.

**3. The churn score animates live**

Don't just show 88. Show a gauge or bar that updates in real time after each user message. Every frustrated word the user says, the needle creeps up. Judges love things that move.

**4. Baba Sikira's profile is always visible**

On the left side of the demo page, show his card permanently: name, plan, last recharge, current balance, past issue. When the AI references "₦500 yesterday", the judge can look left and verify it. That confirms the AI is actually using real account data, not hallucinating.

---

### Your actual implementation order (2–3 hours max)

**Hour 1 — Get the AI talking (core loop)**

Build the FastAPI endpoint first. Hardcode Baba Sikira's profile. Write the Gemini system prompt. Ask Gemini to return its reply *plus* a JSON block at the end with `classification`, `churn_score`, and `summary`. Parse them apart. Return both to the frontend. Test this endpoint with curl or Postman before touching the frontend. This is the hardest part — get it working in isolation first.

**Hour 2 — Get the browser talking**

Wire the Web Speech API to capture mic input and POST to your FastAPI endpoint. Display the AI's text reply in a transcript div. Add Spitch TTS: take the reply text, POST to Spitch, get audio back, play it. Add the Baba Sikira profile card on the left. Add the animated churn gauge. Done — you now have a working demo.

**Hour 3 — Polish + dashboard integration**

Add language detection. Wire the classified output to Firebase (or a shared JSON endpoint). Coordinate with the social/X engineer on the queue schema — share the exact JSON structure shown in the original plan. Build a minimal dashboard view showing the unified complaint queue. Add Option D fallback (a "Simulate" button that runs a scripted conversation automatically).

---

### Africa's Talking — honest assessment

You can actually do this, and it would be genuinely impressive. Africa's Talking voice calls work like this: someone calls your MTN number → AT forwards the call to a webhook URL (your FastAPI endpoint) → your server responds with TTS → caller hears it. The problem is latency and setup time. You'd need: an AT account approved, a phone number purchased, a public URL (ngrok works), and call flow logic. That's 3–4 hours on its own *if everything works first try*, which it usually doesn't.

The browser mic approach gives 80% of the impressiveness in 20% of the time. The judges are evaluating the idea and the AI behavior — not whether the call came through a SIP trunk. Skip AT for Saturday.

---

### The Gemini system prompt (exact structure)

The prompt needs four layers in this order:

**Layer 1 — Role**: "You are an MTN Nigeria AI support agent named ORCA."

**Layer 2 — Account data**: Baba Sikira's full profile injected as a JSON block that ORCA "sees."

**Layer 3 — Behavior rules**: Keep replies to 1–2 sentences. Reference account details naturally. Sound warm and human, never robotic. Match the user's language.

**Layer 4 — Structured output**: After every reply, append a JSON block with classification, churn score (0–100), and a one-line summary. The frontend splits on a separator to parse these apart.

---

### Sharing the queue with the social/X engineer

This is critical to do *today*, not Saturday morning. Agree on the exact JSON schema (the one in the original plan is good). Pick one shared store — Firebase Realtime Database is the fastest to set up and has a free tier. Your voice backend writes to `/queue/{timestamp}`. Their X/social backend writes to the same collection. The shared dashboard reads from both. One unified feed.

---

### What the judge sees (the script)

You speak: *"My data is disappearing."* → Spitch plays a Nigerian-accented response referencing the ₦500 recharge and 1.5GB balance → churn gauge ticks up → transcript fills in → the left panel shows Baba Sikira's card → the dashboard shows DATA_DEPLETION, score 88. Then you switch the language to Yoruba, say something, and the AI responds in Yoruba. That's the demo. It takes 60 seconds and it's unforgettable.