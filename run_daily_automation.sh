#!/bin/bash

# Define the list of topics for daily automation
TOPICS=("الذكاء الاصطناعي في التسويق" "قوالب Notion للإنتاجية" "أوامر ChatGPT للمبدعين" "مستقبل العمل مع AI")

# Pick a random topic
RANDOM_TOPIC=${TOPICS[$RANDOM % ${#TOPICS[@]}]}

echo "--- Starting Daily Automation for: $RANDOM_TOPIC ---"

# Run the AI Automation Engine
python3 ai_automation_engine.py "$RANDOM_TOPIC"

echo "--- Automation Finished ---"
