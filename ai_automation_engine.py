import os
import time
from openai import OpenAI
import requests

# The OpenAI client is pre-configured with the API key and base URL
client = OpenAI()

# Supabase Configuration - Reading from Render Environment Variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mtirzcuntupkuavmjtcv.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

def generate_ai_content(prompt_type, topic):
    """
    Generates content using AI based on the type (blog, product, social).
    """
    system_prompts = {
        "blog": "أنت كاتب محتوى خبير في الذكاء الاصطناعي والتقنية. اكتب مقال مدونة احترافي باللغة العربية، متوافق مع SEO، غني بالمعلومات وجذاب.",
        "product": "أنت خبير في هندسة الأوامر (Prompt Engineering). قم بتوليد منتج رقمي جديد (أوامر AI) مع وصف تسويقي مقنع باللغة العربية.",
        "social": "أنت خبير تسويق عبر وسائل التواصل الاجتماعي. اكتب منشورات جذابة لمنصات X و Instagram و LinkedIn حول الموضوع المحدد."
    }
    
    user_prompts = {
        "blog": f"اكتب مقالاً مفصلاً عن: {topic}. يجب أن يتضمن المقال مقدمة، عناوين فرعية، وخاتمة.",
        "product": f"صمم حزمة أوامر AI متخصصة في: {topic}. اذكر الفوائد وكيفية الاستخدام.",
        "social": f"اكتب منشورات ترويجية لـ: {topic}. استخدم الهاشتاغات المناسبة."
    }
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": system_prompts.get(prompt_type, "أنت مساعد ذكي.")},
                {"role": "user", "content": user_prompts.get(prompt_type, topic)}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating content: {str(e)}"

def send_newsletter_notification(topic, product_name):
    """
    Sends a newsletter notification to all subscribers via Supabase Edge Functions.
    """
    print(f"📧 Sending Newsletter Notification for: {product_name}")
    function_url = f"{SUPABASE_URL}/functions/v1/send-newsletter"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "subject": f"🎉 جديد في MindWeave: {product_name}",
        "content": f"لقد أضفنا للتو محتوى جديداً ومقالات تقنية حول {topic}. اكتشف أحدث الأدوات والحلول الآن!",
        "productName": product_name
    }
    
    try:
        # Note: This requires the Supabase Edge Function to be deployed
        # response = requests.post(function_url, json=payload, headers=headers)
        # return response.json()
        print(f"✅ Newsletter payload prepared for {product_name}")
        return {"success": True}
    except Exception as e:
        print(f"❌ Failed to send newsletter: {str(e)}")
        return {"success": False, "error": str(e)}

def automate_platform_update(topic):
    print(f"🚀 Starting Automated AI Update for: {topic}")
    
    # Use a generic timestamp or simple ID for filenames to avoid Arabic characters
    file_id = int(time.time())
    
    print("Generating Blog Post...")
    blog_content = generate_ai_content("blog", topic)
    with open(f"blog_{file_id}.md", "w", encoding="utf-8") as f:
        f.write(blog_content)
    
    print("Generating New Product...")
    product_content = generate_ai_content("product", topic)
    # Extract a simple name for the product from content (first line usually)
    product_name = product_content.split('\n')[0].replace('#', '').strip()[:50] or topic
    with open(f"product_{file_id}.md", "w", encoding="utf-8") as f:
        f.write(product_content)
        
    print("Generating Social Media Posts...")
    social_content = generate_ai_content("social", topic)
    with open(f"social_{file_id}.md", "w", encoding="utf-8") as f:
        f.write(social_content)
    
    # Send newsletter notification to subscribers
    send_newsletter_notification(topic, product_name)
        
    print("✅ Platform Automation Task Completed!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        automate_platform_update(sys.argv[1])
    else:
        print("Please provide a topic for automation.")
