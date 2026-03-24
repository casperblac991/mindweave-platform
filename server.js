import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات CORS و JSON
app.use(cors());
app.use(express.json());

// خدمة الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ نقطة النهاية لـ Claude API
app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ CLAUDE_API_KEY not set in environment');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: req.body.messages || [{ role: 'user', content: req.body.prompt || 'Hello' }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// نقطة نهاية للتحقق من صحة المفتاح (اختياري)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    apiKeyConfigured: !!process.env.CLAUDE_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 Claude API key: ${process.env.CLAUDE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});
