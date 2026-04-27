#!/bin/bash

# Define the list of topics for daily automation
TOPICS=("الذكاء الاصطناعي في التسويق" "قوالب Notion للإنتاجية" "أوامر ChatGPT للمبدعين" "مستقبل العمل مع AI")

# Pick a random topic
RANDOM_TOPIC=${TOPICS[$RANDOM % ${#TOPICS[@]}]}

echo "--- Starting Daily Automation for: $RANDOM_TOPIC ---"

# Run the AI Automation Engine
python3 ai_automation_engine.py "$RANDOM_TOPIC"

# Run the Social Growth Engine
echo "Launching AI Social Promotion..."
python3 ai_social_growth_engine.py "$RANDOM_TOPIC" "توفير 90% من الوقت وزيادة الإنتاجية"

# Run Lead Magnet Automation
echo "Generating Lead Magnet..."
python3 lead_magnet_automation.py "$RANDOM_TOPIC"

echo "--- Automation Finished: Content, Product, Social, and Leads are ready! ---"
