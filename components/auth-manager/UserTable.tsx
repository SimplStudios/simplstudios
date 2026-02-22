'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Users, Loader2, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { UserActionsMenu } from './UserActionsMenu'
import { UserProfileDialog } from './UserProfileDialog'
import { CreateUserDialog } from './CreateUserDialog'
import type { ExternalUser, SchemaMapping } from '@/lib/turso'

// Resolve avatar source - handles URLs and base64 data
function getAvatarSrc(avatar: unknown): string | null {
  if (!avatar || typeof avatar !== 'string') return null
  // Already a URL
  if (avatar.startsWith('http') || avatar.startsWith('/')) return avatar
  // Already a data URI
  if (avatar.startsWith('data:')) return avatar
  // Base64 data (from avatar_b64 columns) - detect PNG/JPEG by magic bytes
  if (avatar.startsWith('iVBOR')) return `data:image/png;base64,${avatar}`
  if (avatar.startsWith('/9j/')) return `data:image/jpeg;base64,${avatar}`
  // Generic fallback for base64
  if (avatar.length > 100) return `data:image/png;base64,${avatar}`
  return avatar
}

interface UserWithBan extends ExternalUser {
  banStatus?: {
    reason: string
    type: string
    expiresAt: string | null
    isActive: boolean
  } | null
}

export function UserTable({
  users,
  total,
  databaseId,
  currentPage,
  search,
  error,
  schemaMapping,
}: {
  users: UserWithBan[]
  total: number
  databaseId: string
  currentPage: number
  search: string
  error?: string
  schemaMapping?: SchemaMapping | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [selectedUser, setSelectedUser] = useState<UserWithBan | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const limit = 25
  const totalPages = Math.ceil(total / limit)

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    startTransition(() => {
      router.push(`/admin/auth?${params.toString()}`)
    })
  }, [searchParams, router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search: searchInput || null, page: null })
  }

  function goToPage(page: number) {
    updateParams({ page: page > 1 ? String(page) : null })
  }

  if (error) {
    return (
      <Card className="p-8 bg-red-500/5 border-red-500/20">
        <div className="text-center">
          <div className="text-red-400 text-lg font-outfit font-semibold mb-2">Connection Error</div>
          <p className="text-slate-400 font-jakarta text-sm mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => router.refresh()}
          >
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-slate-900/50 border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="font-outfit font-semibold text-white">Users</span>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/20 text-xs">
              {total}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 w-64 bg-slate-900 border-slate-700 h-9 text-sm"
                />
              </div>
              <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-700 h-9">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            {schemaMapping && (
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="bg-green-600 hover:bg-green-700 h-9"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Create User
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-jakarta">
              {search ? 'No users match your search' : 'No users found in this database'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide font-jakarta">User</th>
                  <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide font-jakarta">Email</th>
                  <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide font-jakarta">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide font-jakarta">Role</th>
                  <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide font-jakarta">Joined</th>
                  <th className="text-right p-3 text-xs font-medium text-slate-500 uppercase tracking-wide font-jakarta">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {getAvatarSrc(user.avatar) ? (
                          <img
                            src={getAvatarSrc(user.avatar)!}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                            {(user.name || user.username || user.email || '?')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white font-jakarta">
                            {user.name || user.username || 'Unknown'}
                          </div>
                          {user.username && user.name && (
                            <div className="text-xs text-slate-500">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-slate-300 font-mono">{user.email || '—'}</span>
                    </td>
                    <td className="p-3">
                      {user.banStatus?.isActive ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/20 text-xs">Banned</Badge>
                      ) : user.emailVerified === false || String(user.emailVerified) === '0' || user.emailVerified === '0' ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20 text-xs">Unverified</Badge>
                      ) : user.status ? (
                        <Badge className={`text-xs ${
                          user.status === 'active' || user.status === '1' || user.status === 'true'
                            ? 'bg-green-500/20 text-green-400 border-green-500/20'
                            : user.status === 'suspended'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                            : user.status === 'banned'
                            ? 'bg-red-500/20 text-red-400 border-red-500/20'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/20'
                        }`}>
                          {String(user.status)}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/20 text-xs">Active</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-slate-400 font-jakarta">{user.role || '—'}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-slate-500 font-jakarta">
                        {user.createdAt
                          ? new Date(user.createdAt as string).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <UserActionsMenu user={user} databaseId={databaseId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-jakarta">
              Page {currentPage} of {totalPages} ({total} users)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={currentPage === page ? 'bg-cyan-600' : 'text-slate-400'}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* User Profile Dialog */}
      {selectedUser && (
        <UserProfileDialog
          user={selectedUser}
          databaseId={databaseId}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Create User Dialog */}
      {schemaMapping && (
        <CreateUserDialog
          databaseId={databaseId}
          mapping={schemaMapping}
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </>
  )
}
