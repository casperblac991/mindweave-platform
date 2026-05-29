"""
MindWeave Platform - FastAPI Backend
Main Application Entry Point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="منصة MindWeave - backend API للذكاء الاصطناعي والمنتجات الرقمية",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "message": "🧠 MindWeave API is running!"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "supabase_connected": bool(settings.SUPABASE_URL),
        "groq_configured": bool(settings.GROQ_API_KEY),
        "nvidia_configured": bool(settings.NVIDIA_API_KEY)
    }


# Import and include routers
from app.routers import products, orders, ai_lab, creators, auth

app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(ai_lab.router, prefix="/api/ai", tags=["AI Lab"])
app.include_router(creators.router, prefix="/api", tags=["Creators"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )