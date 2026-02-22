'use client'

import { useState } from 'react'
import { DatabaseSelector } from '@/components/auth-manager/DatabaseSelector'
import { ConnectDatabaseDialog } from '@/components/auth-manager/ConnectDatabaseDialog'

interface ConnectedDB {
  id: string
  name: string
  appName: string
  userTable: string
  lastUserCount: number | null
}

export function AuthPageClient({
  databases,
  selectedId,
}: {
  databases: ConnectedDB[]
  selectedId: string | null
}) {
  const [showConnect, setShowConnect] = useState(false)

  return (
    <>
      <DatabaseSelector
        databases={databases}
        selectedId={selectedId}
        onConnectNew={() => setShowConnect(true)}
      />
      <ConnectDatabaseDialog
        open={showConnect}
        onClose={() => setShowConnect(false)}
      />
    </>
  )
}
