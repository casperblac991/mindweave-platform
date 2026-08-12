(() => {
  'use strict';

  const language = document.documentElement.lang || 'ar';
  const copy = {
    ar: { title: 'مساعد MindWeave', subtitle: 'اسأل عن المنتجات والمكتبة وبرنامج المبدعين.', placeholder: 'اكتب سؤالك…', send: 'إرسال', greeting: 'مرحباً، كيف أساعدك في استكشاف MindWeave اليوم؟', loading: 'جارٍ التفكير…', unavailable: 'المساعد غير متاح مؤقتاً. تستطيع متابعة استكشاف المنصة بشكل طبيعي.', clear: 'مسح المحادثة', close: 'إغلاق', open: 'مساعد MindWeave' },
    en: { title: 'MindWeave Assistant', subtitle: 'Ask about products, the library, or the creator program.', placeholder: 'Ask a question…', send: 'Send', greeting: 'Hello! How can I help you explore MindWeave today?', loading: 'Thinking…', unavailable: 'The assistant is temporarily unavailable. You can keep exploring the platform normally.', clear: 'Clear chat', close: 'Close', open: 'MindWeave Assistant' },
    es: { title: 'Asistente MindWeave', subtitle: 'Pregunta sobre productos, la biblioteca o el programa de creadores.', placeholder: 'Escribe tu pregunta…', send: 'Enviar', greeting: '¡Hola! ¿Cómo puedo ayudarte a explorar MindWeave?', loading: 'Pensando…', unavailable: 'El asistente no está disponible temporalmente. Puedes seguir explorando la plataforma.', clear: 'Limpiar chat', close: 'Cerrar', open: 'Asistente MindWeave' },
    fr: { title: 'Assistant MindWeave', subtitle: 'Posez une question sur les produits, la bibliothèque ou le programme créateurs.', placeholder: 'Écrivez votre question…', send: 'Envoyer', greeting: 'Bonjour ! Comment puis-je vous aider à explorer MindWeave ?', loading: 'Réflexion…', unavailable: 'L’assistant est temporairement indisponible. Vous pouvez continuer à explorer la plateforme.', clear: 'Effacer', close: 'Fermer', open: 'Assistant MindWeave' },
  }[language] || null;
  const text = copy || {
    title: 'MindWeave Assistant', subtitle: 'Ask about MindWeave.', placeholder: 'Ask a question…', send: 'Send', greeting: 'Hello! How can I help?', loading: 'Thinking…', unavailable: 'The assistant is temporarily unavailable.', clear: 'Clear chat', close: 'Close', open: 'MindWeave Assistant',
  };
  const storageKey = `mindweave-ai-chat-v1-${language}`;
  let history = [];

  const style = document.createElement('style');
  style.textContent = `
    .mw-ai-toggle{position:fixed;z-index:9998;bottom:22px;inset-inline-end:22px;width:58px;height:58px;border:0;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#041018;box-shadow:0 14px 34px rgba(0,212,255,.28);font-size:24px;cursor:pointer}
    .mw-ai-panel{position:fixed;z-index:9999;bottom:92px;inset-inline-end:22px;width:min(390px,calc(100vw - 28px));height:min(560px,calc(100vh - 120px));display:none;flex-direction:column;overflow:hidden;background:#081322;color:#e8f4fd;border:1px solid rgba(0,212,255,.3);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.42);font-family:inherit;text-align:start}
    .mw-ai-panel.is-open{display:flex}.mw-ai-head{display:flex;align-items:flex-start;gap:10px;padding:16px;background:linear-gradient(135deg,rgba(0,212,255,.14),rgba(124,58,237,.17));border-bottom:1px solid rgba(0,212,255,.18)}.mw-ai-mark{display:grid;place-items:center;flex:0 0 auto;width:35px;height:35px;border-radius:11px;background:#00d4ff;color:#041018}.mw-ai-title{font-weight:900;font-size:15px}.mw-ai-subtitle{margin-top:2px;color:#a9c0d1;font-size:11px;line-height:1.45}.mw-ai-head-actions{display:flex;gap:5px;margin-inline-start:auto}.mw-ai-icon{width:29px;height:29px;padding:0;border:1px solid rgba(232,244,253,.22);border-radius:8px;background:transparent;color:#e8f4fd;cursor:pointer}.mw-ai-messages{display:flex;flex:1;flex-direction:column;gap:10px;overflow:auto;padding:14px}.mw-ai-message{max-width:86%;padding:10px 12px;border-radius:13px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.65}.mw-ai-message.assistant{align-self:flex-start;background:#102238;border:1px solid rgba(0,212,255,.12)}.mw-ai-message.user{align-self:flex-end;background:#00d4ff;color:#041018}.mw-ai-message.status{align-self:center;background:rgba(255,190,75,.1);color:#ffe4ab;font-size:12px}.mw-ai-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(0,212,255,.16);background:#07101c}.mw-ai-input{min-width:0;flex:1;padding:10px 11px;border:1px solid rgba(0,212,255,.25);border-radius:10px;background:#0b1b2d;color:#e8f4fd;font:inherit;font-size:13px;outline:none}.mw-ai-input:focus{border-color:#00d4ff}.mw-ai-send{padding:9px 12px;border:0;border-radius:10px;background:#00d4ff;color:#041018;font:inherit;font-weight:800;cursor:pointer}.mw-ai-send:disabled,.mw-ai-input:disabled{opacity:.58;cursor:not-allowed}@media(max-width:520px){.mw-ai-toggle{bottom:16px;inset-inline-end:16px}.mw-ai-panel{bottom:82px;inset-inline-end:14px}}
  `;
  document.head.appendChild(style);

  const toggle = document.createElement('button');
  toggle.className = 'mw-ai-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', text.open);
  toggle.textContent = '✦';

  const panel = document.createElement('section');
  panel.className = 'mw-ai-panel';
  panel.setAttribute('aria-label', text.title);
  panel.innerHTML = `
    <div class="mw-ai-head"><div class="mw-ai-mark">✦</div><div><div class="mw-ai-title"></div><div class="mw-ai-subtitle"></div></div><div class="mw-ai-head-actions"><button class="mw-ai-icon mw-ai-clear" type="button" aria-label="${text.clear}">↺</button><button class="mw-ai-icon mw-ai-close" type="button" aria-label="${text.close}">×</button></div></div>
    <div class="mw-ai-messages" aria-live="polite"></div>
    <form class="mw-ai-form"><input class="mw-ai-input" maxlength="1400" autocomplete="off"><button class="mw-ai-send" type="submit"></button></form>`;
  panel.querySelector('.mw-ai-title').textContent = text.title;
  panel.querySelector('.mw-ai-subtitle').textContent = text.subtitle;
  panel.querySelector('.mw-ai-input').placeholder = text.placeholder;
  panel.querySelector('.mw-ai-send').textContent = text.send;
  document.body.append(panel, toggle);

  const messages = panel.querySelector('.mw-ai-messages');
  const form = panel.querySelector('.mw-ai-form');
  const input = panel.querySelector('.mw-ai-input');
  const send = panel.querySelector('.mw-ai-send');

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      history = Array.isArray(saved) ? saved.filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string').slice(-12) : [];
    } catch { history = []; }
  }
  function saveHistory() {
    try { localStorage.setItem(storageKey, JSON.stringify(history.slice(-12))); } catch { /* local storage is optional */ }
  }
  function addMessage(role, content, extraClass = '') {
    const item = document.createElement('div');
    item.className = `mw-ai-message ${role}${extraClass ? ` ${extraClass}` : ''}`;
    item.textContent = content;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }
  function renderHistory() {
    messages.replaceChildren();
    if (!history.length) addMessage('assistant', text.greeting);
    else history.forEach((item) => addMessage(item.role, item.content));
  }
  function setBusy(busy) { input.disabled = busy; send.disabled = busy; }

  toggle.addEventListener('click', () => { panel.classList.toggle('is-open'); if (panel.classList.contains('is-open')) input.focus(); });
  panel.querySelector('.mw-ai-close').addEventListener('click', () => panel.classList.remove('is-open'));
  panel.querySelector('.mw-ai-clear').addEventListener('click', () => { history = []; saveHistory(); renderHistory(); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = '';
    addMessage('user', question);
    const priorHistory = history.slice(-6);
    history.push({ role: 'user', content: question });
    saveHistory();
    setBusy(true);
    const pending = addMessage('assistant', text.loading, 'status');
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, language, history: priorHistory }),
      });
      const data = await response.json().catch(() => ({}));
      pending.remove();
      if (!response.ok || !data.answer) throw new Error(data.message || text.unavailable);
      history.push({ role: 'assistant', content: data.answer });
      saveHistory();
      addMessage('assistant', data.answer);
    } catch (error) {
      pending.textContent = error.message || text.unavailable;
    } finally { setBusy(false); input.focus(); }
  });

  loadHistory();
  renderHistory();
})();
