"""
Product Model - MindWeave Platform
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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
    sales_count: int = 0


class ProductCreate(ProductBase):
    creator_id: Optional[str] = None
    file_url: Optional[str] = None
    preview_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    creator_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None


class ProductStats(BaseModel):
    total_products: int
    total_sales: int
    average_rating: float