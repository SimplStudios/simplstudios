-- =============================================
-- VAULT KEYGEN INTEGRATION - Database Migration
-- SimplStudios Security Key System
-- =============================================

-- ───────────────────────────────────────────────
-- 1. VAULT EVENTS TABLE
-- Logs all events from external Key Maker site
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_type TEXT NOT NULL, -- failed_attempt, lockout, devtools_opened, key_generated, key_expired, key_validated, etc.
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    location TEXT,
    details TEXT, -- JSON string with additional context
    severity TEXT NOT NULL DEFAULT 'info', -- info, warning, critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast event querying
CREATE INDEX IF NOT EXISTS idx_vault_events_ip_created ON vault_events(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_vault_events_type_created ON vault_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_vault_events_severity ON vault_events(severity, created_at);

-- ───────────────────────────────────────────────
-- 2. USED VAULT KEYS TABLE
-- Tracks used security keys to prevent replay attacks
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS used_vault_keys (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    instance_id TEXT UNIQUE NOT NULL, -- The 4-char instance ID from key payload
    full_key_hash TEXT NOT NULL,       -- SHA256 hash of full key
    developer_hex TEXT NOT NULL,       -- Hex-encoded developer name
    ip_address TEXT NOT NULL,          -- IP where key was used
    generated_at TIMESTAMP NOT NULL,   -- Extracted from key timestamp
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast instance ID lookups (replay prevention)
CREATE INDEX IF NOT EXISTS idx_used_vault_keys_instance ON used_vault_keys(instance_id);

-- ───────────────────────────────────────────────
-- 3. KEYGEN LOCKS TABLE
-- Separate lock tracking for key generator site
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS keygen_locks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ip_address TEXT UNIQUE NOT NULL,
    reason TEXT DEFAULT 'Too many failed keygen attempts',
    attempts INT DEFAULT 3,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_at TIMESTAMP,
    unlocked_by TEXT, -- Admin who performed unlock
    is_locked BOOLEAN DEFAULT true,
    restore_url TEXT  -- Pre-built admin restore URL
);

-- Index for lock status checks
CREATE INDEX IF NOT EXISTS idx_keygen_locks_ip ON keygen_locks(ip_address);
CREATE INDEX IF NOT EXISTS idx_keygen_locks_status ON keygen_locks(is_locked);

-- ───────────────────────────────────────────────
-- 4. VAULT ACCESS CODES TABLE
-- Valid access codes for key generation (optional)
-- Can be managed via Vault UI instead of hardcoding
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_access_codes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code_hex TEXT UNIQUE NOT NULL,  -- Hex-encoded access code
    code_name TEXT NOT NULL,        -- Human-readable name
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────
-- 5. SEED DEFAULT ACCESS CODES
-- These match the hardcoded values in the keygen site
-- ───────────────────────────────────────────────
INSERT INTO vault_access_codes (code_hex, code_name, is_active) VALUES
    ('3830303139', '80019', true),
    ('416e6479', 'Andy', true),
    ('42726f6479', 'Brody', true),
    ('5374657665', 'Steve', true),
    ('4a616465', 'Jade', true)
ON CONFLICT (code_hex) DO NOTHING;

-- =============================================
-- FLOW DOCUMENTATION
-- =============================================
--
-- KEY GENERATION FLOW:
-- 1. User visits keygen site (puter.site)
-- 2. On page load: POST /api/vault/check-ip → checks keygen_locks
-- 3. On failed attempt: POST /api/vault/log-event (type: failed_attempt)
-- 4. After 3 fails: POST /api/vault/log-event (type: lockout) → creates keygen_locks entry
-- 5. On key generated: POST /api/vault/log-event (type: key_generated)
-- 6. On key expired: POST /api/vault/log-event (type: key_expired)
--
-- VAULT ACCESS FLOW:
-- 1. Admin visits /admin/vault (requires admin_session cookie)
-- 2. VaultWrapper checks sessionStorage for vault_key_validated
-- 3. If not validated: shows VaultKeyGate
-- 4. User pastes key → POST /api/vault/validate-key
-- 5. Validation checks: format, access code, TTL (3 min), instance ID uniqueness
-- 6. On success: stores instance_id in used_vault_keys, sets sessionStorage
-- 7. Vault content loads
--
-- ADMIN RECOVERY FLOW:
-- 1. Locked user sees their IP on lockout screen
-- 2. Admin views keygen_locks in Vault sidebar
-- 3. Admin clicks unlock → POST /api/vault/unlock-ip
-- 4. Next time user loads keygen: check-ip returns whitelisted: true
-- 5. User can retry
--
-- =============================================
