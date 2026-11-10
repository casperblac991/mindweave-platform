# خارطة طريق MindWeave الحديثة

## ما نطبقه الآن

المرحلة الأولى تركز على قيمة قابلة للقياس بدل إضافة ميزات كثيرة: Workbench منظم داخل Prompt Lab، قياس للأحداث دون تخزين نصوص الأوامر، بيانات Organization/WebSite وProduct، وتحديث sitemap. هذه القرارات مبنية على إرشادات OpenAI حول بناء الأوامر والاختبارات، وإرشادات Google حول الأهلية للظهور في ميزات البحث والبيانات المنظمة، مع عدم إضافة ادعاءات غير موثقة.

## المنتج

الخطوة التالية هي تحويل Prompt Lab إلى مساحة عمل بإصدارات ومسودات واختبارات صغيرة. النسخة الحالية تضيف حقول المهمة والجمهور وشكل الناتج والقيود، وقوالب بداية، وحفظًا محليًا اختياريًا. التطوير التالي المقترح هو حفظ إصدارات المستخدم في Supabase بعد موافقته، ثم تشغيل مجموعة أمثلة صغيرة قبل اعتماد نسخة جديدة. لا يتم تنفيذ أدوات خارجية تلقائيًا ولا تُعامل مخرجات النموذج كأوامر موثوقة.

## الأمان

الخادم يملك بالفعل حدود طلبات ومسارات منفصلة وقيود حجم ومخرجات نصية. التحسين القادم هو إضافة سجل أمني مختصر لا يحتوي الأسرار أو النص الخام، واختبارات ثابتة لمحاولات حقن الأوامر والمخرجات غير الصالحة. أي أداة خارجية أو إجراء مؤثر يجب أن يكون اختياريًا ويتطلب موافقة بشرية.

## الاكتشاف والتحويل

تستخدم الصفحة الرئيسية Organization وWebSite JSON-LD، وتستخدم صفحة المنتج Product وOffer من بيانات المنتج نفسها. يجب لاحقًا إنشاء تغذية Merchant Center عندما تتوفر بيانات أسعار ومخزون مؤكدة، ثم مراقبة Search Console وBing Webmaster Tools. لا توجد حاجة إلى ملف خاص للذكاء الاصطناعي؛ الأساس هو HTML قابل للزحف وبيانات دقيقة وروابط داخلية واضحة.

## الوسائط والحملات

الفيديو العمودي الحالي هو أصل الحملة الرئيسي. نعيد تكييف الفكرة لكل منصة بدل نسخ فيديو مائي أو مكرر. كل منشور يحمل UTM، وتقاس المشاهدة والمشاركة والحفظ وزيارة الملف والتسجيلات. Instagram وTikTok منصتان منفصلتان؛ لا نعد بوصول أو نمو مضمون، ولا نطلق إنفاقًا مدفوعًا قبل تحديد الجمهور والميزانية ومؤشرات الإيقاف.

تم توثيق مسار القياس التفصيلي في `SOCIAL_CONVERSION_MEASUREMENT.md`. تحفظ طبقة القياس مصدر الحملة في الجلسة وتربطه بأحداث Prompt Lab والسلة والدفع، مع فصل PayPal Sandbox عن التحويلات الحية.

## الأولويات التالية

1. حفظ إصدارات الأوامر واختبارها في Prompt Lab.
2. إضافة لوحة بسيطة لمؤشرات التحويل من Instagram إلى Prompt Lab.
3. بناء Merchant feed من بيانات منتجات موثقة فقط.
4. إعادة تفويض TikTok Ads وإعداد حملة مسودة لا تُنشر دون مراجعة.
5. نشر سلسلة فيديوهات أصلية قصيرة: مشكلة واحدة، نتيجة ظاهرة، دعوة واحدة.

## مصادر البحث

[1]: https://developers.openai.com/api/docs/guides/prompt-engineering "OpenAI prompt engineering"
[2]: https://developers.openai.com/api/docs/guides/evals "OpenAI evaluations"
[3]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/ "OWASP prompt injection"
[4]: https://expressjs.com/en/advanced/best-practice-security/ "Express production security"
[5]: https://developers.google.com/search/docs/appearance/ai-features "Google AI features and Search eligibility"
[6]: https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google "Google product data and Merchant Center"
[7]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Google structured data introduction"
[8]: https://about.instagram.com/blog/announcements/instagram-ranking-explained "Instagram ranking explained"
[9]: https://support.tiktok.com/en/using-tiktok/growing-your-audience/creator-search-insights "TikTok Creator Search Insights"
[10]: https://stripe.com/resources/more/mobile-checkout-best-practices-for-ecommerce-businesses "Stripe mobile checkout practices"
[11]: https://web.dev/articles/payment-and-address-form-best-practices "web.dev payment and address forms"
