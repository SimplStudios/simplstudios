import { getAuthAuditLogs } from '@/app/actions/auth-manager'
import { Card } from '@/components/ui/card'
import { Activity, Ban, Key, Mail, Link2, Trash2, Shield, Database, UserCog } from 'lucide-react'

const actionIcons: Record<string, { icon: any; color: string }> = {
  auth_user_banned: { icon: Ban, color: 'text-red-400' },
  auth_user_unbanned: { icon: Shield, color: 'text-green-400' },
  auth_password_reset_sent: { icon: Key, color: 'text-blue-400' },
  auth_password_reset_direct: { icon: Key, color: 'text-amber-400' },
  auth_verification_sent: { icon: Mail, color: 'text-emerald-400' },
  auth_magic_link_sent: { icon: Link2, color: 'text-violet-400' },
  auth_email_verified: { icon: Mail, color: 'text-green-400' },
  auth_force_logout: { icon: UserCog, color: 'text-orange-400' },
  auth_user_deleted: { icon: Trash2, color: 'text-red-400' },
  auth_database_connected: { icon: Database, color: 'text-cyan-400' },
  auth_database_disconnected: { icon: Database, color: 'text-slate-400' },
  auth_schema_updated: { icon: Database, color: 'text-blue-400' },
}

function getActionDisplay(action: string) {
  return actionIcons[action] || { icon: Activity, color: 'text-slate-400' }
}

function formatAction(action: string): string {
  return action
    .replace('auth_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export async function AuthAuditLog({ databaseId }: { databaseId: string }) {
  const logs = await getAuthAuditLogs(15)

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-4">
      <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2 text-sm">
        <Activity className="w-4 h-4 text-cyan-400" />
        Auth Activity
      </h3>

      {logs.length === 0 ? (
        <p className="text-sm text-slate-500 font-jakarta text-center py-4">No auth activity yet</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => {
            const { icon: Icon, color } = getActionDisplay(log.action)
            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-300 font-jakarta">
                    {formatAction(log.action)}
                  </div>
                  {log.details && (
                    <div className="text-xs text-slate-500 font-jakarta truncate mt-0.5">
                      {log.details}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-600 font-jakarta shrink-0">
                  {timeAgo(log.createdAt)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
