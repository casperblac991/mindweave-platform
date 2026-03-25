// index.js
import express from 'express';
import groqHandler from './api/groq.js';

const app = express();
app.use(express.json());
app.use(express.static('.')); // يخدم ملفات HTML الموجودة

app.post('/api/groq', groqHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
