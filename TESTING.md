# دليل الاختبار | Testing Guide

## 🧪 أنواع الاختبارات | Types of Tests

### 1. اختبار الوحدة | Unit Testing

اختبار الدوال الفردية بشكل منعزل.

```javascript
// مثال: اختبار دالة تغيير اللغة
function testChangeLanguage() {
  changeLanguage('en');
  
  assert(currentLang === 'en', 'اللغة لم تتغير');
  assert(document.body.getAttribute('data-lang') === 'en', 'الـ data-lang لم يتحدث');
  assert(document.documentElement.dir === 'ltr', 'الاتجاه لم يتحدث');
  
  console.log('✅ اختبار تغيير اللغة نجح');
}
```

### 2. اختبار التكامل | Integration Testing

اختبار تفاعل عدة مكونات معاً.

```javascript
// مثال: اختبار تحميل وعرض المنتجات
async function testProductLoading() {
  await loadProducts();
  renderProducts();
  
  const grid = document.getElementById('productsGrid');
  const cards = grid.querySelectorAll('.product-card');
  
  assert(cards.length > 0, 'لم يتم عرض أي منتجات');
  assert(products.length > 0, 'لم يتم تحميل المنتجات');
  
  console.log('✅ اختبار تحميل المنتجات نجح');
}
```

### 3. اختبار النهاية إلى النهاية | End-to-End Testing

اختبار سير العمل الكامل من البداية إلى النهاية.

```javascript
// مثال: اختبار عملية الشراء الكاملة
async function testCheckoutFlow() {
  // 1. تسجيل دخول
  const loginResult = await signInUser('user@example.com', 'password');
  assert(loginResult.success, 'فشل تسجيل الدخول');
  
  // 2. إضافة منتج إلى السلة
  addToCart(1);
  assert(cart.includes(1), 'لم يتم إضافة المنتج');
  
  // 3. الذهاب إلى السلة
  window.location.href = 'cart.html';
  
  // 4. إتمام الشراء
  // ... اختبار عملية الدفع
  
  console.log('✅ اختبار سير الشراء نجح');
}
```

## 📋 قائمة الاختبارات | Test Checklist

### اختبارات الوظائف | Functionality Tests

- [ ] تسجيل مستخدم جديد
- [ ] تسجيل الدخول
- [ ] تسجيل الخروج
- [ ] تحميل المنتجات
- [ ] تصفية المنتجات
- [ ] إضافة إلى السلة
- [ ] إزالة من السلة
- [ ] تحميل المقالات
- [ ] عرض مقالة واحدة
- [ ] تغيير اللغة
- [ ] الاشتراك في النشرة البريدية

### اختبارات التصميم | Design Tests

- [ ] التصميم المتجاوب (Responsive)
- [ ] الألوان والتباين
- [ ] الخطوط والأحجام
- [ ] المحاذاة والمسافات
- [ ] الأيقونات والصور
- [ ] التأثيرات الانتقالية

### اختبارات الأداء | Performance Tests

- [ ] سرعة تحميل الصفحات
- [ ] استهلاك الذاكرة
- [ ] استهلاك البطارية
- [ ] سرعة الاستجابة
- [ ] تحسين الصور

### اختبارات الأمان | Security Tests

- [ ] تشفير كلمات المرور
- [ ] التحقق من البريد الإلكتروني
- [ ] حماية من XSS
- [ ] حماية من CSRF
- [ ] HTTPS

### اختبارات الوصولية | Accessibility Tests

- [ ] قارئات الشاشة
- [ ] لوحة المفاتيح
- [ ] التباين اللوني
- [ ] حجم النص
- [ ] ARIA labels

## 🌐 اختبار المتصفحات | Browser Testing

### المتصفحات المدعومة

| المتصفح | الإصدار الأدنى | الحالة |
|---------|----------------|--------|
| Chrome | 90 | ✅ مدعوم |
| Firefox | 88 | ✅ مدعوم |
| Safari | 14 | ✅ مدعوم |
| Edge | 90 | ✅ مدعوم |
| Opera | 76 | ✅ مدعوم |

### خطوات الاختبار

```bash
# 1. فتح الموقع في كل متصفح
# 2. اختبار جميع الصفحات
# 3. اختبار جميع الوظائف
# 4. التحقق من الأخطاء في Console
# 5. اختبار الأداء
```

## 📱 اختبار الأجهزة | Device Testing

### الأجهزة المدعومة

| الجهاز | الدقة | الحالة |
|--------|-------|--------|
| iPhone 12 | 390x844 | ✅ |
| iPhone SE | 375x667 | ✅ |
| iPad | 768x1024 | ✅ |
| Samsung S21 | 360x800 | ✅ |
| Desktop | 1920x1080 | ✅ |

## 🌍 اختبار اللغات | Language Testing

### اختبار كل لغة

```javascript
// اختبار العربية
changeLanguage('ar');
assert(document.body.getAttribute('data-lang') === 'ar');
assert(document.documentElement.dir === 'rtl');

// اختبار الإنجليزية
changeLanguage('en');
assert(document.body.getAttribute('data-lang') === 'en');
assert(document.documentElement.dir === 'ltr');

// اختبار الإسبانية
changeLanguage('es');
assert(document.body.getAttribute('data-lang') === 'es');

// اختبار الفرنسية
changeLanguage('fr');
assert(document.body.getAttribute('data-lang') === 'fr');
```

## 🔍 أدوات الاختبار | Testing Tools

### أدوات موصى بها

- **Jest**: اختبار الوحدات
- **Cypress**: اختبار النهاية إلى النهاية
- **Lighthouse**: اختبار الأداء
- **WAVE**: اختبار الوصولية
- **BrowserStack**: اختبار المتصفحات المتعددة

### تثبيت Jest

```bash
npm install --save-dev jest
```

### كتابة اختبار Jest

```javascript
// test.js
describe('MindWeave Tests', () => {
  test('تغيير اللغة يعمل بشكل صحيح', () => {
    changeLanguage('en');
    expect(currentLang).toBe('en');
  });

  test('إضافة إلى السلة تعمل بشكل صحيح', () => {
    addToCart(1);
    expect(cart).toContain(1);
  });
});
```

## 📊 تقرير الاختبار | Test Report

### نموذج تقرير

```
تقرير الاختبار - MindWeave Platform
التاريخ: 2026-07-17
الإصدار: 2.0.0

✅ اختبارات الوظائف: 12/12 نجح
✅ اختبارات التصميم: 10/10 نجح
✅ اختبارات الأداء: 8/8 نجح
✅ اختبارات الأمان: 6/6 نجح
✅ اختبارات الوصولية: 7/7 نجح

النسبة الإجمالية: 100% ✅

الملاحظات:
- جميع الاختبارات نجحت
- لا توجد أخطاء حرجة
- الأداء ممتازة
- الأمان جيد
```

## 🚀 الاختبار المستمر | Continuous Testing

### GitHub Actions

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 📝 نصائح الاختبار | Testing Tips

1. **اختبر في بيئة حقيقية**: استخدم أجهزة حقيقية وليس المحاكيات فقط
2. **اختبر جميع السيناريوهات**: الحالات الطبيعية والاستثنائية
3. **اختبر الأداء**: تأكد من سرعة التحميل والاستجابة
4. **اختبر الأمان**: تحقق من الثغرات الأمنية
5. **اختبر الوصولية**: تأكد من سهولة الاستخدام للجميع
6. **وثق النتائج**: احفظ تقارير الاختبار

---

**آخر تحديث: 2026-07-17**
