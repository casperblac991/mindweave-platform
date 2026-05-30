-- ============================================
-- MindWeave Platform - Initial Seed Data
-- Run after schema.sql
-- ============================================

-- Insert sample products
INSERT INTO products (name, name_ar, name_en, description, description_ar, description_en, price, original_price, category, filter, emoji, badge, rating, sales_count) VALUES
    ('ChatGPT Prompts for Creators', 'أوامر ChatGPT للمبدعين', 'ChatGPT Prompts for Creators', 
     'Professional ChatGPT prompts collection', 'مجموعة احترافية من أوامر ChatGPT المتخصصة', 
     'Professional ChatGPT prompts collection', 9.99, 19.99, 'AI Prompts', 'prompts', '🧠', '🔥 الأكثر مبيعاً', 4.9, 2300),
    ('Midjourney Professional', 'أوامر Midjourney الاحترافية', 'Professional Midjourney Prompts',
     '50+ prompts for professional images', '50+ أمر لتوليد صور احترافية', 
     '50+ prompts for professional images', 12.99, 24.99, 'AI Prompts', 'design', '🎨', '⭐ مميز', 4.8, 1800),
    ('Notion Business Template', 'قالب Notion للأعمال', 'Notion Business System',
     'Complete template with AI automation', 'قالب شامل مع أتمتة AI وإدارة المشاريع', 
     'Complete template with AI automation', 12.99, 24.99, 'Templates', 'notion', '📋', '🎯 جديد', 5.0, 890),
    ('Complete Coding Prompts', 'أوامر البرمجة الكاملة', 'Complete Coding Prompts',
     '100 prompts for code generation', '100 أمر لتوليد كود وتصحيح الأخطاء', 
     '100 prompts for code generation', 14.99, 29.99, 'Coding', 'coding', '💻', '🔥 رائج', 4.9, 1500),
    ('AI Tools Directory 2026', 'دليل أدوات الذكاء الاصطناعي 2026', 'AI Tools Directory 2026',
     '50+ free AI tools with explanations', '50+ أداة AI مجانية مع شرح مفصل', 
     '50+ free AI tools with explanations', 5.99, 9.99, 'E-Books', 'ebooks', '📚', '📖 جديد', 4.7, 2100),
    ('AI Logo Design Service', 'خدمة تصميم شعارات', 'AI Logo Design Service',
     'Professional design in 24h', 'تصميم احترافي خلال 24 ساعة مع 3 تعديلات', 
     'Professional design in 24h', 19.99, 29.99, 'Services', 'services', '🎯', '⭐ مميز', 4.9, 560)
ON CONFLICT DO NOTHING;

-- Insert sample creators
INSERT INTO creators (specialty, bio, total_sales, rating, is_verified) VALUES
    ('أوامر ChatGPT', 'خبير في هندسة الأوامر مع +3 سنوات خبرة', 3450, 4.9, true),
    ('أوامر Midjourney', 'مصممة محترفة متخصصة في التصميم بالذكاء الاصطناعي', 2890, 4.8, true),
    ('أوامر البرمجة', 'مطور Full Stack مع خبرة في AI', 1560, 4.7, false)
ON CONFLICT DO NOTHING;