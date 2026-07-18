# MindWeave API Documentation

## 📚 مقدمة | Introduction

هذا المستند يوثق جميع الدوال والـ APIs المتاحة في منصة MindWeave.

## 🔐 المصادقة | Authentication

### Sign Up

```javascript
async function signUpUser(email, password, fullName) {
  // Parameters:
  // - email: string (البريد الإلكتروني)
  // - password: string (كلمة المرور)
  // - fullName: string (الاسم الكامل)
  
  // Returns:
  // { success: boolean, message: string, user: object }
}
```

**مثال:**
```javascript
const result = await signUpUser('user@example.com', 'password123', 'أحمد محمد');
if (result.success) {
  console.log('تم إنشاء الحساب بنجاح');
}
```

### Sign In

```javascript
async function signInUser(email, password) {
  // Parameters:
  // - email: string
  // - password: string
  
  // Returns:
  // { success: boolean, message: string, user: object }
}
```

### Sign Out

```javascript
async function signOutUser() {
  // Returns:
  // { success: boolean, message: string }
}
```

### Check Auth Status

```javascript
async function checkAuthStatus() {
  // Returns:
  // { authenticated: boolean, verified: boolean, user: object }
}
```

## 🛍️ المنتجات | Products

### تحميل المنتجات

```javascript
async function loadProducts() {
  // تحميل جميع المنتجات من content-data.json
  // Returns: void (يحدث products array)
}
```

### عرض المنتجات

```javascript
function renderProducts() {
  // عرض المنتجات في الشبكة
  // يستخدم currentFilter و currentLang
}
```

### إضافة إلى السلة

```javascript
function addToCart(id) {
  // Parameters:
  // - id: number (معرف المنتج)
  
  // يضيف المنتج إلى السلة ويحفظه في localStorage
}
```

### إزالة من السلة

```javascript
function removeFromCart(id) {
  // Parameters:
  // - id: number
}
```

## 📝 المدونة | Blog

### تحميل المقالات

```javascript
async function loadBlogPosts() {
  // تحميل المقالات من content-data.json
  // يحدث blogPosts array
}
```

### عرض المقالات

```javascript
function renderBlog() {
  // عرض المقالات في الشبكة
  // يستخدم currentFilter و currentLang
}
```

### عرض مقالة واحدة

```javascript
async function renderArticle() {
  // عرض مقالة واحدة بناءً على URL parameter
  // يقرأ id من query string
}
```

## 🌐 اللغات | Languages

### تغيير اللغة

```javascript
function changeLanguage(lang) {
  // Parameters:
  // - lang: string ('ar', 'en', 'es', 'fr')
  
  // يغير اللغة الحالية ويحدث الواجهة
}
```

### تحديث اللغة

```javascript
function updateLanguage() {
  // يحدث جميع النصوص بناءً على اللغة الحالية
  // يستخدم data-i18n attributes
}
```

### الحصول على الترجمة

```javascript
function getTranslation(key) {
  // Parameters:
  // - key: string ('nav.home', 'hero.title', etc.)
  
  // Returns: string (النص المترجم)
}
```

## 💌 النشرة البريدية | Newsletter

### الاشتراك

```javascript
async function subscribeToNewsletter(email) {
  // Parameters:
  // - email: string
  
  // Returns:
  // { success: boolean, message: string }
}
```

### الحصول على المشتركين

```javascript
async function getNewsletterSubscribers() {
  // Returns:
  // { success: boolean, data: array }
}
```

### إرسال النشرة

```javascript
async function sendNewsletterUpdate(subject, content, productName) {
  // Parameters:
  // - subject: string
  // - content: string
  // - productName: string
  
  // Returns:
  // { success: boolean, message: string }
}
```

## 🎨 واجهة المستخدم | UI

### عرض الإشعار

```javascript
function showNotification(icon, text) {
  // Parameters:
  // - icon: string (emoji)
  // - text: string
  
  // يعرض إشعار لمدة 3 ثوانٍ
}
```

### فتح/إغلاق القائمة

```javascript
function toggleLangMenu() {
  // يفتح/يغلق قائمة اختيار اللغة
}
```

### تحديث عدد السلة

```javascript
function updateCartCount() {
  // يحدث عدد المنتجات في السلة
}
```

## 📊 البيانات | Data

### هيكل المنتج

```javascript
{
  id: number,
  name: string,
  description: string,
  price: string,
  category: string,
  rating: number,
  emoji: string
}
```

### هيكل المقالة

```javascript
{
  id: number,
  title: string,
  excerpt: string,
  content: string,
  date: string,
  category: string,
  author: string
}
```

### هيكل المستخدم

```javascript
{
  id: string,
  email: string,
  email_confirmed_at: string,
  user_metadata: {
    full_name: string
  }
}
```

## 🔄 الأحداث | Events

### DOMContentLoaded

```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateLanguage();
  updateCartCount();
});
```

### تغيير اللغة

```javascript
document.querySelectorAll('.lang-option').forEach(opt => {
  opt.addEventListener('click', () => {
    changeLanguage(opt.dataset.lang);
  });
});
```

### تصفية المنتجات

```javascript
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    renderProducts();
  });
});
```

## 🚀 أمثلة الاستخدام | Usage Examples

### مثال 1: تسجيل مستخدم جديد

```javascript
async function registerNewUser() {
  const result = await signUpUser(
    'user@example.com',
    'SecurePassword123!',
    'محمد أحمد'
  );
  
  if (result.success) {
    showNotification('✅', 'تم إنشاء الحساب بنجاح');
    window.location.href = 'login.html';
  } else {
    showNotification('❌', result.message);
  }
}
```

### مثال 2: تحميل وعرض المنتجات

```javascript
async function displayProducts() {
  await loadProducts();
  renderProducts();
}
```

### مثال 3: تغيير اللغة والعرض

```javascript
function switchToEnglish() {
  changeLanguage('en');
  updateLanguage();
  renderProducts();
  renderBlog();
}
```

### مثال 4: إضافة منتج إلى السلة

```javascript
function addProductToCart(productId) {
  addToCart(productId);
  updateCartCount();
  showNotification('🛒', 'تم إضافة المنتج إلى السلة');
}
```

## 🔗 الروابط المفيدة | Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 📞 الدعم | Support

للمساعدة والدعم، يرجى التواصل عبر:
- البريد الإلكتروني: info@mindweave.store
- الموقع: https://mindweave.store/contact.html

---

**آخر تحديث: 2026-07-17**
