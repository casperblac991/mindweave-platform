"""
Order Model - MindWeave Platform
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PAID = "paid"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class OrderItemBase(BaseModel):
    product_id: int
    product_name: str
    quantity: int = 1
    unit_price: float


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int


class OrderBase(BaseModel):
    customer_email: EmailStr
    customer_name: Optional[str] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemBase]
    payment_method: str = "stripe"


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None


class OrderResponse(OrderBase):
    id: int
    items: List[OrderItemResponse]
    total: float
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None


class OrderStats(BaseModel):
    total_orders: int
    total_revenue: float
    average_order_value: float
    completed_orders: int