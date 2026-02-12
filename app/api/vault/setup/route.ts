'use server'

import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const VAULT_MIGRATIONS = [
    // Vault: Stored Credentials
    `CREATE TABLE IF NOT EXISTS vault_credentials (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        service TEXT NOT NULL,
        identifier TEXT,
        secret TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Vault: Audit Log
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        action TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        is_vpn BOOLEAN DEFAULT false,
        country TEXT,
        city TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_created ON audit_logs(ip_address, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at)`,

    // Vault: Banned IPs
    `CREATE TABLE IF NOT EXISTS banned_ips (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        ip_address TEXT UNIQUE NOT NULL,
        reason TEXT DEFAULT 'Too many failed login attempts',
        failed_count INT DEFAULT 3,
        banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        unbanned_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
    )`,

    // Vault: Admin Chat
    `CREATE TABLE IF NOT EXISTS admin_chat_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        sender TEXT DEFAULT 'Admin',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Vault: Connected Databases
    `CREATE TABLE IF NOT EXISTS connected_databases (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        app_name TEXT NOT NULL,
        connection_url TEXT NOT NULL,
        service_role TEXT,
        user_table TEXT DEFAULT 'users',
        last_user_count INT,
        last_checked_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Keygen Integration: Event logs
    `CREATE TABLE IF NOT EXISTS vault_events (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        event_type TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        access_code TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Keygen Integration: Used keys (replay prevention)
    `CREATE TABLE IF NOT EXISTS used_vault_keys (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        key_hash TEXT UNIQUE NOT NULL,
        ip_address TEXT NOT NULL,
        generated_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Keygen Integration: IP locks
    `CREATE TABLE IF NOT EXISTS keygen_locks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        ip_address TEXT UNIQUE NOT NULL,
        reason TEXT DEFAULT 'Too many failed attempts',
        locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unlocked_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
    )`,

    // Keygen Integration: Access codes
    `CREATE TABLE IF NOT EXISTS vault_access_codes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Seed access codes
    `INSERT INTO vault_access_codes (code, name) VALUES ('3830303139', '80019') ON CONFLICT (code) DO NOTHING`,
    `INSERT INTO vault_access_codes (code, name) VALUES ('416e6479', 'Andy') ON CONFLICT (code) DO NOTHING`,
    `INSERT INTO vault_access_codes (code, name) VALUES ('42726f6479', 'Brody') ON CONFLICT (code) DO NOTHING`,
    `INSERT INTO vault_access_codes (code, name) VALUES ('5374657665', 'Steve') ON CONFLICT (code) DO NOTHING`,
    `INSERT INTO vault_access_codes (code, name) VALUES ('4a616465', 'Jade') ON CONFLICT (code) DO NOTHING`,
]

export async function POST() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Run each migration statement
        for (const sql of VAULT_MIGRATIONS) {
            try {
                await prisma.$executeRawUnsafe(sql)
            } catch (e: any) {
                // Ignore "already exists" errors
                if (!e.message?.includes('already exists')) {
                    console.error('Migration error:', e.message)
                }
            }
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Vault tables created successfully' 
        })
    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message || 'Failed to create vault tables' 
        }, { status: 500 })
    }
}

export async function GET() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if vault tables exist
    try {
        await prisma.$queryRaw`SELECT 1 FROM vault_credentials LIMIT 1`
        return NextResponse.json({ initialized: true })
    } catch {
        return NextResponse.json({ initialized: false })
    }
}
