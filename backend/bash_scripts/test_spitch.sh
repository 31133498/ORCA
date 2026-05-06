#!/bin/bash

# Test Spitch TTS endpoint
# Usage: ./test_spitch.sh "text to convert" [language]

TEXT=${1:-"Hello, how can I help you today?"}
LANG=${2:-"en"}

echo "Testing Spitch TTS with text: '$TEXT' and lang: '$LANG'..."

RESPONSE=$(curl -s -X POST "http://localhost:8000/chat/tts" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\", \"language\": \"$LANG\"}")

echo "Response: $RESPONSE"

AUDIO_URL=$(echo $RESPONSE | sed -n 's/.*"audio_url":"\([^"]*\)".*/\1/p')

if [[ -z "$AUDIO_URL" ]]; then
  echo "Error: No audio_url found in response."
  exit 1
fi

echo "Audio URL: $AUDIO_URL"

# Check if file exists locally
FULL_PATH="app$AUDIO_URL"
if [[ -f "$FULL_PATH" ]]; then
  echo "Success: File created at $FULL_PATH"
else
  # If it's a mock URL (starts with http), it won't be local
  if [[ "$AUDIO_URL" == http* ]]; then
    echo "Using mock URL: $AUDIO_URL (Success for mock mode)"
  else
    echo "Error: Local file not found at $FULL_PATH"
    exit 1
  fi
fi
