-- =====================================================
-- SimplStudios Security & Feature Update - SQL Migration
-- Run this SQL in Neon Console
-- =====================================================

-- 1. Add logo_url column to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create user_messages table for feedback/error reporting
CREATE TABLE IF NOT EXISTS user_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'feedback',
    status TEXT NOT NULL DEFAULT 'unread',
    admin_reply TEXT,
    replied_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Create site_status table for error/maintenance pages
CREATE TABLE IF NOT EXISTS site_status (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL DEFAULT 'We''ll be right back',
    message TEXT NOT NULL DEFAULT 'We''re experiencing some technical difficulties. Please check back soon.',
    is_active BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'maintenance',
    estimated_fix TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Create login_attempts table for security tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries on login attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created 
ON login_attempts(ip_address, created_at);

-- 5. Insert default site status (inactive)
INSERT INTO site_status (id, title, message, is_active, type)
SELECT 
    gen_random_uuid()::text,
    'We''ll be right back',
    'We''re experiencing some technical difficulties. Please check back soon.',
    false,
    'maintenance'
WHERE NOT EXISTS (SELECT 1 FROM site_status LIMIT 1);

-- =====================================================
-- SECURITY NOTES:
-- =====================================================
-- 
-- 1. NEW ADMIN LOGIN URL: /simplstudios-admin-login
--    The old /login page now returns 404
--    Do NOT share this URL publicly
--
-- 2. NEW ADMIN CREDENTIALS:
--    Username: simplstudiosadmin0365
--    Password: ^&*9uh8y79T657**98UHuh
--    (Stored in code, not database - more secure)
--
-- 3. LOCKOUT PROTECTION:
--    - 3 failed attempts = 15 minute lockout
--    - DevTools detection blocks access
--    - Console methods disabled on login page
--
-- 4. DATABASE SECURITY:
--    - All admin pages return 404 if not authenticated
--    - No hints about admin existence
--    - Session cookies are httpOnly and secure
--
-- =====================================================
