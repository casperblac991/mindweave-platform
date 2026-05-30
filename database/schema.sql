-- ============================================
-- MindWeave Platform - Database Schema
-- Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_newsletter_subscriber BOOLEAN DEFAULT true,
    is_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    creator_id UUID REFERENCES user_profiles(id),
    name TEXT NOT NULL,
    name_ar TEXT,
    name_en TEXT,
    description TEXT,
    description_ar TEXT,
    description_en TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category TEXT NOT NULL,
    filter TEXT DEFAULT 'prompts',
    emoji TEXT DEFAULT '✨',
    badge TEXT,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    sales_count INTEGER DEFAULT 0,
    file_url TEXT,
    preview_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES user_profiles(id),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_intent_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- ============================================
-- CREATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    specialty TEXT NOT NULL,
    bio TEXT,
    total_sales INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    is_verified BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT SUBMISSIONS (for creator submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS product_submissions (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES creators(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    emoji TEXT DEFAULT '✨',
    status TEXT DEFAULT 'pending_review',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT
);

-- ============================================
-- AI PROMPT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    template TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_creator ON products(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Products: anyone can view active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Orders: users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = customer_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert sample categories
INSERT INTO prompt_templates (name, category, template, is_featured) VALUES
    ('أمر ChatGPT للمقالات', 'prompts', 'اكتب مقالاً حول [الموضوع] بأسلوب [الأسلوب] وبطول [عدد الكلمات] كلمة...', true),
    ('أمر Midjourney للصور', 'design', 'Create a stunning [type] image with [style] style, featuring [subject]...', true),
    ('أمر تحسين SEO', 'marketing', 'قم بتحسين هذا النص لمحركات البحث مع الحفاظ على جودة المحتوى...', false)
ON CONFLICT DO NOTHING;