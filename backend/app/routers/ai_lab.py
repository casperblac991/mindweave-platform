"""
AI Lab Router - MindWeave Platform
Handles AI-powered Prompt Lab functionality
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os

from app.core.config import settings

router = APIRouter()


# ============ Models ============
class PromptRequest(BaseModel):
    message: str
    mode: str = "prompts"  # prompts, marketing, coding, design, general
    language: str = "ar"


class PromptResponse(BaseModel):
    reply: str
    model: str
    success: bool


# ============ AI Service Functions ============
async def call_groq(message: str) -> Optional[str]:
    """Call Groq API for AI response"""
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    
    if not api_key:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": "أنت خبير في هندسة الأوامر (Prompt Engineering) باللغة العربية. أنشئ أوامر احترافية ومفصلة وجاهزة للاستخدام."
                        },
                        {"role": "user", "content": message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Groq API error: {e}")
    
    return None


async def call_nvidia(message: str) -> Optional[str]:
    """Call NVIDIA API for AI response"""
    api_key = settings.NVIDIA_API_KEY or os.getenv("NVIDIA_API_KEY")
    
    if not api_key:
        return None
    
    # NVIDIA models to try
    models = [
        "kimi/kimi-k2-0905-instruct",
        "moonshotai/kimi-k2-0905-instruct",
        "meta/llama-4-maverick-17b-128e-instruct"
    ]
    
    for model_name in models:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {
                                "role": "system",
                                "content": "أنت خبير في هندسة الأوامر (Prompt Engineering) بالعربية."
                            },
                            {"role": "user", "content": message}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    if content and len(content) > 20:
                        return content
        except Exception as e:
            print(f"NVIDIA {model_name} error: {e}")
            continue
    
    return None


# ============ System Prompts by Mode ============
SYSTEM_PROMPTS = {
    "prompts": "أنت خبير في هندسة الأوامر (Prompt Engineering) باللغة العربية. أنشئ أوامر احترافية ومفصلة وجاهزة للاستخدام لأي غرض.",
    "marketing": "أنت خبير في التسويق الرقمي وإنشاء محتوى إعلاني احترافي. أنشئ أوامر لتحسين التسويق بالمحتوى.",
    "coding": "أنت خبير في البرمجة وتطوير البرمجيات. أنشئ أوامر لتوليد كود نظيف وفعال.",
    "design": "أنت خبير في التصميم الجرافيكي وصناعة المرئيات. أنشئ أوامر لتوليد تصميمات إبداعية.",
    "general": "أنت مساعد ذكي متخصص في اللغة العربية. قدم إجابات مفيدة ومختصرة."
}


# ============ Endpoints ============
@router.post("/prompt")
async def generate_prompt(request: PromptRequest):
    """Generate AI prompt based on user message"""
    
    if not request.message or len(request.message.strip()) < 5:
        raise HTTPException(status_code=400, detail="Message must be at least 5 characters")
    
    system_prompt = SYSTEM_PROMPTS.get(request.mode, SYSTEM_PROMPTS["general"])
    
    # Try NVIDIA first, then Groq
    reply = await call_nvidia(request.message)
    
    if not reply:
        reply = await call_groq(request.message)
    
    if not reply:
        # Fallback response
        reply = f"""# 🎯 أمر AI مُولَّد

## الوصف
بناءً على طلبك: "{request.message}"

## الأمر المُحسَّن:

```
أنت خبير في {request.mode}، مهمتك هي [وصف المهمة].
يجب أن تكون النتيجة [الشكل المتوقع].
أعطني مثالاً على [النتيجة المرجوة].

الشروط:
1. [الشرط الأول]
2. [الشرط الثاني]
3. [الشرط الثالث]

أعطني النتيجة النهائية.
```

## 💡 نصائح:
- جرّب تعديل الحرارة (temperature) للحصول على نتائج مختلفة
- يمكنك إضافة أمثلة لتوجيه الذكاء الاصطناعي
"""
        model_used = "fallback"
    else:
        model_used = "nvidia" if await call_nvidia(request.message) else "groq"
    
    return {
        "success": True,
        "reply": reply,
        "model": model_used,
        "mode": request.mode,
        "message": request.message
    }


@router.get("/modes")
async def get_modes():
    """Get available AI modes"""
    return {
        "success": True,
        "modes": [
            {"id": "prompts", "name_ar": "أوامر AI", "name_en": "AI Prompts", "icon": "🧠"},
            {"id": "marketing", "name_ar": "تسويق", "name_en": "Marketing", "icon": "📢"},
            {"id": "coding", "name_ar": "برمجة", "name_en": "Coding", "icon": "💻"},
            {"id": "design", "name_ar": "تصميم", "name_en": "Design", "icon": "🎨"},
            {"id": "general", "name_ar": "عام", "name_en": "General", "icon": "💡"}
        ]
    }


@router.get("/templates")
async def get_templates():
    """Get AI prompt templates"""
    return {
        "success": True,
        "templates": [
            {
                "id": 1,
                "title": "أمر ChatGPT للمقالات",
                "category": "prompts",
                "template": "اكتب مقالاً حول [الموضوع] بأسلوب [الأسلوب] وبطول [عدد الكلمات] كلمة..."
            },
            {
                "id": 2,
                "title": "أمر Midjourney للصور",
                "category": "design",
                "template": "Create a stunning [type] image with [style] style, featuring [subject]..."
            },
            {
                "id": 3,
                "title": "أمر تحسين SEO",
                "category": "marketing",
                "template": "قم بتحسين هذا النص لمحركات البحث مع الحفاظ على جودة المحتوى..."
            }
        ]
    }


@router.post("/validate")
async def validate_prompt(prompt: str):
    """Validate AI prompt quality"""
    # Simple validation - check length and structure
    issues = []
    suggestions = []
    
    if len(prompt) < 50:
        issues.append("الأمر قصير جداً - حاول إضافة تفاصيل أكثر")
    
    if not any(word in prompt for word in ["أنت", "أنت خبير", "مهمتك", "يجب"]):
        suggestions.append("أضف سياقاً لدور الذكاء الاصطناعي")
    
    if prompt.count("[") > 3:
        suggestions.append("قلل من المتغيرات - استخدم قيم محددة")
    
    return {
        "success": True,
        "valid": len(issues) == 0,
        "issues": issues,
        "suggestions": suggestions,
        "score": max(0, 100 - len(issues) * 20 + len(suggestions) * 5)
    }