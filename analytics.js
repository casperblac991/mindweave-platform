(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-DZ4WQDX31M';
  const MAX_VALUE_LENGTH = 120;
  const ALLOWED_EVENTS = new Set([
    'page_view',
    'view_item',
    'select_content',
    'add_to_cart',
    'remove_from_cart',
    'begin_checkout',
    'generate_prompt',
    'copy_prompt',
    'save_prompt',
    'search',
    'newsletter_signup',
    'sign_up',
    'login',
    'creator_application_submit',
    'campaign_lead',
    'campaign_share'
  ]);

  function cleanValue(value) {
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    return String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, MAX_VALUE_LENGTH);
  }

  function track(eventName, parameters = {}) {
    if (!ALLOWED_EVENTS.has(eventName) || typeof window.gtag !== 'function') return;
    const safeParameters = Object.fromEntries(
      Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, cleanValue(value)])
    );
    window.gtag('event', eventName, safeParameters);
  }

  window.mwTrack = track;

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

  initGoogleAnalytics();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireEvents, { once: true });
  else wireEvents();
})();
