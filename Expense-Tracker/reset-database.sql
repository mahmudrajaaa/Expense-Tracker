-- ============================================================================
-- COMPLETE DATABASE RESET - DROP AND RECREATE EVERYTHING
-- ============================================================================
-- ⚠️ WARNING: This will DELETE ALL DATA in these tables!
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Drop all triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_default_bills_for_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_default_user_settings(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_monthly_summary(UUID, TEXT) CASCADE;

-- STEP 2: Drop all tables
DROP TABLE IF EXISTS bills_paid CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- STEP 3: Recreate all tables
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    monthly_budget NUMERIC DEFAULT 50000,
    currency VARCHAR(10) DEFAULT '₹',
    start_of_week INTEGER DEFAULT 1,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE expenses (
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

CREATE TABLE bills (
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

CREATE TABLE bills_paid (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    bill_name VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(50) NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STEP 4: Create indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_user_active ON bills(user_id, is_active);
CREATE INDEX idx_bills_paid_user_id ON bills_paid(user_id);
CREATE INDEX idx_bills_paid_month_year ON bills_paid(month_year);
CREATE INDEX idx_bills_paid_user_month ON bills_paid(user_id, month_year);

-- STEP 5: Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills_paid ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS Policies
-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Bills Policies
CREATE POLICY "Users can view their own bills" ON bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bills" ON bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bills" ON bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bills" ON bills FOR DELETE USING (auth.uid() = user_id);

-- Bills Paid Policies
CREATE POLICY "Users can view their own bills paid" ON bills_paid FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bills paid" ON bills_paid FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bills paid" ON bills_paid FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bills paid" ON bills_paid FOR DELETE USING (auth.uid() = user_id);

-- STEP 7: Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- STEP 8: Create triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: Create test user with sample data
-- ============================================================================

-- Delete existing test user if exists
DELETE FROM auth.users WHERE email = 'test@expense-tracker.com';

-- Create test user
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Create user in auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'test@expense-tracker.com',
        crypt('Test@123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO test_user_id;

    -- Create user settings
    INSERT INTO user_settings (user_id, monthly_budget, currency, start_of_week, notifications_enabled)
    VALUES (test_user_id, 50000, '₹', 1, true);

    -- Create default bills
    INSERT INTO bills (user_id, name, amount, due_date, category, is_active) VALUES
        (test_user_id, 'Rent', 15000, 5, 'bills', true),
        (test_user_id, 'EB Bill', 800, 10, 'bills', true),
        (test_user_id, 'WiFi', 599, 15, 'bills', true),
        (test_user_id, 'Groceries', 5000, 30, 'groceries', true),
        (test_user_id, 'Home Loan EMI', 12000, 1, 'bills', true),
        (test_user_id, 'School Fees', 8000, 5, 'bills', true),
        (test_user_id, 'Netflix', 649, 20, 'personal', true),
        (test_user_id, 'Amazon Prime', 299, 12, 'personal', true);

    -- Add sample expenses (last 7 days)
    INSERT INTO expenses (user_id, item, amount, category, payment_mode, date, notes) VALUES
        (test_user_id, 'Lunch at Restaurant', 450, 'food', 'upi', NOW() - INTERVAL '1 day', 'Office lunch'),
        (test_user_id, 'Uber to Office', 120, 'transport', 'upi', NOW() - INTERVAL '1 day', 'Morning commute'),
        (test_user_id, 'Grocery Shopping', 2500, 'groceries', 'card', NOW() - INTERVAL '2 days', 'Weekly groceries'),
        (test_user_id, 'Coffee', 150, 'food', 'cash', NOW() - INTERVAL '2 days', 'Afternoon coffee'),
        (test_user_id, 'Movie Tickets', 800, 'personal', 'card', NOW() - INTERVAL '3 days', 'Weekend movie'),
        (test_user_id, 'Dinner', 1200, 'food', 'upi', NOW() - INTERVAL '3 days', 'Family dinner'),
        (test_user_id, 'Petrol', 2000, 'transport', 'card', NOW() - INTERVAL '4 days', 'Full tank'),
        (test_user_id, 'Medicine', 350, 'personal', 'cash', NOW() - INTERVAL '5 days', 'Pharmacy'),
        (test_user_id, 'Mobile Recharge', 599, 'bills', 'upi', NOW() - INTERVAL '6 days', 'Monthly recharge'),
        (test_user_id, 'Breakfast', 200, 'food', 'cash', NOW(), 'Morning breakfast');

    RAISE NOTICE 'Test user created successfully!';
    RAISE NOTICE 'User ID: %', test_user_id;
    RAISE NOTICE 'Email: test@expense-tracker.com';
    RAISE NOTICE 'Password: Test@123';
END $$;

-- STEP 10: Verify everything
SELECT 'Users Created:' as info, COUNT(*) as count FROM auth.users WHERE email = 'test@expense-tracker.com'
UNION ALL
SELECT 'Settings Created:', COUNT(*) FROM user_settings
UNION ALL
SELECT 'Bills Created:', COUNT(*) FROM bills
UNION ALL
SELECT 'Expenses Created:', COUNT(*) FROM expenses;

-- ============================================================================
-- ✅ DATABASE RESET COMPLETE!
-- ============================================================================
-- Login credentials:
-- Email: test@expense-tracker.com
-- Password: Test@123
--
-- Go to: http://localhost:3003/login
-- ============================================================================
