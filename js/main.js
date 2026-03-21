document.addEventListener('DOMContentLoaded', function() {
    
    // Language Switch
    let currentLang = localStorage.getItem('mindweave-lang') || 'ar';
    const body = document.body;
    const langSwitch = document.querySelector('.lang-switch');
    
    function applyLanguage(lang) {
        if (lang === 'en') {
            body.classList.add('ltr');
            body.classList.remove('rtl');
            document.documentElement.dir = 'ltr';
            if (langSwitch) langSwitch.textContent = 'عربي';
        } else {
            body.classList.remove('ltr');
            body.classList.add('rtl');
            document.documentElement.dir = 'rtl';
            if (langSwitch) langSwitch.textContent = 'English';
        }
        localStorage.setItem('mindweave-lang', lang);
    }
    
    function switchLanguage() {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        applyLanguage(currentLang);
        const currentPath = window.location.pathname;
        const isEnglishPage = currentPath.includes('/en/');
        if (currentLang === 'en' && !isEnglishPage) {
            window.location.href = '/en' + (currentPath === '/' ? '/index.html' : currentPath);
        } else if (currentLang === 'ar' && isEnglishPage) {
            const newPath = currentPath.replace('/en/', '/');
            window.location.href = newPath === '/index.html' ? '/' : newPath;
        }
    }
    
    if (langSwitch) langSwitch.addEventListener('click', switchLanguage);
    applyLanguage(currentLang);
    
    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('active'));
        });
    }
    
    // Cart Counter
    let cartCount = localStorage.getItem('mindweave-cart') || 0;
    const cartCountSpan = document.querySelector('.cart-count');
    if (cartCountSpan) cartCountSpan.textContent = cartCount;
    
    window.addToCart = function(productName, price) {
        cartCount++;
        localStorage.setItem('mindweave-cart', cartCount);
        if (cartCountSpan) cartCountSpan.textContent = cartCount;
        const msg = current
