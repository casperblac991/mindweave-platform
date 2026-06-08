import sys
import os
from datetime import datetime

def generate_content(topic):
    print(f"Generating AI content for topic: {topic}")
    
    blog_content = f"""# {topic}
هذا مقال مفصل حول {topic} وكيف يغير الذكاء الاصطناعي مستقبلنا.
## الأهمية
يعتبر {topic} من أهم المجالات حالياً.
## التطبيقات
تتعدد التطبيقات لتشمل كل جوانب الحياة.
"""
    
    product_content = f"""### {topic} - الدليل الكامل
دليل شامل لتعلم {topic} باحترافية وسهولة.
هذا المنتج يساعدك على توفير الوقت والجهد.
"""
    
    blog_filename = f"blog_{datetime.now().strftime('%Y%m%d')}.md"
    product_filename = f"product_{datetime.now().strftime('%Y%m%d')}.md"
    
    with open(blog_filename, 'w', encoding='utf-8') as f:
        f.write(blog_content)
    
    with open(product_filename, 'w', encoding='utf-8') as f:
        f.write(product_content)
    
    print(f"Generated {blog_filename} and {product_filename}")

if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else "الذكاء الاصطناعي"
    generate_content(topic)
