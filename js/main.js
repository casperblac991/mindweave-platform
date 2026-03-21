document.addEventListener('DOMContentLoaded', function() {
    
    let lang = localStorage.getItem('lang') || 'ar';
    const btn = document.querySelector('.lang-switch');
    
    if (btn) {
        btn.textContent = lang === 'ar' ? 'English' : 'عربي';
        btn.addEventListener('click', function() {
            lang = lang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('lang', lang);
            btn.textContent = lang === 'ar' ? 'English' : 'عربي';
            alert(lang === 'ar' ? 'تم التغيير إلى العربية' : 'Switched to English');
        });
    }
    
    const buttons = document.querySelectorAll('.product-card button');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert(lang === 'ar' ? 'تم إضافة المنتج إلى السلة' : 'Product added to cart');
        });
    });
    
    console.log('MindWeave ready');
});
