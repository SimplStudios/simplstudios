-- =============================================
-- THE VAULT - Database Migration
-- SimplStudios Security & Admin Infrastructure
-- =============================================

-- Vault: Stored Credentials (API keys, DB URLs, admin creds)
CREATE TABLE IF NOT EXISTS vault_credentials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- api_key, database_url, admin_credential, other
    service TEXT NOT NULL, -- Service name (e.g., "Stripe", "Neon", "Vercel")
    identifier TEXT, -- Username, key name, etc.
    secret TEXT NOT NULL, -- Encrypted value (API key, password, URL)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vault: Comprehensive Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action TEXT NOT NULL, -- login_attempt, login_success, login_failed, credential_view, etc.
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    is_vpn BOOLEAN DEFAULT false,
    country TEXT,
    city TEXT,
    details TEXT, -- JSON string with additional details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_created ON audit_logs(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at);

-- Vault: Banned IPs
CREATE TABLE IF NOT EXISTS banned_ips (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ip_address TEXT UNIQUE NOT NULL,
    reason TEXT DEFAULT 'Too many failed login attempts',
    failed_count INT DEFAULT 3,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- null = permanent ban
    unbanned_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Vault: Admin Chat Messages
CREATE TABLE IF NOT EXISTS admin_chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender TEXT DEFAULT 'Admin',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vault: Connected Databases for User Counting
CREATE TABLE IF NOT EXISTS connected_databases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL, -- Display name
    app_name TEXT NOT NULL, -- Which app this belongs to
    connection_url TEXT NOT NULL, -- Database connection URL
    service_role TEXT, -- For Supabase-style auth
    user_table TEXT DEFAULT 'users', -- Table to count users from
    last_user_count INT,
    last_checked_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SECURITY NOTES:
-- =============================================
-- 1. The vault_credentials table stores sensitive data
--    In production, consider encrypting the 'secret' column
--    using pgcrypto or application-level encryption
--
-- 2. Audit logs should be retained according to your
--    data retention policy (consider auto-cleanup)
--
-- 3. VPN detection in this implementation is basic
--    For production, integrate with an IP intelligence API
--    like IPinfo, MaxMind, or IP2Location
--
-- 4. Connected databases store connection strings
--    Ensure proper access controls and rotation policies
-- =============================================
