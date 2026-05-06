#!/bin/bash

# ============================================
# ORCA Voice Backend Test Script
# Tests /chat (conversation) and /chat/tts (speech)
# ============================================

# Configuration
HOST="http://localhost:8000"
CHAT_ENDPOINT="$HOST/chat/"
TTS_ENDPOINT="$HOST/chat/tts"
HEALTH_ENDPOINT="$HOST/health"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}jq is not installed. Please install jq to parse JSON responses.${NC}"
    echo "Example: sudo apt install jq   (Ubuntu/Debian)"
    echo "         brew install jq       (macOS)"
    exit 1
fi

# Function to call /chat
call_chat() {
    local message="$1"
    local history="$2"
    
    echo -e "${YELLOW}>>> Sending message:${NC} \"$message\""
    
    # Build JSON payload
    local payload=$(jq -n \
        --arg msg "$message" \
        --argjson hist "$history" \
        '{message: $msg, history: $hist}')
    
    # Call API
    response=$(curl -s -X POST "$CHAT_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    # Check if curl failed
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to connect to $CHAT_ENDPOINT${NC}"
        exit 1
    fi
    
    # Parse response
    reply=$(echo "$response" | jq -r '.reply')
    classification=$(echo "$response" | jq -r '.classification')
    churn_score=$(echo "$response" | jq -r '.churn_score')
    summary=$(echo "$response" | jq -r '.summary')
    detected_language=$(echo "$response" | jq -r '.detected_language')
    
    echo -e "${GREEN}<<< AI Reply:${NC} $reply"
    echo -e "${GREEN}   Classification:${NC} $classification"
    echo -e "${GREEN}   Churn Score:${NC} $churn_score"
    echo -e "${GREEN}   Summary:${NC} $summary"
    echo -e "${GREEN}   Detected Language:${NC} $detected_language"
    echo ""
    
    # Return reply and metadata as JSON for history building
    jq -n \
        --arg reply "$reply" \
        --arg class "$classification" \
        --arg score "$churn_score" \
        --arg sum "$summary" \
        --arg lang "$detected_language" \
        '{reply: $reply, classification: $class, churn_score: $score, summary: $sum, detected_language: $lang}'
}

# Function to test TTS
test_tts() {
    local text="$1"
    local language="$2"
    
    echo -e "${YELLOW}Testing TTS:${NC} text=\"$text\", language=\"$language\""
    
    payload=$(jq -n \
        --arg txt "$text" \
        --arg lang "$language" \
        '{text: $txt, language: $lang}')
    
    response=$(curl -s -X POST "$TTS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}TTS endpoint failed${NC}"
        return
    fi
    
    audio_url=$(echo "$response" | jq -r '.audio_url')
    duration=$(echo "$response" | jq -r '.duration_sec')
    
    echo -e "${GREEN}   Audio URL:${NC} $audio_url"
    echo -e "${GREEN}   Duration:${NC} ${duration}s"
    
    # Optional: play audio if mplayer or afplay is available
    if command -v afplay &> /dev/null && [[ "$audio_url" == http* ]]; then
        echo -e "${YELLOW}   Playing audio...${NC}"
        curl -s "$audio_url" | afplay -t $duration 2>/dev/null &
    elif command -v mplayer &> /dev/null && [[ "$audio_url" == http* ]]; then
        echo -e "${YELLOW}   Playing audio...${NC}"
        curl -s "$audio_url" | mplayer -cache 1024 - 2>/dev/null &
    else
        echo -e "${YELLOW}   (No audio player found; open URL manually to hear)${NC}"
    fi
    echo ""
}

# ========== MAIN TEST SEQUENCE ==========

echo -e "${YELLOW}=== ORCA Voice Backend Test ===${NC}"
echo ""

# 1. Health check
echo -e "${YELLOW}1. Health Check${NC}"
health=$(curl -s "$HEALTH_ENDPOINT")
if echo "$health" | jq -e '.status == "ok"' > /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy, Baba Sikira loaded${NC}"
else
    echo -e "${RED}✗ Backend not responding or unhealthy${NC}"
    echo "Response: $health"
    exit 1
fi
echo ""

# 2. First conversation turn
echo -e "${YELLOW}2. First message: 'My data is disappearing'${NC}"
history="[]"
first_response=$(call_chat "My data is disappearing" "$history")

# Extract reply and language for TTS
first_reply=$(echo "$first_response" | jq -r '.reply')
first_lang=$(echo "$first_response" | jq -r '.detected_language')

# 3. Test TTS for first reply
test_tts "$first_reply" "$first_lang"

# 4. Second conversation turn (with history)
echo -e "${YELLOW}3. Follow-up message: 'Yes, it finished too fast'${NC}"
# Build history array with previous exchange
history=$(jq -n \
    --arg user_msg "My data is disappearing" \
    --arg agent_reply "$first_reply" \
    '[{"role": "user", "content": $user_msg}, {"role": "assistant", "content": $agent_reply}]')

second_response=$(call_chat "Yes, it finished too fast" "$history")
second_reply=$(echo "$second_response" | jq -r '.reply')
second_lang=$(echo "$second_response" | jq -r '.detected_language')

# 5. Test TTS for second reply
test_tts "$second_reply" "$second_lang"

# 6. (Optional) Try a Yoruba message if Gemini detects it
echo -e "${YELLOW}4. Yoruba test: 'Data mi ti pari' (my data is finished)${NC}"
yoruba_history=$(jq -n \
    --arg user_msg "My data is disappearing" \
    --arg agent_reply "$first_reply" \
    --arg user2 "Yes, it finished too fast" \
    --arg agent2 "$second_reply" \
    '[{"role": "user", "content": $user_msg}, {"role": "assistant", "content": $agent_reply}, {"role": "user", "content": $user2}, {"role": "assistant", "content": $agent2}]')

yoruba_response=$(call_chat "Data mi ti pari" "$yoruba_history")
yoruba_reply=$(echo "$yoruba_response" | jq -r '.reply')
yoruba_lang=$(echo "$yoruba_response" | jq -r '.detected_language')
test_tts "$yoruba_reply" "$yoruba_lang"

# 7. Show final queue
echo -e "${YELLOW}5. Current conversation queue (from /chat/queue)${NC}"
queue_response=$(curl -s "$HOST/chat/queue")
if echo "$queue_response" | jq -e '.queue' > /dev/null; then
    echo "$queue_response" | jq '.queue | .[-3:]'   # show last 3 entries
else
    echo -e "${RED}Queue endpoint not available or empty${NC}"
fi

echo ""
echo -e "${GREEN}=== Test completed ===${NC}"