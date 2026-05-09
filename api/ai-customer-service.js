/**
 * MindWeave AI Customer Service API
 * ==============================
 * Handles customer inquiries with AI
 */

const express = require('express');
const app = express();
app.use(express.json());

// In-memory conversations storage (replace with database in production)
const conversations = [];

/**
 * OpenAI Chat API Handler
 */
async function chatWithAI(message, history = []) {
  // Note: Requires OPENAI_API_KEY in environment
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      error: "API key not configured",
      response: "عذراً، الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً."
    };
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `أنت مسؤول خدمة العملاء الذكي لمنصة MindWeave. 
مهمتك:
1. الرد على استفسارات العملاء بشكل احترافي
2. مساعدة العملاء في اختيار المنتجات
3. حل المشاكل التقنية
4. تقديم معلومات حول الاشتراكات

أجب بالعربية وبشكل مختصر ومفيد.`
          },
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    return {
      error: error.message,
      response: "عذراً، حدث خطأ. يرجى المحاولة لاحقاً."
    };
  }
}

/**
 * POST /api/customer-service
 * Handle customer inquiry
 */
app.post('/api/customer-service', async (req, res) => {
  const { message, email, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  console.log(`📩 Customer inquiry from: ${email || 'anonymous'}`);
  console.log(`   Message: ${message}`);
  
  const result = await chatWithAI(message, history || []);
  
  // Save conversation
  const conversation = {
    id: Date.now(),
    email,
    message,
    response: result.response,
    timestamp: new Date().toISOString()
  };
  conversations.push(conversation);
  
  res.json({
    success: true,
    response: result.response,
    conversation_id: conversation.id
  });
});

/**
 * POST /api/collect-email
 * Collect subscriber email
 */
app.post('/api/collect-email', async (req, res) => {
  const { email, name, source } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  console.log(`✅ New subscriber: ${email} (${name || 'anonymous'})`);
  
  // Note: In production, save to Supabase/Database
  
  res.json({
    success: true,
    message: 'شكراً للتسجيل! سنابقك بأحدث أخبارنا.',
    subscriber: { email, name, source: source || 'website' }
  });
});

/**
 * POST /api/send-newsletter
 * Send newsletter to subscribers
 */
app.post('/api/send-newsletter', async (req, res) => {
  const { subject, content, recipients } = req.body;
  
  if (!subject || !content) {
    return res.status(400).json({ error: 'Subject and content required' });
  }
  
  // In production, integrate with email service (SendGrid, Mailgun, etc.)
  console.log(`📧 Preparing newsletter: ${subject}`);
  console.log(`   Recipients: ${recipients || 'all'}`);
  
  res.json({
    success: true,
    message: 'Newsletter queued for sending',
    campaign_id: Date.now()
  });
});

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    conversations: conversations.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 MindWeave API running on port ${PORT}`);
});

// Export for ESM
export default app;