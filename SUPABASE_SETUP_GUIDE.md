# MindWeave + Supabase Integration Guide

هذا الدليل يشرح كيفية دمج **Supabase** في منصة **MindWeave** لتفعيل ميزات تسجيل الدخول، إدارة حسابات العملاء، وجمع رسائل البريد الإلكتروني.

---

## 📋 المتطلبات

- حساب Supabase (https://supabase.com)
- مشروع Supabase تم إنشاؤه بالفعل
- معرفة أساسية بـ HTML و JavaScript

---

## 🚀 خطوات التثبيت

### 1️⃣ الحصول على بيانات Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك (`mindweave-platform`)
3. اذهب إلى **Settings > API**
4. انسخ:
   - **Project URL** (سيكون مثل: `https://mtirzcuntupkuavmjtcv.supabase.co`)
   - **Anon Public Key** (المفتاح العام)

### 2️⃣ إعداد قاعدة البيانات

1. اذهب إلى **SQL Editor** في لوحة Supabase
2. انسخ محتوى ملف `supabase-setup.sql` من المستودع
3. الصقه في محرر SQL وقم بتشغيله (Run)
4. هذا سينشئ جميع الجداول والدوال المطلوبة

### 3️⃣ تحديث ملف supabase-auth.js

افتح ملف `supabase-auth.js` وحدّث البيانات التالية:

```javascript
const SUPABASE_URL = 'https://mtirzcuntupkuavmjtcv.supabase.co'; // ضع رابط مشروعك
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ضع مفتاحك العام هنا
```

### 4️⃣ إضافة المكتبات المطلوبة

أضف هذا السطر في رأس ملف `index.html` (قبل الإغلاق `</head>`):

```html
<!-- Supabase JavaScript Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- MindWeave Auth Module -->
<script src="./supabase-auth.js"></script>
```

### 5️⃣ إضافة نماذج المصادقة

أضف محتوى ملف `auth-modals.html` قبل إغلاق الـ `</body>` في `index.html`:

```html
<!-- Copy the entire content of auth-modals.html here -->
```

أو يمكنك استخدام `<iframe>` أو تضمين الملف مباشرة.

### 6️⃣ تحديث أزرار رأس الصفحة

استبدل أزرار الدخول والتسجيل في `index.html` بـ:

```html
<div id="authButtons">
    <button onclick="showAuthModal('login')" class="btn-login">🔐 دخول</button>
    <button onclick="showAuthModal('signup')" class="btn-signup">🚀 إنشاء حساب</button>
</div>
```

---

## 🔧 الميزات المتاحة

### ✅ تسجيل الدخول والتسجيل
- المستخدمون يمكنهم إنشاء حسابات جديدة
- تسجيل الدخول الآمن عبر Supabase Auth
- تخزين بيانات المستخدم بشكل آمن

### ✅ جمع رسائل البريد الإلكتروني
- نموذج الاشتراك في النشرة البريدية
- تخزين الإيميلات في قاعدة البيانات
- منع الإيميلات المكررة

### ✅ إدارة المشتركين
- عرض قائمة المشتركين (للمسؤولين)
- إرسال تحديثات بريدية تلقائية
- تتبع حالة الاشتراك

### ✅ سجل النشاط
- تسجيل جميع إجراءات المستخدم
- تتبع عمليات الشراء
- تحليل سلوك المستخدم

---

## 📧 إرسال رسائل بريدية تلقائية

لإرسال رسائل بريدية تلقائية عند صدور منتجات جديدة:

### الخطوة 1: إنشاء Edge Function

1. اذهب إلى **Edge Functions** في Supabase
2. أنشئ دالة جديدة باسم `send-newsletter`
3. استخدم الكود التالي:

```javascript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subscribers, subject, content, productName } = await req.json();

    // Here you would integrate with SendGrid, Resend, or another email service
    // Example using Resend (you need to set up RESEND_API_KEY in secrets):
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const emailPromises = subscribers.map((subscriber) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "noreply@mindweave.store",
          to: subscriber.email,
          subject: subject,
          html: `
            <h2>${subject}</h2>
            <p>${content}</p>
            <p><strong>المنتج:</strong> ${productName}</p>
            <a href="https://mindweave.store">اكتشف المزيد</a>
          `,
        }),
      })
    );

    const results = await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.length,
        message: `تم إرسال ${results.length} رسالة بريدية`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### الخطوة 2: إضافة مفتاح API للبريد

1. اذهب إلى **Edge Functions > Secrets**
2. أضف `RESEND_API_KEY` مع مفتاح API من [Resend](https://resend.com)

### الخطوة 3: تحديث نظام الأتمتة

عدّل ملف `ai_automation_engine.py` لاستدعاء الدالة:

```python
# بعد توليد منتج جديد
def send_newsletter_notification(product_name, product_description):
    """Send newsletter to all subscribers"""
    import requests
    
    supabase_url = "https://mtirzcuntupkuavmjtcv.supabase.co"
    function_url = f"{supabase_url}/functions/v1/send-newsletter"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "subject": f"🎉 منتج جديد: {product_name}",
        "content": product_description,
        "productName": product_name
    }
    
    response = requests.post(function_url, json=payload, headers=headers)
    return response.json()
```

---

## 🔐 الأمان والخصوصية

### Row Level Security (RLS)
جميع الجداول محمية بـ RLS:
- المستخدمون يرون فقط بيانات حساباتهم
- المسؤولون فقط يمكنهم الوصول إلى قائمة المشتركين

### تشفير البيانات
- كلمات المرور محفوظة بشكل آمن عبر Supabase Auth
- الإيميلات محفوظة في قاعدة بيانات آمنة

### متطلبات كلمة المرور
- 8 أحرف على الأقل
- يجب أن تحتوي على أحرف وأرقام

---

## 🧪 اختبار النظام

### 1. اختبر التسجيل
```
1. اضغط على "إنشاء حساب"
2. أدخل بريدك الإلكتروني وكلمة مرور
3. يجب أن تظهر رسالة نجاح
4. تحقق من جدول user_profiles في Supabase
```

### 2. اختبر الدخول
```
1. اضغط على "دخول"
2. أدخل بيانات الحساب الذي أنشأته
3. يجب أن تظهر رسالة ترحيب
```

### 3. اختبر الاشتراك في النشرة البريدية
```
1. أدخل بريدك الإلكتروني في نموذج الاشتراك
2. اضغط على "احصل عليها"
3. تحقق من جدول newsletter_subscribers
```

---

## 📊 عرض البيانات

### لعرض المشتركين:
```javascript
const result = await getNewsletterSubscribers();
console.log(result.data); // قائمة جميع المشتركين
```

### لعرض عمليات الشراء:
```javascript
const purchases = await supabaseClient
    .from('user_purchases')
    .select('*')
    .eq('user_id', userId);
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot read property 'createClient'"
**الحل:** تأكد من أن مكتبة Supabase محملة قبل `supabase-auth.js`

### خطأ: "Invalid API key"
**الحل:** تحقق من أن `SUPABASE_ANON_KEY` صحيح

### خطأ: "Email already exists"
**الحل:** هذا يعني أن البريد الإلكتروني مسجل بالفعل

---

## 📞 الدعم والمساعدة

- [توثيق Supabase](https://supabase.com/docs)
- [منتدى Supabase](https://github.com/supabase/supabase/discussions)
- [قناة Slack للدعم](https://supabase.com/discord)

---

## ✅ قائمة التحقق النهائية

- [ ] تم إنشاء مشروع Supabase
- [ ] تم نسخ URL و API Key
- [ ] تم تشغيل ملف `supabase-setup.sql`
- [ ] تم تحديث `supabase-auth.js` ببيانات مشروعك
- [ ] تم إضافة مكتبة Supabase في HTML
- [ ] تم إضافة نماذج المصادقة
- [ ] تم اختبار التسجيل والدخول
- [ ] تم اختبار الاشتراك في النشرة البريدية
- [ ] تم ضبط Edge Function لإرسال الرسائل البريدية

---

**تم! منصتك الآن متصلة بـ Supabase وجاهزة لجمع بيانات العملاء والتواصل معهم! 🎉**
