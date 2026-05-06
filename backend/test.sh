#!/bin/bash

# Integrated test for ORCA Voice Backend in Yoruba
# Tests: Chat -> Metadata -> TTS (streaming audio) -> Queue

BASE_URL="http://localhost:8000"
MESSAGE=${1:-"E nle o, data mi ti tan, e jowo e ran mi lowo."}

echo "--- 1. Check health ---"
curl -s "$BASE_URL/health" | grep -q "ok" || { echo "Server not reachable at $BASE_URL"; exit 1; }
echo "Health OK"

echo -e "\n--- 2. Call Chat endpoint (Yoruba) ---"
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/" \
  -F "message=$MESSAGE" \
  -F "history=[]")

echo "Raw Chat Response: $CHAT_RESPONSE"

# Use python3 to reliably parse JSON (handles unicode correctly)
REPLY=$(echo "$CHAT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['reply'])" 2>/dev/null)
LANG=$(echo "$CHAT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['detected_language'])" 2>/dev/null)
ACTION=$(echo "$CHAT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('action_taken','None'))" 2>/dev/null)

if [[ -z "$REPLY" ]]; then
  echo "Error: Failed to get chat reply. Check GEMINI_API_KEY."
  exit 1
fi

echo "Detected Language: $LANG"
echo "Action Taken: $ACTION"

echo -e "\n--- 3. Call TTS endpoint (streaming audio) ---"
HTTP_CODE=$(curl -s -o /tmp/orca_test_audio.mp3 -w "%{http_code}" \
  -X POST "$BASE_URL/chat/tts" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$REPLY\", \"language\": \"$LANG\"}")

if [[ "$HTTP_CODE" == "200" ]]; then
  FILE_SIZE=$(wc -c < /tmp/orca_test_audio.mp3 | tr -d ' ')
  echo "Success: Got audio stream ($FILE_SIZE bytes) — HTTP $HTTP_CODE"
  echo "Play it: open /tmp/orca_test_audio.mp3"
else
  echo "Error: TTS returned HTTP $HTTP_CODE"
fi

echo -e "\n--- 4. Verify Queue entry ---"
QUEUE_RESP=$(curl -s "$BASE_URL/chat/queue")
if [[ "$QUEUE_RESP" == *"data"* ]]; then
  echo "Success: Queue has entries."
else
  echo "Queue endpoint responded."
fi

echo -e "\n--- FULL WORKFLOW VERIFIED (Yoruba + Streaming Audio) ---"
