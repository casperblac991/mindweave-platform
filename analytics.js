(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-DZ4WQDX31M';
  const TIKTOK_PIXEL_ID = window.MW_TIKTOK_PIXEL_ID || '';
  const MAX_VALUE_LENGTH = 120;
  const ALLOWED_EVENTS = new Set([
    'page_view',
    'view_item',
    'select_content',
    'add_to_cart',
    'remove_from_cart',
    'begin_checkout',
    'purchase',
    'generate_prompt',
    'copy_prompt',
    'save_prompt',
    'search',
    'newsletter_signup',
    'sign_up',
    'login',
    'creator_application_submit',
    'campaign_lead',
    'campaign_share',
    'instagram_reel_click',
    'prompt_workbench_run',
    'prompt_draft_saved'
  ]);

  function cleanValue(value) {
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    return String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, MAX_VALUE_LENGTH);
  }

  function track(eventName, parameters = {}) {
    if (!ALLOWED_EVENTS.has(eventName) || typeof window.gtag !== 'function') return;
    const attribution = window.__mwAttribution || {};
    const safeParameters = Object.fromEntries(
      Object.entries({ ...attribution, ...parameters }).filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, cleanValue(value)])
    );
    window.gtag('event', eventName, safeParameters);
    const ttEventMap = { page_view: 'PageView', view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'CompletePayment' };
    const ttEvent = ttEventMap[eventName];
    if (ttEvent && window.ttq?.track) window.ttq.track(ttEvent, safeParameters);
  }

  window.mwTrack = track;

  function captureAttribution() {
    const allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const current = Object.fromEntries(allowed.map(key => [key, new URLSearchParams(window.location.search).get(key)]).filter(([, value]) => value));
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem('mw_attribution') || '{}'); } catch (_) {}
    const attribution = { ...stored, ...current };
    try { sessionStorage.setItem('mw_attribution', JSON.stringify(attribution)); } catch (_) {}
    window.__mwAttribution = attribution;
  }

  function initGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
    }
    if (!window.__mwGaConfigured) {
      window.gtag('config', MEASUREMENT_ID);
      window.__mwGaConfigured = true;
    }
    if (!document.querySelector(`script[data-mindweave-ga="${MEASUREMENT_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      script.dataset.mindweaveGa = MEASUREMENT_ID;
      document.head.appendChild(script);
    }
  }

  function initTikTokPixel() {
    if (!TIKTOK_PIXEL_ID || window.__mwTikTokConfigured) return;
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      const ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = function (object, method) { object[method] = function () { object.push([method].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (id) { const instance = ttq._i[id] || []; for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(instance, ttq.methods[i]); return instance; };
      ttq.load = function (id) { const script = d.createElement('script'); script.async = true; script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=${t}`; d.head.appendChild(script); };
      ttq._i = ttq._i || {}; ttq._i[TIKTOK_PIXEL_ID] = []; ttq.load(TIKTOK_PIXEL_ID); ttq.page();
    })(window, document, 'ttq');
    window.__mwTikTokConfigured = true;
  }

  function pageType() {
    const path = window.location.pathname.split('/').pop();
    return path && path !== 'index.html' ? path.replace(/\.html$/, '') : 'home';
  }

  function wireEvents() {
    document.addEventListener('click', (event) => {
      const target = event.target.closest('button, a');
      if (!target) return;

      const addToCartHandler = target.getAttribute('onclick') || '';
      const cartMatch = addToCartHandler.match(/addToCart\((\d+)\)/);
      if (cartMatch) {
        track('add_to_cart', { item_id: cartMatch[1], page_type: pageType() });
      }

      const href = target.getAttribute('href') || '';
      if (href.includes('store.html')) {
        track('select_content', { content_type: 'store', page_type: pageType() });
      }

      const id = target.id;
      const eventById = {
        generateBtn: 'generate_prompt',
        copyBtn: 'copy_prompt',
        saveBtn: 'save_prompt',
        subscribeBtn: 'newsletter_signup'
      };
      if (eventById[id]) track(eventById[id], { page_type: pageType() });
    });

    document.addEventListener('submit', (event) => {
      const id = event.target?.id;
      const eventByForm = {
        signupForm: 'sign_up',
        loginForm: 'login',
        creatorApplicationForm: 'creator_application_submit'
      };
      if (eventByForm[id]) track(eventByForm[id], { page_type: pageType() });
    });

    const searchInput = document.getElementById('globalSearch');
    searchInput?.addEventListener('change', () => {
      const query = searchInput.value.trim();
      if (query) track('search', { search_term: query, page_type: pageType() });
    });

    document.querySelectorAll('[data-product-id]').forEach((element) => {
      element.addEventListener('click', () => track('view_item', {
        item_id: element.dataset.productId,
        page_type: pageType()
      }));
    });
  }

  captureAttribution();
  initGoogleAnalytics();
  initTikTokPixel();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireEvents, { once: true });
  else wireEvents();
})();
