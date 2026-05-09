import express from 'express';
import groqHandler from './api/groq.js';
import aiService from './api/ai-customer-service.js';

const app = express();
app.use(express.json());

// يخدم جميع ملفات HTML و CSS و JS من المجلد الحالي
app.use(express.static('.'));

// API route
app.post('/api/groq', groqHandler);
app.use('/api/ai', aiService);

// أي رابط غير موجود يعود إلى الصفحة الرئيسية
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
