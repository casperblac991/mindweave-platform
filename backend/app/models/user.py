"""
User Model - MindWeave Platform
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_newsletter_subscriber: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_newsletter_subscriber: Optional[bool] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool = False


class UserStats(BaseModel):
    total_purchases: int = 0
    total_spent: float = 0.0
    orders_count: int = 0