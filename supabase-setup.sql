-- MindWeave Supabase Database Setup
-- Run these SQL commands in your Supabase SQL editor

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_newsletter_subscriber BOOLEAN DEFAULT TRUE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 2. NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unsubscribed_at TIMESTAMP,
    subscription_source VARCHAR(100) DEFAULT 'website',
    tags JSONB DEFAULT '[]'::jsonb
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- ============================================
-- 3. NEWSLETTER CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    product_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    recipients_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' -- draft, scheduled, sent
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON newsletter_campaigns(status);

-- ============================================
-- 4. USER PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(100),
    purchase_date TIMESTAMP DEFAULT NOW(),
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'completed'
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON user_purchases(purchase_date);

-- ============================================
-- 5. USER ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on user_id and action
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON user_activity_log(action);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- User profiles: Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Newsletter subscribers: Public read (for admin), but no direct user access
CREATE POLICY "Newsletter subscribers are readable by authenticated users" ON newsletter_subscribers
    FOR SELECT USING (auth.role() = 'authenticated');

-- User purchases: Users can only see their own purchases
CREATE POLICY "Users can view their own purchases" ON user_purchases
    FOR SELECT USING (auth.uid() = user_id);

-- User activity: Users can only see their own activity
CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 8. FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function to get subscriber count
CREATE OR REPLACE FUNCTION get_active_subscriber_count()
RETURNS INTEGER AS $$
    SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = TRUE;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get user purchase history
CREATE OR REPLACE FUNCTION get_user_purchases(user_id UUID)
RETURNS TABLE (
    product_name VARCHAR,
    purchase_date TIMESTAMP,
    amount DECIMAL,
    status VARCHAR
) AS $$
    SELECT product_name, purchase_date, amount, status 
    FROM user_purchases 
    WHERE user_id = $1 
    ORDER BY purchase_date DESC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action VARCHAR,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_log (user_id, action, details)
    VALUES (p_user_id, p_action, p_details)
    RETURNING id INTO activity_id;
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Trigger to update user_profiles.updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_timestamp_trigger
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- ============================================
-- 10. SAMPLE DATA (OPTIONAL - Remove in production)
-- ============================================

-- Insert sample newsletter subscribers
INSERT INTO newsletter_subscribers (email, subscription_source) VALUES
    ('user1@example.com', 'website'),
    ('user2@example.com', 'website'),
    ('user3@example.com', 'website')
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
/*
After running these SQL commands:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider if not already enabled
4. Configure email templates for sign-up confirmations

5. For sending newsletters, create an Edge Function:
   - Go to Edge Functions
   - Create a new function called "send-newsletter"
   - Use a service like SendGrid or Resend to send emails

6. Update the supabase-auth.js file with your actual:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

7. Add the Supabase JavaScript client to your HTML:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
*/
