# MindWeave Security and AI Safety

## ما تم تقويته

- مفاتيح OpenAI وPayPal وSupabase الحساسة تبقى على الخادم ولا تُرسل للمتصفح.
- مسارات الذكاء الاصطناعي والدفع تملك حدود معدل منفصلة.
- Prompt Lab يقبل مسودة بحد أقصى 2000 حرف، ويضعها داخل سياق غير موثوق قبل إرسالها للنموذج.
- مخرجات النموذج تُعرض كنص آمن في واجهة Prompt Lab، ولا تُحقن كـ HTML.
- بيانات الكتالوج والسلة تُهَرَّب قبل إدراجها في HTML لتقليل XSS.
- رؤوس أمان إضافية مفعّلة: `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, `same-origin-allow-popups`, ومنع DNS prefetch وسياسات النطاقات المتقاطعة.
- PayPal يحسب السعر على الخادم من كتالوج المنتجات، ولا يثق بسعر المتصفح.

## سياسة تشغيل الذكاء الاصطناعي

1. اعتبر كل إدخال من المستخدم أو مصدر خارجي غير موثوق.
2. لا تمنح النموذج أسرارًا أو صلاحيات تنفيذ مباشرة.
3. استخدم أقل قدر من السياق اللازم، وحدد طول الإدخال والمخرج.
4. راجع يدويًا أي محتوى سيُنشر تلقائيًا أو أي عملية عالية التأثير.
5. لا تعرض ادعاءات بأن النموذج تصفح الويب أو نفذ عملية ما لم يحدث ذلك فعليًا.
6. اختبر محاولات Prompt Injection دوريًا، مثل: `ignore previous instructions` وطلبات كشف الأسرار.
7. راقب معدل الطلبات والتكلفة وأخطاء المزود، مع إبقاء الموقع الأساسي متاحًا إذا تعطل الذكاء الاصطناعي.

## قبل تفعيل PayPal Live

- إكمال شراء Sandbox بحساب مشتري منفصل.
- التحقق من حالة PayPal `COMPLETED`.
- التحقق من تسجيل عملية واحدة فقط في Supabase.
- مراجعة السعر والعملة وسياسة الاسترجاع.
- التأكد من أن مفاتيح Live موجودة في بيئة الإنتاج فقط.

## المراجع الفنية

- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [OpenAI Safety Best Practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [OpenAI Production Best Practices](https://developers.openai.com/api/docs/guides/production-best-practices)
- [web.dev Progressive Web Apps](https://web.dev/explore/progressive-web-apps)
