"""
Orders Router - MindWeave Platform
Handles order and cart management
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

router = APIRouter()


# ============ Models ============
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItem(BaseModel):
    product_id: int
    quantity: int = 1
    price: float


class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_email: str
    customer_name: Optional[str] = None
    payment_method: Optional[str] = "stripe"


class OrderResponse(BaseModel):
    id: int
    items: List[OrderItem]
    total: float
    status: OrderStatus
    customer_email: str
    created_at: str


# ============ In-memory storage (replace with Supabase in production) ============
ORDERS = []


# ============ Endpoints ============
@router.get("/orders")
async def get_orders(
    email: Optional[str] = Query(None, description="Filter by customer email"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get all orders or filter by email/status"""
    orders = ORDERS.copy()
    
    if email:
        orders = [o for o in orders if o.get("customer_email") == email]
    
    if status:
        orders = [o for o in orders if o.get("status") == status]
    
    return {
        "success": True,
        "count": len(orders),
        "orders": orders
    }


@router.get("/orders/{order_id}")
async def get_order(order_id: int):
    """Get single order by ID"""
    order = next((o for o in ORDERS if o["id"] == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "success": True,
        "order": order
    }


@router.post("/orders")
async def create_order(order: OrderCreate):
    """Create a new order"""
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    
    # Calculate total
    total = sum(item.price * item.quantity for item in order.items)
    
    # Create order
    new_order = {
        "id": len(ORDERS) + 1,
        "items": [item.model_dump() for item in order.items],
        "total": total,
        "status": OrderStatus.PENDING.value,
        "customer_email": order.customer_email,
        "customer_name": order.customer_name,
        "payment_method": order.payment_method,
        "created_at": datetime.now().isoformat()
    }
    
    ORDERS.append(new_order)
    
    return {
        "success": True,
        "message": "Order created successfully",
        "order": new_order
    }


@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: int, status: str):
    """Update order status"""
    order = next((o for o in ORDERS if o["id"] == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if status not in [s.value for s in OrderStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order["status"] = status
    order["updated_at"] = datetime.now().isoformat()
    
    return {
        "success": True,
        "message": f"Order status updated to {status}",
        "order": order
    }


@router.post("/orders/calculate")
async def calculate_order(items: List[OrderItem]):
    """Calculate order total without creating order"""
    total = sum(item.price * item.quantity for item in items)
    
    return {
        "success": True,
        "items_count": len(items),
        "subtotal": total,
        "total": total,
        "currency": "USD"
    }