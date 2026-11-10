# خطة قياس التحويل الاجتماعي إلى Prompt Lab

## الوضع الحالي

يستقبل الموقع روابط UTM من صفحات الحملات. طبقة `analytics.js` تحفظ مصدر الحملة داخل جلسة المتصفح، ثم تضيف `utm_source` و`utm_medium` و`utm_campaign` و`utm_content` و`utm_term` إلى الأحداث اللاحقة. لا تُحفظ نصوص الأوامر أو البريد الإلكتروني داخل أحداث Analytics.

صفحة الحملة المجانية تقيس النقر إلى Prompt Lab، الاشتراك في مورد مجاني، والمشاركة. Prompt Lab يقيس تشغيل Workbench وحفظ المسودة. صفحة المنتج تقيس مشاهدة المنتج والإضافة إلى السلة، وصفحة الدفع تقيس بدء checkout. بعد تأكيد PayPal، يرسل الموقع حدث `purchase` مع قيمة الطلب ورقمه وبيئة الدفع، مع تمييز Sandbox عن Live.

## مسار التحويل

يُعامل كل منشور أو إعلان على أنه مصدر مستقل. مثال رابط Instagram هو:

`https://mindweave.store/prompt-lab.html?utm_source=instagram&utm_medium=organic_social&utm_campaign=prompt_lab_launch&utm_content=reel_01`

ومثال TikTok المدفوع هو:

`https://mindweave.store/prompt-lab.html?utm_source=tiktok&utm_medium=paid_social&utm_campaign=prompt_lab_test_01&utm_content=short_video_01`

المسار المقاس هو: ظهور المحتوى، النقر، الوصول إلى Prompt Lab، تشغيل Workbench، حفظ المسودة أو الاشتراك، ثم الانتقال إلى المنتج والسلة وبدء الدفع، وأخيرًا شراء مؤكد. لا نعتبر المشاهدة أو النقر بيعًا.

## الأحداث الأساسية

الأحداث المعتمدة هي `page_view` و`select_content` و`instagram_reel_click` و`campaign_share` و`campaign_lead` و`prompt_workbench_run` و`prompt_draft_saved` و`view_item` و`add_to_cart` و`begin_checkout` و`purchase`. يجب قراءة `payment_environment` عند تحليل المبيعات، واستبعاد `sandbox` من تقارير الإيراد الحي.

## التقرير الأسبوعي

يُراجع التقرير حسب `utm_source` و`utm_campaign` و`utm_content`. المؤشرات الأولى هي جلسات Prompt Lab، نسبة تشغيل Workbench من الجلسات، نسبة حفظ المسودة أو الاشتراك، نسبة إضافة المنتج إلى السلة، نسبة بدء الدفع، ثم عدد مشتريات Live وقيمتها. نعرض النتائج الفعلية فقط، ونترك المؤشر «غير متاح» إذا لم توجد عينة كافية.

## حدود البيانات الحالية

فحص Supabase في 11 نوفمبر 2026 أعاد صفرًا في `public.purchases` وصفرًا في `public.user_purchases`، ولا يوجد جدول تقييمات. لذلك لا يجوز استخدام أرقام المبيعات أو النجوم القديمة في الواجهة أو الإعلان. PayPal Sandbox مفيد لاختبار المسار، لكنه ليس دليلًا على مبيعات حقيقية.

## قرارات التشغيل

لا نطلق حملة تحويلات قبل توفر دفع Live وسجل مشتريات فعلي. تبدأ TikTok وInstagram بحملة Traffic أو حملة وصول منخفضة المخاطر، ثم ننتقل إلى التحويلات بعد ظهور أحداث كافية. كل فيديو أو رابط له `utm_content` مختلف، ولا نخلط المنشورات العضوية بالإعلانات المدفوعة في نفس القيمة.
