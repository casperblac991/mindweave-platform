import json
import os
from datetime import datetime
from openai import OpenAI

client = OpenAI()

def extract_product_info(product_text):
    """Extract product name and description from AI-generated text."""
    lines = product_text.strip().split('\n')
    name = lines[0] if lines else "منتج جديد"
    description = '\n'.join(lines[1:5]) if len(lines) > 1 else "منتج رقمي جديد"
    return name[:50], description[:150]

def extract_blog_info(blog_text):
    """Extract blog title and excerpt from AI-generated text."""
    lines = blog_text.strip().split('\n')
    title = lines[0] if lines else "مقالة جديدة"
    excerpt = '\n'.join(lines[1:3]) if len(lines) > 1 else "مقالة جديدة"
    return title[:80], excerpt[:150]

def update_content_data(blog_file, product_file, social_file):
    """Update content-data.json with new AI-generated content."""
    
    content_data_path = 'content-data.json'
    
    # Load existing data
    if os.path.exists(content_data_path):
        with open(content_data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"lastUpdate": datetime.now().isoformat(), "products": [], "blog": []}
    
    # Read generated files
    try:
        with open(blog_file, 'r', encoding='utf-8') as f:
            blog_content = f.read()
        
        with open(product_file, 'r', encoding='utf-8') as f:
            product_content = f.read()
        
        # Extract info
        blog_title, blog_excerpt = extract_blog_info(blog_content)
        product_name, product_desc = extract_product_info(product_content)
        
        # Add new product
        new_product = {
            "id": len(data['products']) + 1,
            "name": product_name,
            "description": product_desc,
            "price": "$9.99",
            "category": "AI Products",
            "rating": 4.8
        }
        data['products'].insert(0, new_product)
        
        # Add new blog post
        new_blog = {
            "id": len(data['blog']) + 1,
            "title": blog_title,
            "excerpt": blog_excerpt,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "category": "AI News",
            "author": "MindWeave AI"
        }
        data['blog'].insert(0, new_blog)
        
        # Keep only last 10 products and 5 blog posts
        data['products'] = data['products'][:10]
        data['blog'] = data['blog'][:5]
        
        # Update timestamp
        data['lastUpdate'] = datetime.now().isoformat()
        
        # Save updated data
        with open(content_data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Content data updated successfully!")
        print(f"   - New Product: {product_name}")
        print(f"   - New Blog Post: {blog_title}")
        
    except Exception as e:
        print(f"❌ Error updating content data: {str(e)}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 3:
        update_content_data(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        print("Usage: python3 update_content_data.py <blog_file> <product_file> <social_file>")
