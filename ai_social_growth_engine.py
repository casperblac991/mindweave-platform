import os
from openai import OpenAI

# The OpenAI client is pre-configured
client = OpenAI()

def generate_viral_social_content(platform, product_name, benefit):
    """
    Generates viral-style social media content designed to attract customers.
    """
    system_prompts = {
        "X": "أنت خبير في كتابة الثريدات (Threads) الفيروسية على منصة X. هدفك هو جذب الانتباه وتحويل القراء إلى عملاء عبر محتوى تعليمي وتسويقي ذكي.",
        "Instagram": "أنت خبير تسويق بصري على انستغرام. اكتب نصوصاً جذابة للـ Reels و Carousel تركز على النتائج المبهرة وتدفع المستخدم للنقر على رابط البايو.",
        "LinkedIn": "أنت خبير تسويق B2B على لينكدإن. اكتب منشورات فكرية عميقة تربط بين كفاءة العمل وأدوات الذكاء الاصطناعي لجذب المحترفين ورواد الأعمال."
    }
    
    user_prompts = {
        "X": f"اكتب ثريد (Thread) من 5 تغريدات حول منتج: {product_name}. ركز على الفائدة: {benefit}. ابدأ بخطاف (Hook) قوي جداً.",
        "Instagram": f"اكتب نصاً لفيديو Reel قصير (15 ثانية) يروج لـ {product_name}. ركز على السرعة والسهولة والنتيجة النهائية.",
        "LinkedIn": f"اكتب منشوراً احترافياً حول كيف يمكن لـ {product_name} أن يوفر ساعات من العمل أسبوعياً للمحترفين. ركز على العائد على الاستثمار (ROI)."
    }

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": system_prompts.get(platform, "أنت مساعد تسويق ذكي.")},
                {"role": "user", "content": user_prompts.get(platform)}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

def run_promotion_campaign(product_name, benefit):
    print(f"📣 Launching AI Social Promotion Campaign for: {product_name}")
    
    platforms = ["X", "Instagram", "LinkedIn"]
    campaign_data = ""
    
    for platform in platforms:
        print(f"Generating viral content for {platform}...")
        content = generate_viral_social_content(platform, product_name, benefit)
        campaign_data += f"\n\n--- {platform} CAMPAIGN ---\n{content}"
        
    import time
    file_id = int(time.time())
    file_name = f"campaign_{file_id}.md"
    with open(file_name, "w", encoding="utf-8") as f:
        f.write(campaign_data)
    
    print(f"✅ AI Social Campaign generated and saved to {file_name}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        run_promotion_campaign(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python3 ai_social_growth_engine.py <product_name> <benefit>")
