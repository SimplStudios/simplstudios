import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
    ArrowLeft, Shield, Key, Database, Users, MessageSquare, 
    AlertTriangle, Eye, EyeOff, Plus, Trash2, Edit, RefreshCw,
    Ban, CheckCircle, Globe, Clock, Activity, Unlock, Radio, Zap, ExternalLink, KeyRound
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { VaultWrapper } from '@/components/VaultWrapper'
import { 
    getCredentials, createCredential, updateCredential, deleteCredential,
    getAuditLogs, getBannedIPs, unbanIP, banIP,
    getAdminChatMessages, sendAdminChatMessage,
    getConnectedDatabases, addConnectedDatabase, refreshUserCount, getTotalUsersAcrossApps,
    getKeygenLocks, unlockKeygenIP, getVaultEvents, getUsedVaultKeys,
    runVaultMigration
} from '@/app/actions/vault'

// Type definitions for Vault models
interface VaultCredential {
    id: string
    name: string
    type: string
    service: string
    identifier: string | null
    secret: string
    notes: string | null
    createdAt: Date
}

interface AuditLog {
    id: string
    action: string
    ipAddress: string
    userAgent: string | null
    isVpn: boolean
    country: string | null
    city: string | null
    details: string | null
    createdAt: Date
}

interface BannedIP {
    id: string
    ipAddress: string
    reason: string
    failedCount: number
    bannedAt: Date
    expiresAt: Date | null
    unbannedAt: Date | null
    isActive: boolean
}

interface AdminChatMessage {
    id: string
    sender: string
    message: string
    createdAt: Date
}

interface ConnectedDatabase {
    id: string
    name: string
    appName: string
    connectionUrl: string
    serviceRole: string | null
    userTable: string
    lastUserCount: number | null
    lastCheckedAt: Date | null
    isActive: boolean
}

interface KeygenLock {
    id: string
    ipAddress: string
    reason: string
    attempts: number
    lockedAt: Date
    unlockedAt: Date | null
    unlockedBy: string | null
    isLocked: boolean
    restoreUrl: string | null
}

interface VaultEvent {
    id: string
    eventType: string
    ipAddress: string
    userAgent: string | null
    location: string | null
    details: string | null
    severity: string
    createdAt: Date
}

interface UsedVaultKey {
    id: string
    instanceId: string
    fullKeyHash: string
    developerHex: string
    ipAddress: string
    generatedAt: Date
    usedAt: Date
}

// Helper to safely fetch data with fallback
async function safeGetData<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await fn()
    } catch (e) {
        return fallback
    }
}

export default async function VaultPage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        notFound()
    }

    // Auto-migrate vault tables if they don't exist
    await runVaultMigration()

    // Try to fetch data, fallback to empty arrays if tables don't exist
    const [credentials, auditLogs, bannedIPs, chatMessages, connectedDbs, userStats, keygenLocks, vaultEvents, usedKeys] = await Promise.all([
        safeGetData(() => getCredentials() as Promise<VaultCredential[]>, []),
        safeGetData(() => getAuditLogs(50) as Promise<AuditLog[]>, []),
        safeGetData(() => getBannedIPs() as Promise<BannedIP[]>, []),
        safeGetData(() => getAdminChatMessages() as Promise<AdminChatMessage[]>, []),
        safeGetData(() => getConnectedDatabases() as Promise<ConnectedDatabase[]>, []),
        safeGetData(() => getTotalUsersAcrossApps(), { total: 0, databases: [] }),
        safeGetData(() => getKeygenLocks() as Promise<KeygenLock[]>, []),
        safeGetData(() => getVaultEvents(30) as Promise<VaultEvent[]>, []),
        safeGetData(() => getUsedVaultKeys(10) as Promise<UsedVaultKey[]>, [])
    ])


    return (
        <VaultWrapper>
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-outfit text-white">The Vault</h1>
                            <p className="text-slate-400 font-jakarta">Secure admin credentials & monitoring</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <Card className="bg-slate-900/50 border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{userStats.total.toLocaleString()}</p>
                                <p className="text-xs text-slate-400">Total Users</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Key className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{credentials.length}</p>
                                <p className="text-xs text-slate-400">Stored Credentials</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{bannedIPs.filter(b => b.isActive).length}</p>
                                <p className="text-xs text-slate-400">Banned IPs</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Database className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{connectedDbs.length}</p>
                                <p className="text-xs text-slate-400">Connected DBs</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Radio className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{keygenLocks.filter(k => k.isLocked).length}</p>
                                <p className="text-xs text-slate-400">Keygen Locks</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Credentials Section */}
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2">
                                    <Key className="w-5 h-5 text-amber-400" />
                                    Stored Credentials
                                </h2>
                            </div>

                            {/* Add Credential Form */}
                            <form action={createCredential} className="mb-6 p-4 bg-slate-800/50 rounded-lg">
                                <h3 className="text-sm font-medium text-slate-300 mb-3">Add New Credential</h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Input name="name" placeholder="Name (e.g., Production API Key)" className="bg-slate-900 border-slate-700" required />
                                    <select name="type" className="bg-slate-900 border border-slate-700 rounded-md px-3 text-sm text-white" required>
                                        <option value="api_key">API Key</option>
                                        <option value="database_url">Database URL</option>
                                        <option value="admin_credential">Admin Credential</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Input name="service" placeholder="Service (e.g., Stripe, Neon)" className="bg-slate-900 border-slate-700" required />
                                    <Input name="identifier" placeholder="Username/Key Name (optional)" className="bg-slate-900 border-slate-700" />
                                </div>
                                <Input name="secret" placeholder="Secret/Password/URL" className="bg-slate-900 border-slate-700 mb-3" required />
                                <Input name="notes" placeholder="Notes (optional)" className="bg-slate-900 border-slate-700 mb-3" />
                                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700">
                                    <Plus className="w-4 h-4 mr-1" /> Add Credential
                                </Button>
                            </form>

                            {/* Credentials List */}
                            <div className="space-y-3">
                                {credentials.map((cred) => (
                                    <div key={cred.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-white">{cred.name}</span>
                                                    <Badge className="text-xs">
                                                        {cred.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-400">Service: {cred.service}</p>
                                                {cred.identifier && (
                                                    <p className="text-sm text-slate-400">ID: {cred.identifier}</p>
                                                )}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <code className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono">
                                                        {'•'.repeat(Math.min(cred.secret.length, 20))}
                                                    </code>
                                                </div>
                                                {cred.notes && (
                                                    <p className="text-xs text-slate-500 mt-2">{cred.notes}</p>
                                                )}
                                            </div>
                                            <form action={deleteCredential.bind(null, cred.id)}>
                                                <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                                {credentials.length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No credentials stored yet</p>
                                )}
                            </div>
                        </Card>

                        {/* Connected Databases & User Stats */}
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2">
                                    <Database className="w-5 h-5 text-green-400" />
                                    Connected Databases
                                </h2>
                            </div>

                            {/* Add Database Form */}
                            <form action={addConnectedDatabase} className="mb-6 p-4 bg-slate-800/50 rounded-lg">
                                <h3 className="text-sm font-medium text-slate-300 mb-3">Connect New Database</h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Input name="name" placeholder="Display Name" className="bg-slate-900 border-slate-700" required />
                                    <Input name="appName" placeholder="App Name" className="bg-slate-900 border-slate-700" required />
                                </div>
                                <Input name="connectionUrl" placeholder="Connection URL (postgresql://...)" className="bg-slate-900 border-slate-700 mb-3 font-mono text-sm" required />
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Input name="serviceRole" placeholder="Service Role Key (optional)" className="bg-slate-900 border-slate-700" />
                                    <Input name="userTable" placeholder="User Table (default: users)" className="bg-slate-900 border-slate-700" defaultValue="users" />
                                </div>
                                <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                                    <Plus className="w-4 h-4 mr-1" /> Connect Database
                                </Button>
                            </form>

                            {/* Connected DBs List */}
                            <div className="space-y-3">
                                {connectedDbs.map((db) => (
                                    <div key={db.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-white">{db.name}</span>
                                                    <Badge className="text-xs bg-blue-500/20 text-blue-400">{db.appName}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-400">Table: {db.userTable}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-2xl font-bold text-blue-400">
                                                        {db.lastUserCount?.toLocaleString() || '—'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">users</span>
                                                    {db.lastCheckedAt && (
                                                        <span className="text-xs text-slate-500">
                                                            Updated: {new Date(db.lastCheckedAt).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <form action={async () => {
                                                'use server'
                                                await refreshUserCount(db.id)
                                            }}>
                                                <Button type="submit" variant="ghost" size="sm">
                                                    <RefreshCw className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                                {connectedDbs.length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No databases connected</p>
                                )}
                            </div>
                        </Card>

                        {/* Audit Log */}
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-purple-400" />
                                Audit Log
                            </h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg text-sm">
                                        <div className={`w-2 h-2 rounded-full ${
                                            log.action.includes('failed') || log.action.includes('banned') ? 'bg-red-500' :
                                            log.action.includes('success') || log.action.includes('created') ? 'bg-green-500' :
                                            'bg-blue-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{log.action.replace(/_/g, ' ')}</span>
                                                {log.isVpn && (
                                                    <Badge className="text-xs bg-red-500/20 text-red-400">VPN</Badge>
                                                )}
                                            </div>
                                            <p className="text-slate-400 text-xs truncate">
                                                IP: {log.ipAddress} {log.details && `• ${log.details}`}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {auditLogs.length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No audit logs yet</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8">
                        {/* Banned IPs */}
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-6">
                                <Ban className="w-5 h-5 text-red-400" />
                                Banned IPs
                            </h2>

                            {/* Manual Ban Form */}
                            <form action={async (formData: FormData) => {
                                'use server'
                                const ip = formData.get('ip') as string
                                const reason = formData.get('reason') as string
                                await banIP(ip, reason, true)
                            }} className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                                <Input name="ip" placeholder="IP Address" className="bg-slate-900 border-slate-700 mb-2 text-sm" required />
                                <Input name="reason" placeholder="Reason" className="bg-slate-900 border-slate-700 mb-2 text-sm" />
                                <Button type="submit" size="sm" variant="destructive" className="w-full">
                                    <Ban className="w-3 h-3 mr-1" /> Ban IP
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {bannedIPs.map((ban) => (
                                    <div key={ban.id} className={`p-3 rounded-lg border ${ban.isActive ? 'bg-red-900/20 border-red-800/50' : 'bg-slate-800/30 border-slate-700/50'}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <code className="text-sm font-mono text-white">{ban.ipAddress}</code>
                                                <p className="text-xs text-slate-400 mt-1">{ban.reason}</p>
                                                <p className="text-xs text-slate-500">
                                                    Attempts: {ban.failedCount} • {new Date(ban.bannedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {ban.isActive && (
                                                <form action={unbanIP.bind(null, ban.ipAddress)}>
                                                    <Button type="submit" size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {bannedIPs.length === 0 && (
                                    <p className="text-slate-500 text-center py-4 text-sm">No banned IPs</p>
                                )}
                            </div>
                        </Card>

                        {/* Admin Chat */}
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-6">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                Admin Chat
                            </h2>

                            <div className="h-64 overflow-y-auto mb-4 space-y-2">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className="p-2 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-blue-400">{msg.sender}</span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300">{msg.message}</p>
                                    </div>
                                ))}
                                {chatMessages.length === 0 && (
                                    <p className="text-slate-500 text-center py-8 text-sm">No messages yet</p>
                                )}
                            </div>

                            <form action={sendAdminChatMessage} className="flex gap-2">
                                <Input name="message" placeholder="Type a message..." className="bg-slate-900 border-slate-700 flex-1" required />
                                <input type="hidden" name="sender" value="Admin" />
                                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    Send
                                </Button>
                            </form>
                        </Card>

                        {/* Keygen Locks */}
                        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-800/50 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-6">
                                <Radio className="w-5 h-5 text-orange-400" />
                                Keygen Locks
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">IPs locked from the key generator site</p>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {keygenLocks.map((lock) => (
                                    <div key={lock.id} className={`p-3 rounded-lg border ${lock.isLocked ? 'bg-orange-900/20 border-orange-800/50' : 'bg-slate-800/30 border-slate-700/50'}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <code className="text-sm font-mono text-white">{lock.ipAddress}</code>
                                                <p className="text-xs text-slate-400 mt-1">{lock.reason}</p>
                                                <p className="text-xs text-slate-500">
                                                    Attempts: {lock.attempts} • {new Date(lock.lockedAt).toLocaleString()}
                                                </p>
                                                {lock.unlockedBy && (
                                                    <p className="text-xs text-green-400 mt-1">
                                                        Unlocked by {lock.unlockedBy}
                                                    </p>
                                                )}
                                            </div>
                                            {lock.isLocked && (
                                                <form action={unlockKeygenIP.bind(null, lock.ipAddress)}>
                                                    <Button type="submit" size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                                                        <Unlock className="w-4 h-4" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {keygenLocks.length === 0 && (
                                    <p className="text-slate-500 text-center py-4 text-sm">No keygen locks</p>
                                )}
                            </div>
                        </Card>

                        {/* Vault Events Stream */}
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-6">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Live Events
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">Real-time events from key generator</p>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {vaultEvents.map((event) => (
                                    <div key={event.id} className="flex items-start gap-2 p-2 bg-slate-800/30 rounded-lg text-xs">
                                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                                            event.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                                            event.severity === 'warning' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-slate-200 font-medium">
                                                {event.eventType.replace(/_/g, ' ')}
                                            </span>
                                            <p className="text-slate-500 truncate">{event.ipAddress}</p>
                                            {event.details && (
                                                <p className="text-slate-600 truncate text-[10px]">
                                                    {event.details.slice(0, 50)}...
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-slate-600 whitespace-nowrap">
                                            {new Date(event.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                                {vaultEvents.length === 0 && (
                                    <p className="text-slate-500 text-center py-4 text-sm">No events yet</p>
                                )}
                            </div>
                        </Card>

                        {/* Recently Generated Keys */}
                        <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-800/50 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-6">
                                <KeyRound className="w-5 h-5 text-emerald-400" />
                                Recently Used Keys
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">Keys validated against The Vault</p>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {usedKeys.map((key) => (
                                    <div key={key.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm font-mono text-emerald-400">{key.developerHex}</code>
                                                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Valid</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 font-mono truncate">
                                                    Instance: {key.instanceId.slice(0, 12)}...
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    IP: {key.ipAddress}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-slate-500">
                                                <p>Generated: {new Date(key.generatedAt).toLocaleDateString()}</p>
                                                <p>Used: {new Date(key.usedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {usedKeys.length === 0 && (
                                    <p className="text-slate-500 text-center py-4 text-sm">No keys used yet</p>
                                )}
                            </div>
                        </Card>

                        {/* Admin Keygen Access */}
                        <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-800/50 p-6">
                            <h2 className="text-xl font-semibold font-outfit text-white flex items-center gap-2 mb-4">
                                <ExternalLink className="w-5 h-5 text-violet-400" />
                                Key Generator
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">Generate new security keys for authorized developers</p>
                            <a 
                                href="https://68fe8atay8wewqw0d9ew7fe99w8e8fe7y329.puter.site/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Key className="w-4 h-4" />
                                Open Key Generator
                            </a>
                            <p className="text-[10px] text-slate-600 mt-3">This link is only visible to authenticated Vault admins.</p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
        </VaultWrapper>
    )
}
