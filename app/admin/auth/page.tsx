import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, UserCog, Users, Database, Ban,
  Key, Shield, Activity, Settings, Code2
} from 'lucide-react'
import {
  getAuthDatabases, fetchExternalUsers, getAuthStats, getSchemaMapping, runAuthManagerMigration
} from '@/app/actions/auth-manager'
import { DatabaseSelector } from '@/components/auth-manager/DatabaseSelector'
import { UserTable } from '@/components/auth-manager/UserTable'
import { DatabaseInfoPanel } from '@/components/auth-manager/DatabaseInfoPanel'
import { AuthAuditLog } from '@/components/auth-manager/AuthAuditLog'
import { AuthPageClient } from './client'

interface PageProps {
  searchParams: Promise<{ db?: string; page?: string; search?: string }>
}

export default async function AuthManagerPage({ searchParams }: PageProps) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'true'
  if (!isAdmin) notFound()

  // Auto-create auth tables if they don't exist
  await runAuthManagerMigration()

  const params = await searchParams
  const databases = await getAuthDatabases()
  const selectedDbId = params.db || databases[0]?.id || null

  let users: { users: any[]; total: number; error?: string } = { users: [], total: 0 }
  let selectedDb = null
  let schemaMapping = null

  if (selectedDbId) {
    selectedDb = databases.find(d => d.id === selectedDbId) || null
    if (selectedDb) {
      const [usersResult, mapping] = await Promise.all([
        fetchExternalUsers(selectedDbId, {
          search: params.search,
          page: parseInt(params.page || '1'),
          limit: 25,
        }),
        getSchemaMapping(selectedDbId).catch(() => null),
      ])
      users = usersResult
      schemaMapping = mapping
    }
  }

  const stats = await getAuthStats(selectedDbId)

  return (
    <div className="min-h-screen bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-outfit text-white">Auth Manager</h1>
              <p className="text-slate-400 font-jakarta mt-0.5">Manage users across all SimplStudios applications</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="border-green-500/30 text-green-400 hover:text-green-300 hover:border-green-500/50">
              <Link href="/admin/auth/api">
                <Code2 className="w-4 h-4 mr-2" />
                API
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600">
              <Link href="/admin/auth/settings">
                <Settings className="w-4 h-4 mr-2" />
                Email Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold font-rubik text-white">{users.total}</div>
                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Users</div>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold font-rubik text-white">{stats.databases}</div>
                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Databases</div>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-red-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold font-rubik text-white">{stats.activeBans}</div>
                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Active Bans</div>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-violet-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold font-rubik text-white">{stats.pendingTokens}</div>
                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Pending Tokens</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Database Selector */}
        <AuthPageClient
          databases={databases.map(d => ({
            id: d.id,
            name: d.name,
            appName: d.appName,
            userTable: d.userTable,
            lastUserCount: d.lastUserCount,
          }))}
          selectedId={selectedDbId}
        />

        {/* Main Content */}
        {selectedDb ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
            {/* User Table (3/4) */}
            <div className="lg:col-span-3">
              <UserTable
                users={users.users}
                total={users.total}
                databaseId={selectedDbId!}
                currentPage={parseInt(params.page || '1')}
                search={params.search || ''}
                error={users.error}
                schemaMapping={schemaMapping}
              />
            </div>

            {/* Sidebar (1/4) */}
            <div className="space-y-6">
              {/* DB Info */}
              <Card className="bg-slate-900/50 border-slate-800 p-5">
                <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4 text-green-400" />
                  Connected Database
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 font-jakarta uppercase tracking-wide mb-1">App</div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/20">{selectedDb.appName}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-jakarta uppercase tracking-wide mb-1">Name</div>
                    <div className="text-sm text-slate-300 font-jakarta">{selectedDb.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-jakarta uppercase tracking-wide mb-1">Table</div>
                    <code className="text-sm text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded">{selectedDb.userTable}</code>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-jakarta uppercase tracking-wide mb-1">Total Users</div>
                    <div className="text-lg font-bold font-rubik text-white">{users.total}</div>
                  </div>
                </div>
              </Card>

              {/* Database Overview */}
              <DatabaseInfoPanel databaseId={selectedDbId!} />

              {/* Audit Log */}
              <AuthAuditLog databaseId={selectedDbId!} />
            </div>
          </div>
        ) : databases.length > 0 ? (
          <Card className="p-12 bg-slate-900/50 border-slate-800 text-center mt-8">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-outfit text-white mb-2">Select a Database</h3>
            <p className="text-slate-400 font-jakarta">
              Choose a connected database above to manage its users.
            </p>
          </Card>
        ) : (
          <Card className="p-12 bg-slate-900/50 border-slate-800 text-center mt-8">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-outfit text-white mb-2">No Databases Connected</h3>
            <p className="text-slate-400 font-jakarta mb-6">
              Connect a Turso database to start managing users across your apps.
            </p>
            <p className="text-sm text-slate-500 font-jakarta">
              Click &quot;Connect Database&quot; above to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
