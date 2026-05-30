"""
Products Router - MindWeave Platform
Handles product-related API endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


# ============ Models ============
class ProductBase(BaseModel):
    name: str
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    description: Optional[str] = None
    description_ar: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    category: str
    emoji: str = "✨"
    badge: Optional[str] = None
    rating: float = 4.5
    filter: str = "prompts"


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: Optional[str] = None
    is_active: bool = True


# ============ Sample Data (matches frontend) ============
PRODUCTS = [
    {
        "id": 1, "filter": "prompts", "emoji": "🧠", "badge": "🔥 الأكثر مبيعاً",
        "name": "أوامر ChatGPT للمبدعين", "name_ar": "أوامر ChatGPT للمبدعين", "name_en": "ChatGPT Prompts for Creators",
        "desc": "مجموعة احترافية من أوامر ChatGPT المتخصصة لتسريع عملية الإبداع والإنتاجية",
        "rating": "4.9", "sales": "2.3K مبيعة", "price": "$9.99", "original": "$19.99",
        "category": "AI Prompts", "price_value": 9.99
    },
    {
        "id": 2, "filter": "design", "emoji": "🎨", "badge": "⭐ مميز",
        "name": "أوامر Midjourney الاحترافية", "name_ar": "أوامر Midjourney الاحترافية", "name_en": "Professional Midjourney Prompts",
        "desc": "50+ أمر لتوليد صور احترافية باستخدام Midjourney",
        "rating": "4.8", "sales": "1.8K مبيعة", "price": "$12.99", "original": "$24.99",
        "category": "AI Prompts", "price_value": 12.99
    },
    {
        "id": 3, "filter": "notion", "emoji": "📋", "badge": "🎯 جديد",
        "name": "قالب Notion للأعمال", "name_ar": "قالب Notion للأعمال", "name_en": "Notion Business System",
        "desc": "قالب شامل مع أتمتة AI وإدارة المشاريع",
        "rating": "5.0", "sales": "890 مبيعة", "price": "$12.99", "original": "$24.99",
        "category": "Templates", "price_value": 12.99
    },
    {
        "id": 4, "filter": "coding", "emoji": "💻", "badge": "🔥 رائج",
        "name": "أوامر البرمجة الكاملة", "name_ar": "أوامر البرمجة الكاملة", "name_en": "Complete Coding Prompts",
        "desc": "100 أمر لتوليد كود وتصحيح الأخطاء",
        "rating": "4.9", "sales": "1.5K مبيعة", "price": "$14.99", "original": "$29.99",
        "category": "Coding", "price_value": 14.99
    },
    {
        "id": 5, "filter": "ebooks", "emoji": "📚", "badge": "📖 جديد",
        "name": "دليل أدوات الذكاء الاصطناعي 2026", "name_ar": "دليل أدوات الذكاء الاصطناعي 2026", "name_en": "AI Tools Directory 2026",
        "desc": "50+ أداة AI مجانية مع شرح مفصل",
        "rating": "4.7", "sales": "2.1K مبيعة", "price": "$5.99", "original": "$9.99",
        "category": "E-Books", "price_value": 5.99
    },
    {
        "id": 6, "filter": "services", "emoji": "🎯", "badge": "⭐ مميز",
        "name": "خدمة تصميم شعارات بالذكاء الاصطناعي", "name_ar": "خدمة تصميم شعارات بالذكاء الاصطناعي", "name_en": "AI Logo Design Service",
        "desc": "تصميم احترافي خلال 24 ساعة مع 3 تعديلات",
        "rating": "4.9", "sales": "560 مبيعة", "price": "$19.99", "original": "$29.99",
        "category": "Services", "price_value": 19.99
    },
]


# ============ Endpoints ============
# NOTE: /categories and /stats must come BEFORE /{product_id} to avoid route conflicts

@router.get("/products/categories")
async def get_categories():
    """Get all available categories"""
    return {
        "success": True,
        "categories": [
            {"id": "all", "name_ar": "الكل", "name_en": "All", "count": len(PRODUCTS)},
            {"id": "prompts", "name_ar": "🧠 أوامر AI", "name_en": "AI Prompts", "count": len([p for p in PRODUCTS if p["filter"] == "prompts"])},
            {"id": "design", "name_ar": "🎨 تصميم", "name_en": "Design", "count": len([p for p in PRODUCTS if p["filter"] == "design"])},
            {"id": "notion", "name_ar": "📊 Notion", "name_en": "Notion", "count": len([p for p in PRODUCTS if p["filter"] == "notion"])},
            {"id": "coding", "name_ar": "💻 برمجة", "name_en": "Coding", "count": len([p for p in PRODUCTS if p["filter"] == "coding"])},
            {"id": "ebooks", "name_ar": "📚 كتب", "name_en": "Books", "count": len([p for p in PRODUCTS if p["filter"] == "ebooks"])},
            {"id": "services", "name_ar": "🎯 خدمات", "name_en": "Services", "count": len([p for p in PRODUCTS if p["filter"] == "services"])},
        ]
    }


@router.get("/products/stats")
async def get_stats():
    """Get platform statistics"""
    return {
        "success": True,
        "stats": {
            "products": len(PRODUCTS),
            "sales": 8970,
            "rating": 4.85,
            "support": "24/7"
        }
    }


@router.get("/products")
async def get_products(
    filter: Optional[str] = Query(None, description="Filter by category (prompts, design, notion, coding, ebooks, services)"),
    search: Optional[str] = Query(None, description="Search in product name")
):
    """Get all products or filter by category"""
    products = PRODUCTS.copy()
    
    if filter and filter != "all":
        products = [p for p in products if p.get("filter") == filter]
    
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p.get("name", "").lower()]
    
    return {
        "success": True,
        "count": len(products),
        "products": products
    }


@router.get("/products/{product_id}")
async def get_product(product_id: int):
    """Get single product by ID"""
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "success": True,
        "product": product
    }