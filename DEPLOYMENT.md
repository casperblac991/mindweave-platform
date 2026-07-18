# دليل النشر والاستضافة | Deployment & Hosting Guide

## 🌐 خيارات الاستضافة | Hosting Options

### 1. GitHub Pages (مجاني)

**المميزات:**
- مجاني تماماً
- نشر تلقائي من GitHub
- دعم HTTPS
- CDN عالمي

**خطوات النشر:**

```bash
# 1. إنشاء فرع gh-pages
git checkout -b gh-pages

# 2. دفع الملفات
git push origin gh-pages

# 3. تفعيل GitHub Pages من الإعدادات
# Settings > Pages > Source: gh-pages branch
```

**الرابط:**
```
https://casperblac991.github.io/mindweave-platform/
```

### 2. Vercel (موصى به)

**المميزات:**
- نشر سريع جداً
- CDN عالمي
- دعم HTTPS
- معاينة مباشرة للـ Pull Requests

**خطوات النشر:**

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. النشر
vercel

# 3. اتبع الخطوات التفاعلية
```

### 3. Netlify

**المميزات:**
- نشر سهل وسريع
- دعم Functions
- معاينة مباشرة
- CDN عالمي

**خطوات النشر:**

```bash
# 1. تثبيت Netlify CLI
npm install -g netlify-cli

# 2. النشر
netlify deploy --prod
```

### 4. استضافة تقليدية (Shared Hosting)

**خطوات النشر:**

```bash
# 1. ضغط الملفات
zip -r mindweave.zip .

# 2. رفع عبر FTP أو File Manager
# استخدم FileZilla أو cPanel

# 3. تأكد من أن index.html في الجذر
```

## 🔧 الإعدادات المطلوبة | Required Configuration

### ملف .htaccess (للاستضافة التقليدية)

```apache
# تفعيل mod_rewrite
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # إعادة توجيه الطلبات إلى index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# تفعيل GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# تخزين مؤقت
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 day"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType image/* "access plus 1 year"
</IfModule>
```

### ملف vercel.json

```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": ".",
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ]
}
```

### ملف netlify.toml

```toml
[build]
  command = "echo 'No build needed'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[headers]
  [[headers.values]]
    key = "Cache-Control"
    value = "public, max-age=3600, must-revalidate"
```

## 🌍 النطاق المخصص | Custom Domain

### تكوين DNS

**لـ GitHub Pages:**
```
A record: 185.199.108.153
A record: 185.199.109.153
A record: 185.199.110.153
A record: 185.199.111.153
```

**لـ Vercel:**
```
CNAME: cname.vercel-dns.com
```

**لـ Netlify:**
```
CNAME: mindweave.netlify.app
```

## 🔐 الأمان | Security

### HTTPS

- تأكد من تفعيل HTTPS على جميع الصفحات
- استخدم SSL/TLS certificate
- أعد توجيه HTTP إلى HTTPS

```apache
# إعادة توجيه HTTP إلى HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Headers الأمان

```apache
# منع X-Frame-Options
Header always set X-Frame-Options "SAMEORIGIN"

# منع XSS
Header always set X-XSS-Protection "1; mode=block"

# Content Security Policy
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com"
```

## 📊 المراقبة | Monitoring

### Google Search Console

1. تحقق من ملكية الموقع
2. أرسل sitemap.xml
3. راقب الأخطاء والتحذيرات

### Google Analytics

```html
<!-- أضف في <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🚀 خطوات النشر النهائية | Final Deployment Steps

### قائمة التحقق | Checklist

- [ ] اختبار جميع الصفحات
- [ ] اختبار جميع الروابط
- [ ] اختبار المتصفحات المختلفة
- [ ] اختبار الأجهزة المختلفة
- [ ] اختبار اللغات المختلفة
- [ ] تحسين الأداء
- [ ] التحقق من الأمان
- [ ] إعداد النطاق المخصص
- [ ] إعداد البريد الإلكتروني
- [ ] إعداد المراقبة والتحليلات
- [ ] إنشاء sitemap.xml
- [ ] إنشاء robots.txt

### ملف robots.txt

```
User-agent: *
Allow: /

Sitemap: https://mindweave.store/sitemap.xml
```

### ملف sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mindweave.store/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mindweave.store/store.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mindweave.store/blog.html</loc>
    <priority>0.8</priority>
  </url>
</urlset>
```

## 📱 نشر تطبيق الهاتف | Mobile App Deployment

### PWA (Progressive Web App)

```json
{
  "name": "MindWeave",
  "short_name": "MindWeave",
  "description": "منصة الذكاء الاصطناعي العربية",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#050A0F",
  "theme_color": "#00D4FF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔄 التحديثات المستمرة | Continuous Updates

### GitHub Actions

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

**آخر تحديث: 2026-07-17**
