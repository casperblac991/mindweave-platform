import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Google Analytics injection
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('</head>')) {
      const gaTag = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-DZ4WQDX31M"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DZ4WQDX31M');</script>`;
      body = body.replace('</head>', gaTag + '</head>');
    }
    return originalSend.call(this, body);
  };
  next();
});

// API endpoint - متطابق مع الواجهة
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode, category } = req.body;
    
    if (!prompt) {
      return res.json({ success: false, error: 'Prompt required' });
    }

    // استخدام Claude API (مجاني مؤقتًا)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `أنت خبير في هندسة الأوامر. ${mode === 'improve' ? 'حسن الأمر التالي' : mode === 'translate' ? 'ترجم الأمر التالي' : 'أنشئ أمرًا احترافيًا'} في مجال "${category}". اكتب الأمر مباشرة دون مقدمات:\n\n${prompt}`
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, prompt: data.content[0].text });
    } else {
      // Fallback إذا لم يتوفر API
      res.json({ success: true, prompt: `✨ أمر احترافي لمجال ${category}:\n\n${prompt}\n\nملاحظة: أضف مفتاح Claude API في Render لتفعيل الذكاء الاصطناعي` });
    }
  } catch (error) {
    res.json({ success: true, prompt: `✨ أمر احترافي لمجال ${req.body.category || 'عام'}:\n\n${req.body.prompt}\n\n(توليد مؤقت - أضف مفتاح API)` });
  }
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.json({ success: false, error: 'Invalid email' });
  }
  res.json({ success: true, message: 'Subscribed' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
