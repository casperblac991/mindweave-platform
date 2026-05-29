"""
Creators Router - MindWeave Platform
Handles creator/platform creator functionality
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


# ============ Models ============
class CreatorProfile(BaseModel):
    id: int
    name: str
    email: str
    specialty: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    total_sales: int = 0
    rating: float = 4.5
    joined_at: str


class ProductSubmission(BaseModel):
    name: str
    name_ar: str
    description: str
    description_ar: str
    price: float
    category: str
    emoji: str = "✨"


# ============ Sample Data ============
CREATORS = [
    {
        "id": 1,
        "name": "أحمد الذكاء",
        "email": "ahmed@mindweave.store",
        "specialty": "أوامر ChatGPT",
        "bio": "خبير في هندسة الأوامر مع +3 سنوات خبرة",
        "avatar": "👨‍💻",
        "total_sales": 3450,
        "rating": 4.9,
        "joined_at": "2024-01-15"
    },
    {
        "id": 2,
        "name": "سارة التصميم",
        "email": "sara@mindweave.store",
        "specialty": "أوامر Midjourney",
        "bio": "مصممة محترفة متخصصة في التصميم بالذكاء الاصطناعي",
        "avatar": "👩‍🎨",
        "total_sales": 2890,
        "rating": 4.8,
        "joined_at": "2024-02-20"
    },
    {
        "id": 3,
        "name": "خالد البرمجة",
        "email": "khaled@mindweave.store",
        "specialty": "أوامر البرمجة",
        "bio": "مطور Full Stack مع خبرة في AI",
        "avatar": "👨‍💻",
        "total_sales": 1560,
        "rating": 4.7,
        "joined_at": "2024-03-10"
    }
]


# ============ Endpoints ============
@router.get("/creators")
async def get_creators(
    specialty: Optional[str] = Query(None, description="Filter by specialty")
):
    """Get all creators or filter by specialty"""
    creators = CREATORS.copy()
    
    if specialty:
        creators = [c for c in creators if specialty.lower() in c["specialty"].lower()]
    
    return {
        "success": True,
        "count": len(creators),
        "creators": creators
    }


@router.get("/creators/{creator_id}")
async def get_creator(creator_id: int):
    """Get single creator by ID"""
    creator = next((c for c in CREATORS if c["id"] == creator_id), None)
    
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    return {
        "success": True,
        "creator": creator
    }


@router.post("/creators/submit")
async def submit_product(product: ProductSubmission):
    """Submit a new product for review"""
    
    if not product.name or not product.description:
        raise HTTPException(status_code=400, detail="Name and description are required")
    
    if product.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
    
    # In production, this would save to Supabase
    submission = {
        "id": len(CREATORS) + 100,
        **product.model_dump(),
        "submitted_at": datetime.now().isoformat(),
        "status": "pending_review"
    }
    
    return {
        "success": True,
        "message": "تم استلام منتجك بنجاح! سيتم مراجعته قريباً.",
        "submission": submission
    }


@router.get("/creators/stats")
async def get_creators_stats():
    """Get platform creators statistics"""
    return {
        "success": True,
        "stats": {
            "total_creators": len(CREATORS),
            "total_products": 150,
            "total_sales": 7900,
            "top_specialty": "أوامر AI"
        }
    }


@router.get("/creators/top")
async def get_top_creators(limit: int = Query(5, ge=1, le=20)):
    """Get top creators by sales"""
    sorted_creators = sorted(CREATORS, key=lambda x: x["total_sales"], reverse=True)
    
    return {
        "success": True,
        "creators": sorted_creators[:limit]
    }