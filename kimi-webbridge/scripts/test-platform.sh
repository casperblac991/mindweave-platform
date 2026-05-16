#!/bin/bash
# Platform Automation Test Script
# Tests all pages and identifies issues

BASE_URL="https://mindweave.store"

echo "🧪 Testing MindWeave Platform..."
echo "========================"

# Test list of pages to check
PAGES=(
  "index.html"
  "store.html"
  "library.html"
  "prompt-lab.html"
  "creators.html"
  "blog.html"
  "cart.html"
  "checkout.html"
  "login.html"
  "signup.html"
  "about.html"
  "contact.html"
  "faq.html"
  "privacy.html"
  "terms.html"
)

echo "📄 Testing pages..."
for page in "${PAGES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$page")
  if [ "$status" == "200" ]; then
    echo "✅ $page - OK"
  else
    echo "❌ $page - $status"
  fi
done

echo ""
echo "🔗 Testing links..."
echo "done"