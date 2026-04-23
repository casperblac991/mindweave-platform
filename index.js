// index.js - MindWeave Platform (محدث بالكامل)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ========== Middleware ==========
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== حقن Google Analytics تلقائياً في كل الصفحات ==========
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('</head>')) {
      const gaTag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DZ4WQDX31M"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-DZ4WQDX31M');
</script>`;
      body = body.replace('</head>', gaTag + '</head>');
    }
    return originalSend.call(this, body);
  };
  next();
});

// ========== API: توليد الأوامر عبر Z.ai ==========
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode, category } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: `أنت خبير في هندسة الأوامر. ${mode === 'improve' ? 'قم بتحسين الأمر' : mode === 'translate' ? 'قم بترجمة الأمر' : 'قم بتوليد أمر احترافي'} في مجال "${category}". اكتب الأمر مباشرة.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) throw new Error('Z.ai API error');
    
    const data = await response.json();
    res.json({ success: true, prompt: data.choices[0].message.content });
    
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate prompt' });
  }
});

// ========== API: اشتراك النشرة البريدية ==========
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Invalid email' });
  }
  console.log(`New subscriber: ${email}`);
  res.json({ success: true, message: 'Subscribed successfully' });
});

// ========== تشغيل الخادم ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MindWeave server running on port ${PORT}`);
});
