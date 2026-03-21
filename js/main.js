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
        const msg = currentLang === 'ar' 
            ? `✅ تم إضافة ${productName} إلى السلة بسعر $${price}`
            : `✅ ${productName} added to cart for $${price}`;
        alert(msg);
    };
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value;
            if (email) {
                let subs = JSON.parse(localStorage.getItem('mindweave-subscribers') || '[]');
                subs.push({email, date: new Date().toISOString(), lang: currentLang});
                localStorage.setItem('mindweave-subscribers', JSON.stringify(subs));
                const msg = currentLang === 'ar'
                    ? '🎉 شكراً! سنرسل لك 100 أمر مجاني خلال دقائق.'
                    : '🎉 Thank you! We will send you 100 free prompts shortly.';
                alert(msg);
                this.reset();
            }
        });
    }
    
    // Chatbot
    const chatbot = document.getElementById('chatbot-toggle');
    if (chatbot) {
        chatbot.addEventListener('click', () => {
            const msg = currentLang === 'ar'
                ? '🤖 مساعد AI: مرحباً! كيف يمكنني مساعدتك؟\n\nيمكنك:\n- سؤال عن المنتجات\n- الحصول على خصم\n- مساعدة في الاختيار\n\nللرد: support@mindweave.store'
                : '🤖 AI Assistant: Hello! How can I help you?\n\nYou can:\n- Ask about products\n- Get a discount\n- Get help choosing\n\nReply: support@mindweave.store';
            alert(msg);
        });
    }
    
    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Stats Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateNumbers = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.innerText);
            if (target && !stat.classList.contains('animated')) {
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.innerText = target + (stat.innerText.includes('+') ? '+' : '');
                        clearInterval(timer);
                    } else {
                        stat.innerText = Math.floor(current) + (stat.innerText.includes('+') ? '+' : '');
                    }
                }, 30);
                stat.classList.add('animated');
            }
        });
    };
    
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(statsSection);
    }
    
    console.log('🧠 MindWeave - Ready!');
});
