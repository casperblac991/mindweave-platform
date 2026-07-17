# MindWeave Platform 🧠

منصة عربية متكاملة لأوامر الذكاء الاصطناعي والمنتجات الرقمية | A comprehensive Arabic platform for AI prompts and digital products

## 📋 نظرة عامة | Overview

MindWeave هي منصة عالمية متخصصة في توفير:
- ✨ أوامر الذكاء الاصطناعي (AI Prompts)
- 🎨 قوالب رقمية احترافية
- 📚 كتب إلكترونية وموارد تعليمية
- 💰 برنامج المبدعين لبيع المنتجات الرقمية
- ⚗️ Prompt Lab لتوليد وتحسين الأوامر

## 🌍 الميزات العالمية | Global Features

### دعم اللغات المتعددة | Multi-Language Support
- 🇸🇦 العربية (Arabic)
- 🇬🇧 English
- 🇪🇸 Español
- 🇫🇷 Français

### الصفحات المتاحة | Available Pages

| الصفحة | الملف | الوصف |
|--------|------|-------|
| الرئيسية | `index.html` | الصفحة الرئيسية مع عرض المنتجات والميزات |
| المتجر | `store.html` | متجر المنتجات الرقمية |
| المكتبة المجانية | `library.html` | موارد وأدوات مجانية |
| Prompt Lab | `prompt-lab.html` | أداة توليد الأوامر |
| برنامج المبدعين | `creators.html` | معلومات برنامج المبدعين |
| المدونة | `blog.html` | مقالات وموارد تعليمية |
| المقالة | `article.html` | عرض مقالة واحدة |
| تسجيل الدخول | `login.html` | صفحة تسجيل الدخول |
| إنشاء حساب | `signup.html` | صفحة إنشاء حساب جديد |
| سلة التسوق | `cart.html` | عرض المنتجات المختارة |
| من نحن | `about.html` | معلومات عن المنصة |
| تواصل معنا | `contact.html` | نموذج الاتصال |
| الأسئلة الشائعة | `faq.html` | الأسئلة الشائعة والإجابات |
| سياسة الخصوصية | `privacy.html` | سياسة حماية البيانات |
| شروط الاستخدام | `terms.html` | شروط استخدام المنصة |

## 🛠️ التقنيات المستخدمة | Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Data Management**: JSON (content-data.json)
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Internationalization**: Custom i18n system

## 📦 البيانات | Data Structure

### content-data.json
```json
{
  "lastUpdate": "ISO 8601 timestamp",
  "stats": {
    "products": 20,
    "sales": 2097,
    "rating": 4.85,
    "support": "24/7"
  },
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": "$9.99",
      "category": "AI Products",
      "rating": 4.8,
      "emoji": "✨"
    }
  ],
  "blog": [
    {
      "id": 1,
      "title": "Article Title",
      "excerpt": "Short excerpt",
      "content": "Full content in markdown",
      "date": "2026-06-10",
      "category": "AI News",
      "author": "MindWeave AI"
    }
  ]
}
```

## 🚀 البدء السريع | Quick Start

### 1. استنساخ المستودع | Clone Repository
```bash
git clone https://github.com/casperblac991/mindweave-platform.git
cd mindweave-platform
```

### 2. تشغيل الخادم المحلي | Run Local Server
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js
npx http-server
```

### 3. الوصول إلى المنصة | Access Platform
```
http://localhost:8000
```

## 🔐 المصادقة | Authentication

المنصة تستخدم Supabase للمصادقة والتخزين:

```javascript
// تسجيل مستخدم جديد | Sign up
await signUpUser(email, password, fullName);

// تسجيل الدخول | Sign in
await signInUser(email, password);

// تسجيل الخروج | Sign out
await signOutUser();
```

## 🌐 دعم اللغات | Language Support

تغيير اللغة برمجياً:
```javascript
changeLanguage('ar'); // Arabic
changeLanguage('en'); // English
changeLanguage('es'); // Spanish
changeLanguage('fr'); // French
```

## 📱 التصميم المتجاوب | Responsive Design

المنصة مصممة لتعمل على جميع الأجهزة:
- 📱 الهواتف الذكية (320px+)
- 📱 الأجهزة اللوحية (768px+)
- 💻 أجهزة الكمبيوتر (1024px+)

## 🎨 نظام الألوان | Color System

```css
--primary: #00D4FF (Cyan)
--secondary: #FF6B35 (Orange)
--accent: #7C3AED (Purple)
--bg: #050A0F (Dark)
--bg-card: #0A1628 (Card Background)
--text: #E8F4FD (Light Text)
--text-muted: #7A9BB5 (Muted Text)
```

## 📊 الإحصائيات | Statistics

- ✨ 20+ منتج رقمي
- 🛍️ 2000+ عملية بيع
- ⭐ تقييم 4.85/5
- 👥 50+ مبدع نشط

## 🔄 التحديثات المستقبلية | Future Updates

- [ ] نظام الدفع المتكامل
- [ ] لوحة تحكم المبدعين
- [ ] نظام التقييمات والتعليقات
- [ ] تطبيق الهاتف المحمول
- [ ] نظام التوصيات الذكي

## 📝 الترخيص | License

جميع الحقوق محفوظة © 2026 MindWeave

## 📧 التواصل | Contact

- 📧 البريد الإلكتروني: info@mindweave.store
- 🌐 الموقع: https://mindweave.store
- 💬 تواصل معنا: https://mindweave.store/contact.html

## 🤝 المساهمة | Contributing

نرحب بالمساهمات! يرجى:
1. Fork المستودع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. فتح Pull Request

---

**تم التطوير بواسطة MindWeave Team** 🚀
