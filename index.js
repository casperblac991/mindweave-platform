import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== حقن Google Analytics تلقائياً ==========
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('</head>')) {
      const gaTag = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-DZ4WQDX31M"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DZ4WQDX31M');</script>`;
      body = body.replace('</head>', gaTag + '</head>');
    }
    return originalSend.call(this, body);
  };
  next();
});

// ========== API: توليد الأوامر ==========
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode, category } = req.body;
    
    if (!prompt) {
      return res.json({ 
        success: false, 
        error: 'المدخل فارغ' 
      });
    }

    const apiKey = process.env.ZAI_API_KEY;
    
    if (!apiKey) {
      // توليد محلي بسيط في حالة عدم وجود مفتاح API
      const localPrompt = `✨ أمر احترافي (${mode === 'generate' ? 'توليد' : mode === 'improve' ? 'تحسين' : 'ترجمة'}) في مجال ${category}:\n\n${prompt}\n\n✅ هذا رد تجريبي - أضف مفتاح Z.ai في Render للحصول على أوامر احترافية بالذكاء الاصطناعي`;
      return res.json({ success: true, prompt: localPrompt });
    }

    const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: `أنت خبير في هندسة الأوامر (Prompt Engineering). ${mode === 'improve' ? 'قم بتحسين الأمر التالي' : mode === 'translate' ? 'قم بترجمة الأمر التالي' : 'قم بتوليد أمر احترافي جديد'} في مجال "${category}". اكتب الأمر مباشرة دون أي مقدمات أو شرح.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Z.ai API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0].message.content;
    
    res.json({ success: true, prompt: generatedPrompt });

  } catch (error) {
    console.error('Generate error:', error);
    // رد احتياطي في حالة فشل API
    const fallbackPrompt = `✨ أمر احترافي (${mode === 'generate' ? 'توليد' : mode === 'improve' ? 'تحسين' : 'ترجمة'}) في مجال ${category}:\n\n${req.body.prompt}\n\n(رد مؤقت - يرجى التحقق من اتصال API)`;
    res.json({ success: true, prompt: fallbackPrompt });
  }
});

// ========== API: اشتراك ==========
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.json({ success: false, error: 'بريد إلكتروني غير صالح' });
  }
  console.log(`مشترك جديد: ${email}`);
  res.json({ success: true, message: 'تم الاشتراك بنجاح' });
});

// ========== تشغيل الخادم ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MindWeave server running on port ${PORT}`);
});
