import { getDatabaseInfo } from '@/app/actions/auth-manager'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Table2, HardDrive, Rows3 } from 'lucide-react'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export async function DatabaseInfoPanel({ databaseId }: { databaseId: string }) {
  const info = await getDatabaseInfo(databaseId)

  if ('error' in info && info.error) {
    return (
      <Card className="bg-red-500/5 border-red-500/20 p-4">
        <p className="text-sm text-red-400 font-jakarta">Failed to load DB info: {info.error}</p>
      </Card>
    )
  }

  if (!('tables' in info)) return null

  const storageBytes = info.pageSize * info.pageCount
  const storageDisplay = storageBytes > 0 ? formatBytes(storageBytes) : 'N/A'

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-5">
      <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2 text-sm">
        <HardDrive className="w-4 h-4 text-blue-400" />
        Database Overview
      </h3>

      {/* Storage Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-jakarta">
            <Table2 className="w-3 h-3" />
            Tables
          </div>
          <div className="text-lg font-bold font-rubik text-white">{info.tables.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-jakarta">
            <Rows3 className="w-3 h-3" />
            Total Rows
          </div>
          <div className="text-lg font-bold font-rubik text-white">{info.totalRows.toLocaleString()}</div>
        </div>
      </div>

      {storageBytes > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-jakarta">
            <HardDrive className="w-3 h-3" />
            Storage
          </div>
          <div className="text-lg font-bold font-rubik text-white">{storageDisplay}</div>
          <div className="text-xs text-slate-500 font-jakarta mt-0.5">
            {info.pageCount.toLocaleString()} pages x {formatBytes(info.pageSize)}
          </div>
        </div>
      )}

      {/* Table List */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta">Tables</div>
        {info.tables.map((table) => (
          <div
            key={table.name}
            className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <code className="text-sm font-mono text-slate-300">{table.name}</code>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">
                {table.rowCount} {table.rowCount === 1 ? 'row' : 'rows'}
              </Badge>
              <Badge className="bg-slate-700/50 text-slate-500 border-slate-600 text-xs">
                {table.columns.length} cols
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
