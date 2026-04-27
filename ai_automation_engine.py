import os
from openai import OpenAI

# The OpenAI client is pre-configured with the API key and base URL
client = OpenAI()

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

def automate_platform_update(topic):
    print(f"🚀 Starting Automated AI Update for: {topic}")
    
    print("Generating Blog Post...")
    blog_content = generate_ai_content("blog", topic)
    with open(f"blog_{topic.replace(' ', '_')}.md", "w", encoding="utf-8") as f:
        f.write(blog_content)
    
    print("Generating New Product...")
    product_content = generate_ai_content("product", topic)
    with open(f"product_{topic.replace(' ', '_')}.md", "w", encoding="utf-8") as f:
        f.write(product_content)
        
    print("Generating Social Media Posts...")
    social_content = generate_ai_content("social", topic)
    with open(f"social_{topic.replace(' ', '_')}.md", "w", encoding="utf-8") as f:
        f.write(social_content)
        
    print("✅ Platform Automation Task Completed!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        automate_platform_update(sys.argv[1])
    else:
        print("Please provide a topic for automation.")
