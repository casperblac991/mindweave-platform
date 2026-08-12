const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = Number(process.env.PORT || 10000);
const startedAt = new Date();
const rootDir = __dirname;

const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBase: (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, ''),
  aiModel: process.env.AI_MODEL || 'gpt-5-mini',
  supabaseUrl: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  maxRequestsPerWindow: Number(process.env.AI_RATE_LIMIT || 20),
  rateWindowMs: Number(process.env.AI_RATE_WINDOW_MS || 10 * 60 * 1000),
};

const metrics = {
  assistantRequests: 0,
  assistantSuccesses: 0,
  assistantFailures: 0,
  lastAssistantSuccessAt: null,
  lastAssistantFailureAt: null,
};
const rateBuckets = new Map();
let knowledgeCache = { mtimeMs: 0, documents: [] };

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb', strict: true }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use((req, res, next) => {
  if (/\/(login|signup|dashboard|ai-ops)\.html$/.test(req.path) || req.path === '/content-data.json') {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

function publicAiState() {
  return config.openaiApiKey ? 'ready' : 'not_configured';
}

function normaliseText(value, maxLength) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, maxLength) : '';
}

function rateLimitAssistant(req, res, next) {
  const key = String(req.ip || req.socket.remoteAddress || 'unknown');
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, startedAt: now };
  if (now - bucket.startedAt >= config.rateWindowMs) {
    bucket.count = 0;
    bucket.startedAt = now;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > config.maxRequestsPerWindow) {
    return res.status(429).json({ error: 'RATE_LIMITED', message: 'تم تجاوز عدد المحاولات المسموح بها مؤقتاً. حاول لاحقاً.' });
  }
  return next();
}

function getKnowledgeDocuments() {
  const contentPath = path.join(rootDir, 'content-data.json');
  try {
    const stat = fs.statSync(contentPath);
    if (stat.mtimeMs === knowledgeCache.mtimeMs) return knowledgeCache.documents;
    const raw = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const documents = [];
    for (const product of raw.products || []) {
      documents.push({
        type: 'product',
        id: product.id,
        ar: `${product.name?.ar || ''}. ${product.description?.ar || ''}. التصنيف: ${product.category?.ar || ''}. السعر: ${product.price || ''}`,
        en: `${product.name?.en || ''}. ${product.description?.en || ''}. Category: ${product.category?.en || ''}. Price: ${product.price || ''}`,
        es: `${product.name?.es || ''}. ${product.description?.es || ''}. Categoría: ${product.category?.es || ''}. Precio: ${product.price || ''}`,
        fr: `${product.name?.fr || ''}. ${product.description?.fr || ''}. Catégorie: ${product.category?.fr || ''}. Prix: ${product.price || ''}`,
      });
    }
    for (const article of raw.blog || []) {
      documents.push({
        type: 'article',
        id: article.id,
        ar: `${article.title?.ar || ''}. ${article.excerpt?.ar || ''}. التصنيف: ${article.category?.ar || ''}`,
        en: `${article.title?.en || ''}. ${article.excerpt?.en || ''}. Category: ${article.category?.en || ''}`,
        es: `${article.title?.es || ''}. ${article.excerpt?.es || ''}. Categoría: ${article.category?.es || ''}`,
        fr: `${article.title?.fr || ''}. ${article.excerpt?.fr || ''}. Catégorie: ${article.category?.fr || ''}`,
      });
    }
    knowledgeCache = { mtimeMs: stat.mtimeMs, documents };
    return documents;
  } catch (error) {
    console.error('Knowledge base read failed:', error.message);
    return [];
  }
}

function selectRelevantKnowledge(question, language) {
  const terms = new Set(question.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 2));
  const referencedIds = new Set((question.match(/\d+/g) || []).map(String));
  const score = (document) => {
    const text = String(document[language] || document.ar || '').toLowerCase();
    const termScore = [...terms].reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
    return termScore + (referencedIds.has(String(document.id)) ? 20 : 0);
  };
  return getKnowledgeDocuments()
    .map((document) => ({ document, score: score(document) }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 6)
    .map((item) => `[${item.document.type}:${item.document.id}] ${item.document[language] || item.document.ar}`)
    .join('\n');
}

function assistantPolicy(language, knowledge) {
  const languageName = { ar: 'العربية', en: 'English', es: 'Español', fr: 'Français' }[language] || 'العربية';
  return [
    'You are MindWeave Assistant, a helpful assistant for an AI digital-products platform.',
    `Reply in ${languageName}.`,
    'Answer only about MindWeave products, articles, free library, creator program, and general educational AI guidance.',
    'When the provided MindWeave knowledge is insufficient, say so clearly and suggest the relevant platform section. Do not invent products, prices, policies, availability, or account status.',
    'Do not request passwords, access tokens, payment data, private keys, or sensitive personal data.',
    'Do not provide individualized medical, legal, financial, or insurance advice. Briefly recommend a qualified professional when such advice is requested.',
    'Decline harmful, illegal, privacy-invasive, or credential-stealing requests.',
    'Keep answers practical and concise. Mention relevant product or article IDs when present in the supplied knowledge.',
    `MindWeave knowledge:\n${knowledge || 'No directly matching MindWeave material was found.'}`,
  ].join('\n');
}

async function callAi(messages, language, knowledge) {
  const response = await fetch(`${config.openaiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.aiModel,
      temperature: 0.35,
      max_tokens: Number(process.env.AI_MAX_TOKENS || 650),
      messages: [
        { role: 'system', content: assistantPolicy(language, knowledge) },
        ...messages,
      ],
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const error = new Error(`AI provider error ${response.status}`);
    error.status = response.status;
    error.body = body.slice(0, 400);
    throw error;
  }
  const data = await response.json();
  const answer = normaliseText(data?.choices?.[0]?.message?.content, 5000);
  if (!answer) throw new Error('AI provider returned an empty answer');
  return answer;
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mindweave',
    ai: publicAiState(),
    startedAt: startedAt.toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: process.env.RENDER_GIT_COMMIT || process.env.APP_VERSION || 'local',
  });
});

app.post('/api/assistant', rateLimitAssistant, async (req, res) => {
  const language = ['ar', 'en', 'es', 'fr'].includes(req.body?.language) ? req.body.language : 'ar';
  const question = normaliseText(req.body?.message, 1400);
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
  const safeHistory = history
    .map((entry) => ({ role: entry?.role === 'assistant' ? 'assistant' : 'user', content: normaliseText(entry?.content, 1000) }))
    .filter((entry) => entry.content);

  if (!question) return res.status(400).json({ error: 'INVALID_MESSAGE', message: 'اكتب سؤالك أولاً.' });
  if (!config.openaiApiKey) {
    return res.status(503).json({
      error: 'AI_NOT_CONFIGURED',
      message: 'المساعد قيد التفعيل. ما زال بإمكانك تصفح المتجر والمكتبة وبرنامج المبدعين.',
    });
  }

  metrics.assistantRequests += 1;
  const requestId = crypto.randomUUID();
  try {
    const knowledge = selectRelevantKnowledge(question, language);
    const answer = await callAi([...safeHistory, { role: 'user', content: question }], language, knowledge);
    metrics.assistantSuccesses += 1;
    metrics.lastAssistantSuccessAt = new Date().toISOString();
    res.json({ answer, requestId, model: config.aiModel, grounded: Boolean(knowledge) });
  } catch (error) {
    metrics.assistantFailures += 1;
    metrics.lastAssistantFailureAt = new Date().toISOString();
    console.error('Assistant request failed:', { requestId, message: error.message, status: error.status });
    res.status(503).json({
      error: 'AI_TEMPORARILY_UNAVAILABLE',
      message: 'المساعد غير متاح مؤقتاً، لكن بقية المنصة تعمل بشكل طبيعي. حاول مرة أخرى بعد لحظات.',
      requestId,
    });
  }
});

function currentAccessToken(req) {
  return String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
}

async function supabaseForUser(req, pathname, options = {}) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    const error = new Error('Supabase public configuration is missing');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  const token = currentAccessToken(req);
  if (!token) {
    const error = new Error('No user session supplied');
    error.code = 'UNAUTHORIZED';
    throw error;
  }
  const response = await fetch(`${config.supabaseUrl}${pathname}`, {
    ...options,
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = new Error(`Supabase user request failed: ${response.status}`);
    error.status = response.status;
    error.body = (await response.text().catch(() => '')).slice(0, 500);
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

async function requireOpsUser(req, res, next) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(503).json({ error: 'OPS_NOT_CONFIGURED', message: 'لوحة العمليات قيد التفعيل.' });
  }
  const token = currentAccessToken(req);
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
  try {
    const userResponse = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
      headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!userResponse.ok) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const user = await userResponse.json();
    const adminRows = await supabaseForUser(req, `/rest/v1/ai_ops_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`);
    if (!Array.isArray(adminRows) || !adminRows.length) return res.status(403).json({ error: 'FORBIDDEN' });
    req.opsUser = user;
    return next();
  } catch (error) {
    console.error('Ops user verification failed:', error.message);
    return res.status(503).json({ error: 'OPS_UNAVAILABLE' });
  }
}

function opsError(res, error) {
  console.error('AI operations request failed:', error.message, error.body || '');
  const status = error.code === 'SUPABASE_NOT_CONFIGURED' ? 503 : 502;
  return res.status(status).json({ error: 'OPS_UNAVAILABLE', message: 'تعذر الوصول إلى بيانات العمليات حالياً.' });
}

app.get('/api/ops/status', requireOpsUser, async (req, res) => {
  try {
    const latestRun = await supabaseForUser(req, '/rest/v1/ai_job_runs?select=job_type,status,started_at,completed_at,error_summary,processed_count,created_count&order=started_at.desc&limit=1');
    res.json({
      status: 'ok', ai: publicAiState(), model: config.aiModel, metrics,
      uptimeSeconds: Math.floor(process.uptime()), knowledgeDocuments: getKnowledgeDocuments().length,
      latestRun: latestRun?.[0] || null,
    });
  } catch (error) { return opsError(res, error); }
});

app.get('/api/ops/drafts', requireOpsUser, async (req, res) => {
  try {
    const status = ['draft', 'approved', 'rejected', 'published'].includes(req.query.status) ? `&status=eq.${req.query.status}` : '';
    const rows = await supabaseForUser(req, `/rest/v1/ai_content_drafts?select=id,source_url,source_title,language,status,title,summary,relevance_score,reviewer_note,created_at,reviewed_at,published_at&order=created_at.desc&limit=100${status}`);
    res.json({ drafts: rows || [] });
  } catch (error) { return opsError(res, error); }
});

app.patch('/api/ops/drafts/:id', requireOpsUser, async (req, res) => {
  const id = String(req.params.id || '');
  const status = String(req.body?.status || '');
  const reviewerNote = normaliseText(req.body?.reviewerNote, 1000) || null;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['approved', 'rejected', 'published'].includes(status)) {
    return res.status(400).json({ error: 'INVALID_REQUEST' });
  }
  try {
    const payload = { status, reviewer_note: reviewerNote, reviewed_at: new Date().toISOString() };
    if (status === 'published') payload.published_at = new Date().toISOString();
    const rows = await supabaseForUser(req, `/rest/v1/ai_content_drafts?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
    });
    res.json({ draft: rows?.[0] || null });
  } catch (error) { return opsError(res, error); }
});

app.get('/api/ops/sources', requireOpsUser, async (req, res) => {
  try {
    const rows = await supabaseForUser(req, '/rest/v1/ai_content_sources?select=id,name,source_url,language,is_enabled,last_checked_at,last_success_at,created_at&order=created_at.desc&limit=100');
    res.json({ sources: rows || [] });
  } catch (error) { return opsError(res, error); }
});

app.post('/api/ops/sources', requireOpsUser, async (req, res) => {
  const name = normaliseText(req.body?.name, 160);
  const sourceUrl = normaliseText(req.body?.sourceUrl, 1000);
  const language = ['ar', 'en', 'es', 'fr'].includes(req.body?.language) ? req.body.language : 'en';
  try { new URL(sourceUrl); } catch { return res.status(400).json({ error: 'INVALID_SOURCE_URL' }); }
  if (!name || !sourceUrl.startsWith('https://')) return res.status(400).json({ error: 'INVALID_SOURCE' });
  try {
    const rows = await supabaseForUser(req, '/rest/v1/ai_content_sources', {
      method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name, source_url: sourceUrl, language }),
    });
    res.status(201).json({ source: rows?.[0] || null });
  } catch (error) { return opsError(res, error); }
});

app.use(express.static(rootDir, { dotfiles: 'ignore', etag: true }));

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`MindWeave server running on port ${port}`);
});
