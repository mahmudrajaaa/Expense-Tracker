-- ============================================================================
-- DAILY EXPENSE TRACKER - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This script creates all necessary tables, RLS policies, and functions
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    monthly_budget NUMERIC DEFAULT 50000,
    currency VARCHAR(10) DEFAULT '₹',
    start_of_week INTEGER DEFAULT 1, -- 0=Sunday, 1=Monday, 6=Saturday
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL CHECK (category IN ('food', 'transport', 'groceries', 'bills', 'personal', 'others')),
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'card')),
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bills Table (Recurring bills configuration)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    due_date INTEGER NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bills Paid Table (Track monthly bill payments)
CREATE TABLE IF NOT EXISTS bills_paid (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    bill_name VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(50) NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_active ON bills(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_bills_paid_user_id ON bills_paid(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_paid_month_year ON bills_paid(month_year);
CREATE INDEX IF NOT EXISTS idx_bills_paid_user_month ON bills_paid(user_id, month_year);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills_paid ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses"
    ON expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
    ON expenses FOR DELETE
    USING (auth.uid() = user_id);

-- Bills Policies
CREATE POLICY "Users can view their own bills"
    ON bills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
    ON bills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
    ON bills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
    ON bills FOR DELETE
    USING (auth.uid() = user_id);

-- Bills Paid Policies
CREATE POLICY "Users can view their own bills paid"
    ON bills_paid FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills paid"
    ON bills_paid FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills paid"
    ON bills_paid FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills paid"
    ON bills_paid FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 6. CREATE TRIGGERS
-- ============================================================================

-- Triggers for updating updated_at column
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. CREATE DEFAULT BILLS FUNCTION
-- ============================================================================

-- Function to create default bills for new users
CREATE OR REPLACE FUNCTION create_default_bills_for_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO bills (user_id, name, amount, due_date, category, is_active)
    VALUES
        (user_uuid, 'Rent', 15000, 5, 'bills', true),
        (user_uuid, 'EB Bill', 800, 10, 'bills', true),
        (user_uuid, 'WiFi', 599, 15, 'bills', true),
        (user_uuid, 'Groceries', 5000, 30, 'groceries', true),
        (user_uuid, 'Home Loan EMI', 12000, 1, 'bills', true),
        (user_uuid, 'School Fees', 8000, 5, 'bills', true),
        (user_uuid, 'Netflix', 649, 20, 'personal', true),
        (user_uuid, 'Amazon Prime', 299, 12, 'personal', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default user settings
CREATE OR REPLACE FUNCTION create_default_user_settings(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_settings (user_id, monthly_budget, currency, start_of_week, notifications_enabled)
    VALUES (user_uuid, 50000, '₹', 1, true)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. CREATE TRIGGER FOR NEW USER SETUP
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default user settings
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);

    -- Create default bills
    PERFORM create_default_bills_for_user(NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 9. HELPER FUNCTIONS FOR REPORTS
-- ============================================================================

-- Function to get monthly expense summary
CREATE OR REPLACE FUNCTION get_monthly_summary(
    user_uuid UUID,
    month_year TEXT
)
RETURNS TABLE (
    total_expenses NUMERIC,
    transaction_count BIGINT,
    category_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as transaction_count,
        jsonb_object_agg(category, category_total) as category_breakdown
    FROM (
        SELECT
            category,
            SUM(amount) as category_total
        FROM expenses
        WHERE user_id = user_uuid
        AND TO_CHAR(date, 'YYYY-MM') = month_year
        GROUP BY category
    ) cat_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- Run this entire script in your Supabase SQL Editor
-- All tables, policies, and functions are now created
-- ============================================================================
