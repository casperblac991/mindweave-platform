import os
from openai import OpenAI

client = OpenAI()

def generate_lead_magnet(topic):
    """
    Generates a free high-value digital asset (Lead Magnet) to capture emails/leads.
    """
    prompt = f"صمم 'مغناطيس عملاء' (Lead Magnet) مجاني وعالي القيمة حول موضوع: {topic}. يجب أن يكون شيئاً صغيراً ومفيداً جداً يدفع العميل لإعطاء بريده الإلكتروني للحصول عليه (مثل: قائمة مراجعة، دليل من صفحة واحدة، أو 10 أوامر AI سرية)."
    
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "أنت خبير في بناء القوائم البريدية وتحويل الزوار إلى عملاء محتملين."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

def create_lead_capture_plan(topic):
    print(f"🧲 Creating Lead Magnet for: {topic}")
    content = generate_lead_magnet(topic)
    
    import time
    file_id = int(time.time())
    file_name = f"lead_magnet_{file_id}.md"
    with open(file_name, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"✅ Lead Magnet created: {file_name}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        create_lead_capture_plan(sys.argv[1])
    else:
        print("Usage: python3 lead_magnet_automation.py <topic>")
