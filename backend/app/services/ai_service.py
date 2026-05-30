"""
AI Service - MindWeave Platform
Handles AI integrations (Groq, NVIDIA, OpenAI)
"""

from typing import Optional, Dict, Any
import httpx
import os

from app.core.config import settings


class AIService:
    """AI Service for handling various AI provider integrations"""
    
    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        self.nvidia_key = settings.NVIDIA_API_KEY or os.getenv("NVIDIA_API_KEY")
    
    async def generate_prompt(
        self,
        message: str,
        mode: str = "prompts",
        language: str = "ar"
    ) -> Dict[str, Any]:
        """Generate AI prompt using available providers"""
        
        # System prompts for different modes
        system_prompts = {
            "prompts": "أنت خبير في هندسة الأوامر (Prompt Engineering) باللغة العربية. أنشئ أوامر احترافية ومفصلة وجاهزة للاستخدام.",
            "marketing": "أنت خبير في التسويق الرقمي. أنشئ محتوى تسويقي احترافي.",
            "coding": "أنت خبير في البرمجة. اكتب كود نظيف وفعال.",
            "design": "أنت خبير في التصميم. أنشئ وصف تصميمي إبداعي.",
            "general": "أنت مساعد ذكي بالعربية."
        }
        
        system_prompt = system_prompts.get(mode, system_prompts["general"])
        
        # Try NVIDIA first
        result = await self._call_nvidia(message, system_prompt)
        if result:
            return {"success": True, "reply": result, "provider": "nvidia"}
        
        # Try Groq
        result = await self._call_groq(message, system_prompt)
        if result:
            return {"success": True, "reply": result, "provider": "groq"}
        
        return {
            "success": False,
            "reply": "عذراً، لم نتمكن من الاتصال بالذكاء الاصطناعي حالياً.",
            "provider": None
        }
    
    async def _call_groq(self, message: str, system_prompt: str) -> Optional[str]:
        """Call Groq API"""
        if not self.groq_key:
            return None
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": system_prompt},
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
            print(f"Groq error: {e}")
        
        return None
    
    async def _call_nvidia(self, message: str, system_prompt: str) -> Optional[str]:
        """Call NVIDIA API"""
        if not self.nvidia_key:
            return None
        
        models = [
            "kimi/kimi-k2-0905-instruct",
            "meta/llama-4-maverick-17b-128e-instruct"
        ]
        
        for model in models:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://integrate.api.nvidia.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.nvidia_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": model,
                            "messages": [
                                {"role": "system", "content": system_prompt},
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
                print(f"NVIDIA {model} error: {e}")
                continue
        
        return None


# Singleton instance
ai_service = AIService()