#!/usr/bin/env python3
"""
Script to inject AI-generated content into content-data.json
This keeps the original index.html untouched while updating the data it displays
"""

import json
import os
from datetime import datetime

def extract_product_info(product_text):
    """Extract product name and description from AI-generated text."""
    lines = product_text.strip().split('\n')
    name = lines[0].replace('###', '').replace('#', '').strip()[:60]
    description = ' '.join(lines[1:3]) if len(lines) > 1 else "منتج رقمي جديد"
    description = description.replace('####', '').replace('##', '').strip()[:150]
    return name, description

def extract_blog_info(blog_text):
    """Extract blog title and excerpt from AI-generated text."""
    lines = blog_text.strip().split('\n')
    title = lines[0].replace('#', '').strip()[:80]
    excerpt = ' '.join(lines[1:4]) if len(lines) > 1 else "مقالة جديدة"
    excerpt = excerpt.replace('##', '').replace('####', '').strip()[:150]
    return title, excerpt

def update_content_data(blog_file, product_file):
    """Update content-data.json with new AI-generated content."""
    
    content_data_path = 'content-data.json'
    
    # Load existing data
    if os.path.exists(content_data_path):
        with open(content_data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {
            "lastUpdate": datetime.now().isoformat(),
            "stats": {"products": 20, "sales": 2091, "rating": 4.85, "support": "24/7"},
            "products": [],
            "blog": []
        }
    
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
            "rating": 4.8,
            "emoji": "✨"
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
        
        # Update stats
        data['stats']['products'] = len(data['products']) + 17  # 17 existing + new ones
        data['stats']['sales'] = 2091 + (len(data['products']) * 2)
        
        # Save updated data
        with open(content_data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Content data updated successfully!")
        print(f"   - New Product: {product_name}")
        print(f"   - New Blog Post: {blog_title}")
        print(f"   - Total Products: {data['stats']['products']}")
        
    except Exception as e:
        print(f"❌ Error updating content data: {str(e)}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        update_content_data(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python3 inject_content.py <blog_file> <product_file>")
