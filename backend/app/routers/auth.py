"""
Auth Router - MindWeave Platform
Handles authentication-related endpoints
Note: Main auth is handled by Supabase on the frontend
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import hashlib

from app.core.config import settings

router = APIRouter()


# ============ Models ============
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


# ============ Helper Functions ============
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    
    return encoded_jwt


def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


# ============ Endpoints ============
@router.get("/verify")
async def verify_token(token: str):
    """Verify JWT token validity"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return {
            "success": True,
            "valid": True,
            "user_id": payload.get("sub")
        }
    except JWTError:
        return {
            "success": True,
            "valid": False,
            "error": "Invalid or expired token"
        }


@router.post("/password/reset")
async def request_password_reset(request: PasswordResetRequest):
    """Request password reset (would send email in production)"""
    # In production, this would:
    # 1. Check if email exists in Supabase
    # 2. Generate reset token
    # 3. Send email with reset link
    
    return {
        "success": True,
        "message": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
    }


@router.post("/password/confirm")
async def confirm_password_reset(request: PasswordResetConfirm):
    """Confirm password reset with token"""
    # In production, this would:
    # 1. Verify the reset token
    # 2. Update password in Supabase
    
    return {
        "success": True,
        "message": "تم تغيير كلمة المرور بنجاح"
    }


@router.get("/providers")
async def get_auth_providers():
    """Get available authentication providers"""
    return {
        "success": True,
        "providers": [
            {"id": "email", "name": "البريد الإلكتروني", "enabled": True},
            {"id": "google", "name": "Google", "enabled": False},
            {"id": "github", "name": "GitHub", "enabled": False}
        ],
        "note": "Authentication is primarily handled by Supabase on the frontend"
    }