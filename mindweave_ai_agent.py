"""
MindWeave AI Agent - المسؤول الذكي للمنصة
====================================
This AI Agent handles:
- Customer Service (خدمة العملاء)
- Email Collection (جمع الإيميلات)  
- Social Media Campaigns (حملات التواصل الاجتماعي)
- Platform Automation (أتمتة المنصة)

Usage:
    python3 mindweave_ai_agent.py --mode customer-service
    python3 mindweave_ai_agent.py --mode collect-emails
    python3 mindweave_ai_agent.py --mode social-campaign "product_name" "benefit"
    python3 mindweave_ai_agent.py --mode daily-automation "topic"
"""

import os
import sys
import json
import time
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
from openai import OpenAI

# Initialize OpenAI Client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Arabic system prompt for the AI Agent
CUSTOMER_SERVICE_PROMPT = """أنت مسؤول خدمة العملاء الذكي لمنصة MindWeave. 
مهمتك هي:
1. الرد على استفسارات العملاء بشكل احترافي وودي
2. مساعدة العملاء في اختيار المنتجات المناسبة
3. حل المشاكل التقنية
4. تقديم معلومات حول الاشتراكات والأسعار

تحل باللهجة العربية الفصحى مع的事情 بسيطة. كن صبوراً ومهذباً.
أجب دائماً بطريقة قصيرة ومفيدة."""

EMAIL_COLLECTION_PROMPT = """أنت خبير في جمع الإيميلات والتسويق.
مهمتك هي:
1.تحفيز الزوار للتسجيل في النشرة البريدية
2.عرض القيمة الحقيقية للمنصة
3.استخدام عروض حصرية للمشتركين الجدد

اكتب رسالة ترويجية قصيرة وجذابة للتسجيل."""

SOCIAL_MEDIA_PROMPT = """أنت خبير تسويق ذكي على منصات التواصل الاجتماعي.
اكتب منشورات virusية (جذابة) للمنصات:
- X (Twitter): ثريدات من 5-7 تغريدات
- Instagram: نصائح Reel قصيرة
- LinkedIn: منشورات احترافية B2B

ابدأ بخطاف قوي، ركز على الفائدة، واختم بـ CTA."""

# ============ CUSTOMER SERVICE AI ============

def handle_customer_message(user_message: str, customer_email: str = "") -> str:
    """
    Handles customer inquiry with AI
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": CUSTOMER_SERVICE_PROMPT},
                {"role": "user", "content": f"رسالة العميل: {user_message}\nبريد العميل: {customer_email}"}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"عذراً، حدث خطأ تقني. يرجى المحاولة لاحقاً. الخطأ: {str(e)}"


def save_customer_inquiry(user_message: str, response: str, customer_email: str = ""):
    """
    Saves customer inquiry to file (or database when configured)
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    inquiry_data = {
        "timestamp": timestamp,
        "customer_email": customer_email,
        "user_message": user_message,
        "ai_response": response,
        "status": "answered"
    }
    
    # Save to file
    filename = f"customer_inquiry_{timestamp}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(inquiry_data, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved inquiry to {filename}")


# ============ EMAIL COLLECTION SYSTEM ============

def generate_signup_email_content() -> str:
    """
    Generates AI-powered email content for newsletter signup
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": EMAIL_COLLECTION_PROMPT},
                {"role": "user", "content": "اكتب رسالة تسجيل قصيرة للنشرة البريدية"}
            ],
            max_tokens=300,
            temperature=0.8
        )
        return response.choices[0].message.content
    except Exception as e:
        return "اشترك في نشرتنا للحصول على أحدث أدوات الذكاء الاصطناعي!"


def collect_email(email: str, name: str = "", source: str = "website") -> dict:
    """
    Collects and saves email to subscriber database
    """
    subscriber_data = {
        "email": email,
        "name": name,
        "source": source,
        "subscribed_at": datetime.now().isoformat(),
        "status": "active"
    }
    
    # Save locally (for now) or to Supabase when configured
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            import requests
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/subscribers",
                headers={
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                },
                json=subscriber_data
            )
            if response.status_code in [200, 201]:
                print(f"✅ Email collected to Supabase: {email}")
                return {"success": True}
        except Exception as e:
            print(f"Supabase error: {e}")
    
    # Save locally as fallback
    filename = f"subscribers_{int(time.time())}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(subscriber_data, f, ensure_ascii=False, indent=2)
    print(f"✅ Email collected locally: {email}")
    return {"success": True, "local": True}


def send_newsletter(emails: list, subject: str, content: str) -> dict:
    """
    Sends newsletter to subscriber list
    """
    print(f"📧 Sending newsletter to {len(emails)} subscribers...")
    print(f"Subject: {subject}")
    print(f"Content preview: {content[:100]}...")
    
    # Note: Requires SMTP configuration for actual sending
    # For now, prepare the campaign data
    campaign_data = {
        "subject": subject,
        "content": content,
        "recipients": len(emails),
        "sent_at": datetime.now().isoformat()
    }
    
    filename = f"newsletter_campaign_{int(time.time())}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(campaign_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Newsletter campaign saved to {filename}")
    return {"success": True, "campaign_file": filename}


# ============ SOCIAL MEDIA AUTOMATION ============

def generate_social_content(platform: str, product_name: str, benefit: str) -> str:
    """
    Generates AI-powered social media content
    """
    prompts = {
        "X": f"اكتب ثريد (Thread) من 7 تغريدات حول: {product_name}\nالفائدة: {benefit}\nابدأ بخطاف قوي جداً يجذب الانتباه.",
        "Instagram": f"اكتب نص Reel قصير (15 ثانية) لـ {product_name}\nالفائدة: {benefit}\nركز على السرعة والسهولة.",
        "LinkedIn": f"اكتب منشور LinkedIn احترافي كيف يوفر {product_name} وقتاً ومالاً.\nالفائدة: {benefit}\nركز على ROI."
    }
    
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": SOCIAL_MEDIA_PROMPT},
                {"role": "user", "content": prompts.get(platform, prompts["X"])}
            ],
            max_tokens=600,
            temperature=0.8
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating content: {str(e)}"


def run_social_campaign(product_name: str, benefit: str) -> dict:
    """
    Runs complete social media campaign
    """
    print(f"🚀 Running AI Social Campaign for: {product_name}")
    
    platforms = ["X", "Instagram", "LinkedIn"]
    campaign_results = {}
    
    for platform in platforms:
        print(f"Generating content for {platform}...")
        content = generate_social_content(platform, product_name, benefit)
        campaign_results[platform] = content
        
        # Save to file
        filename = f"social_{platform.lower()}_{int(time.time())}.md"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"# {platform} Campaign - {product_name}\n\n")
            f.write(content)
        print(f"✅ Saved {platform} content to {filename}")
    
    # Save complete campaign
    campaign_summary = {
        "product_name": product_name,
        "benefit": benefit,
        "platforms": platforms,
        "generated_at": datetime.now().isoformat(),
        "files": campaign_results
    }
    
    summary_file = f"campaign_{int(time.time())}.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(campaign_summary, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Campaign complete! Summary: {summary_file}")
    return {"success": True, "campaign": campaign_summary}


# ============ DAILY AUTOMATION ============

def run_daily_automation(topic: str) -> dict:
    """
    Runs the complete daily automation workflow
    """
    print(f"\n{'='*50}")
    print(f"🚀 Starting Daily AI Automation: {topic}")
    print(f"{'='*50}\n")
    
    # 1. Generate Blog Content
    print("📝 Generating Blog Content...")
    try:
        blog_response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "أنت كاتب محتوى خبير بالذكاء الاصطناعي. اكتب مقال مدونة عربي SEO."},
                {"role": "user", "content": f"اكتب مقال عن: {topic}"}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        blog_content = blog_response.choices[0].message.content
        
        blog_file = f"blog_{int(time.time())}.md"
        with open(blog_file, "w", encoding="utf-8") as f:
            f.write(blog_content)
        print(f"✅ Blog content saved to {blog_file}")
    except Exception as e:
        print(f"❌ Blog generation error: {e}")
        blog_content = ""
    
    # 2. Generate Product Description
    print("🎁 Generating Product Description...")
    try:
        product_response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "أنت خبير هندسة أوامر AI. صمم منتج رقمي جديد."},
                {"role": "user", "content": f"صمم حزمة أوامر AI لـ: {topic}"}
            ],
            max_tokens=800,
            temperature=0.7
        )
        product_content = product_response.choices[0].message.content
        
        product_file = f"product_{int(time.time())}.md"
        with open(product_file, "w", encoding="utf-8") as f:
            f.write(product_content)
        print(f"✅ Product saved to {product_file}")
    except Exception as e:
        print(f"❌ Product generation error: {e}")
        product_content = ""
    
    # 3. Generate Social Posts
    print("📱 Generating Social Posts...")
    social_result = run_social_campaign(topic, "تعلم واستثمر وقتك")
    
    # 4. Prepare Newsletter
    print("📧 Preparing Newsletter...")
    newsletter_content = generate_signup_email_content()
    newsletter_file = f"newsletter_{int(time.time())}.md"
    with open(newsletter_file, "w", encoding="utf-8") as f:
        f.write(newsletter_content)
    print(f"✅ Newsletter saved to {newsletter_file}")
    
    # Complete Summary
    print(f"\n{'='*50}")
    print(f"✅ Daily Automation Complete!")
    print(f"{'='*50}")
    
    return {
        "success": True,
        "topic": topic,
        "generated_files": {
            "blog": blog_file if blog_content else None,
            "product": product_file if product_content else None,
            "newsletter": newsletter_file,
            "campaign": social_result.get("campaign", {}).get("files", {})
        }
    }


# ============ MAIN ENTRY POINT ============

def main():
    if len(sys.argv) < 2:
        print("""
🤖 MindWeave AI Agent
================

Usage:
    python3 mindweave_ai_agent.py --mode customer-service "message" [email]
    python3 mindweave_ai_agent.py --mode collect-email "email" "name"
    python3 mindweave_ai_agent.py --mode social-campaign "product" "benefit"
    python3 mindweave_ai_agent.py --mode daily-automation "topic"
    python3 mindweave_ai_agent.py --mode generate-signup
        """)
        sys.exit(1)
    
    mode = sys.argv[1]
    
    if mode == "--mode" and len(sys.argv) > 2:
        actual_mode = sys.argv[2]
        
        if actual_mode == "customer-service":
            message = sys.argv[3] if len(sys.argv) > 3 else "مرحباً"
            email = sys.argv[4] if len(sys.argv) > 4 else ""
            response = handle_customer_message(message, email)
            print(f"\n🤖 إجابة الذكاء الاصطناعي:\n{response}\n")
            save_customer_inquiry(message, response, email)
            
        elif actual_mode == "collect-email":
            email_addr = sys.argv[3] if len(sys.argv) > 3 else ""
            name = sys.argv[4] if len(sys.argv) > 4 else ""
            if email_addr:
                result = collect_email(email_addr, name)
                print(f"✅ تم جمع الإيميل: {result}")
            else:
                print("❌ يرجى تحديد الإيميل")
                
        elif actual_mode == "social-campaign":
            product = sys.argv[3] if len(sys.argv) > 3 else "منتج جديد"
            benefit = sys.argv[4] if len(sys.argv) > 4 else "توفير الوقت"
            run_social_campaign(product, benefit)
            
        elif actual_mode == "daily-automation":
            topic = sys.argv[3] if len(sys.argv) > 3 else "الذكاء الاصطناعي"
            run_daily_automation(topic)
            
        elif actual_mode == "generate-signup":
            content = generate_signup_email_content()
            print(f"\n📧 محتوى التسجيل:\n{content}\n")
            
        else:
            print(f"❌ وضع غير معروف: {actual_mode}")
    else:
        print("❌ usage خاطئ")


if __name__ == "__main__":
    main()