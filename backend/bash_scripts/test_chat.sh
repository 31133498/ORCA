#!/bin/bash

# Test Chat endpoint
# Usage: ./test_chat.sh "message"

MESSAGE=${1:-"Hi, I'm Baba Sikira and my data is finished!"}

echo "Testing Chat endpoint with message: '$MESSAGE'..."

RESPONSE=$(curl -s -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\", \"history\": []}")

echo "Response:"
echo $RESPONSE | jq . || echo $RESPONSE
