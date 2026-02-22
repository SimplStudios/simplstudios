'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import {
  getTursoClient, queryUsers, getUserById, updateUserField,
  createExternalUser as createExternalUserInDb,
  deleteExternalUser as deleteExternalUserFromDb,
  getUserSessions as getExternalSessions,
  deleteUserSessions as deleteExternalSessions,
  detectSchema, getTables, getTableColumns, getDatabaseOverview,
  detectContentTables, queryContentTable, deleteContentRow,
  type SchemaMapping, type ExternalUser, type ContentTableInfo
} from '@/lib/turso'
import { sendPasswordResetEmail, sendVerificationEmail, sendMagicLinkEmail } from '@/lib/email'
import { logAuditAction } from './vault'
import { randomBytes } from 'crypto'
import { hashPassword } from '@/lib/auth'

// ============= DATABASE & SCHEMA =============

export async function getAuthDatabases() {
  return await prisma.connectedDatabase.findMany({
    where: { isActive: true },
    orderBy: { appName: 'asc' },
  })
}

export async function getSchemaMapping(databaseId: string): Promise<SchemaMapping> {
  const mapping = await prisma.authSchemaMapping.findUnique({
    where: { databaseId },
  })

  if (mapping) {
    return {
      idColumn: mapping.idColumn,
      emailColumn: mapping.emailColumn,
      nameColumn: mapping.nameColumn,
      usernameColumn: mapping.usernameColumn,
      passwordColumn: mapping.passwordColumn,
      avatarColumn: mapping.avatarColumn,
      roleColumn: mapping.roleColumn,
      statusColumn: mapping.statusColumn,
      createdAtColumn: mapping.createdAtColumn,
      lastLoginColumn: mapping.lastLoginColumn,
      emailVerifiedColumn: mapping.emailVerifiedColumn,
      sessionTable: mapping.sessionTable,
      sessionUserIdColumn: mapping.sessionUserIdColumn,
    }
  }

  // Auto-detect if no mapping exists
  const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
  if (!db) throw new Error('Database not found')

  const client = getTursoClient(db.connectionUrl, db.serviceRole)
  const detected = await detectSchema(client, db.userTable)

  // Save the detected mapping
  const saved = await prisma.authSchemaMapping.create({
    data: {
      databaseId,
      idColumn: detected.idColumn || 'id',
      emailColumn: detected.emailColumn || 'email',
      nameColumn: detected.nameColumn,
      usernameColumn: detected.usernameColumn,
      passwordColumn: detected.passwordColumn,
      avatarColumn: detected.avatarColumn,
      roleColumn: detected.roleColumn,
      statusColumn: detected.statusColumn,
      createdAtColumn: detected.createdAtColumn,
      lastLoginColumn: detected.lastLoginColumn,
      emailVerifiedColumn: detected.emailVerifiedColumn,
    },
  })

  return {
    idColumn: saved.idColumn,
    emailColumn: saved.emailColumn,
    nameColumn: saved.nameColumn,
    usernameColumn: saved.usernameColumn,
    passwordColumn: saved.passwordColumn,
    avatarColumn: saved.avatarColumn,
    roleColumn: saved.roleColumn,
    statusColumn: saved.statusColumn,
    createdAtColumn: saved.createdAtColumn,
    lastLoginColumn: saved.lastLoginColumn,
    emailVerifiedColumn: saved.emailVerifiedColumn,
    sessionTable: saved.sessionTable,
    sessionUserIdColumn: saved.sessionUserIdColumn,
  }
}

export async function saveSchemaMapping(formData: FormData) {
  const databaseId = formData.get('databaseId') as string

  await prisma.authSchemaMapping.upsert({
    where: { databaseId },
    create: {
      databaseId,
      idColumn: (formData.get('idColumn') as string) || 'id',
      emailColumn: (formData.get('emailColumn') as string) || 'email',
      nameColumn: formData.get('nameColumn') as string || null,
      usernameColumn: formData.get('usernameColumn') as string || null,
      passwordColumn: formData.get('passwordColumn') as string || null,
      avatarColumn: formData.get('avatarColumn') as string || null,
      roleColumn: formData.get('roleColumn') as string || null,
      statusColumn: formData.get('statusColumn') as string || null,
      createdAtColumn: formData.get('createdAtColumn') as string || null,
      lastLoginColumn: formData.get('lastLoginColumn') as string || null,
      emailVerifiedColumn: formData.get('emailVerifiedColumn') as string || null,
      sessionTable: formData.get('sessionTable') as string || null,
      sessionUserIdColumn: formData.get('sessionUserIdColumn') as string || null,
    },
    update: {
      idColumn: (formData.get('idColumn') as string) || 'id',
      emailColumn: (formData.get('emailColumn') as string) || 'email',
      nameColumn: formData.get('nameColumn') as string || null,
      usernameColumn: formData.get('usernameColumn') as string || null,
      passwordColumn: formData.get('passwordColumn') as string || null,
      avatarColumn: formData.get('avatarColumn') as string || null,
      roleColumn: formData.get('roleColumn') as string || null,
      statusColumn: formData.get('statusColumn') as string || null,
      createdAtColumn: formData.get('createdAtColumn') as string || null,
      lastLoginColumn: formData.get('lastLoginColumn') as string || null,
      emailVerifiedColumn: formData.get('emailVerifiedColumn') as string || null,
      sessionTable: formData.get('sessionTable') as string || null,
      sessionUserIdColumn: formData.get('sessionUserIdColumn') as string || null,
    },
  })

  await logAuditAction('auth_schema_updated', `Updated schema mapping for DB: ${databaseId}`)
  revalidatePath('/admin/auth')
}

// ============= USER QUERIES =============

export async function fetchExternalUsers(
  databaseId: string,
  options: { search?: string; page?: number; limit?: number; sortBy?: string; sortDir?: 'ASC' | 'DESC' }
): Promise<{ users: (ExternalUser & { banStatus?: any })[]; total: number; error?: string }> {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { users: [], total: 0, error: 'Database not found' }

    const mapping = await getSchemaMapping(databaseId)
    const client = getTursoClient(db.connectionUrl, db.serviceRole)

    const { page = 1, limit = 25, ...rest } = options
    const result = await queryUsers(client, db.userTable, mapping, {
      ...rest,
      limit,
      offset: (page - 1) * limit,
    })

    // Merge with ban status from local DB
    const bans = await prisma.authUserBan.findMany({
      where: { databaseId, isActive: true },
    })
    const banMap = new Map(bans.map(b => [b.externalUserId, b]))

    const enrichedUsers = result.users.map(user => ({
      ...user,
      banStatus: banMap.get(user.id) || null,
    }))

    return { users: enrichedUsers, total: result.total }
  } catch (error: any) {
    console.error('[Auth Manager] Failed to fetch users:', error.message)
    return { users: [], total: 0, error: error.message }
  }
}

export async function fetchExternalUser(
  databaseId: string,
  userId: string
): Promise<{ user: ExternalUser | null; error?: string }> {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { user: null, error: 'Database not found' }

    const mapping = await getSchemaMapping(databaseId)
    const client = getTursoClient(db.connectionUrl, db.serviceRole)
    const user = await getUserById(client, db.userTable, mapping, userId)

    return { user }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// ============= USER MANAGEMENT ACTIONS =============

export async function banUser(formData: FormData) {
  const databaseId = formData.get('databaseId') as string
  const userId = formData.get('userId') as string
  const email = formData.get('email') as string
  const reason = formData.get('reason') as string
  const type = formData.get('type') as string || 'permanent'
  const duration = formData.get('duration') as string

  const expiresAt = type === 'temporary' && duration
    ? new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000)
    : null

  await prisma.authUserBan.create({
    data: {
      databaseId,
      externalUserId: userId,
      email,
      reason: reason || 'No reason provided',
      type,
      expiresAt,
      isActive: true,
    },
  })

  // Update status in external DB if mapped
  try {
    const mapping = await getSchemaMapping(databaseId)
    if (mapping.statusColumn) {
      const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
      if (db) {
        const client = getTursoClient(db.connectionUrl, db.serviceRole)
        await updateUserField(client, db.userTable, mapping, userId, mapping.statusColumn, 'banned')
      }
    }
  } catch (e) {
    // Non-critical: ban is still recorded locally
  }

  await logAuditAction('auth_user_banned', `Banned user ${email} (${userId}): ${reason}`)
  revalidatePath('/admin/auth')
}

export async function unbanUser(databaseId: string, userId: string) {
  await prisma.authUserBan.updateMany({
    where: { databaseId, externalUserId: userId, isActive: true },
    data: { isActive: false, unbannedAt: new Date() },
  })

  // Update status in external DB if mapped
  try {
    const mapping = await getSchemaMapping(databaseId)
    if (mapping.statusColumn) {
      const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
      if (db) {
        const client = getTursoClient(db.connectionUrl, db.serviceRole)
        await updateUserField(client, db.userTable, mapping, userId, mapping.statusColumn, 'active')
      }
    }
  } catch (e) {}

  await logAuditAction('auth_user_unbanned', `Unbanned user ${userId}`)
  revalidatePath('/admin/auth')
}

export async function resetUserPassword(formData: FormData) {
  const databaseId = formData.get('databaseId') as string
  const userId = formData.get('userId') as string
  const email = formData.get('email') as string
  const newPassword = formData.get('newPassword') as string

  // If a new password is provided, directly set it in the external DB
  if (newPassword) {
    try {
      const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
      if (!db) return { error: 'Database not found' }

      const mapping = await getSchemaMapping(databaseId)
      if (!mapping.passwordColumn) return { error: 'No password column mapped for this database' }

      const client = getTursoClient(db.connectionUrl, db.serviceRole)
      const hashed = await hashPassword(newPassword)
      await updateUserField(client, db.userTable, mapping, userId, mapping.passwordColumn, hashed)

      await logAuditAction('auth_password_reset_direct', `Directly reset password for ${email} (${userId})`)
      revalidatePath('/admin/auth')
      return { success: true }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Otherwise, generate a token and send a reset email
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.authToken.create({
    data: {
      databaseId,
      externalUserId: userId,
      email,
      token,
      type: 'password_reset',
      expiresAt,
    },
  })

  const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
  const result = await sendPasswordResetEmail(email, token, db?.appName || 'SimplStudios')

  await logAuditAction('auth_password_reset_sent', `Password reset email sent to ${email} (${userId})`)
  revalidatePath('/admin/auth')
  return result
}

export async function verifyUserEmail(databaseId: string, userId: string) {
  try {
    const mapping = await getSchemaMapping(databaseId)
    if (!mapping.emailVerifiedColumn) return { error: 'No email_verified column mapped' }

    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const client = getTursoClient(db.connectionUrl, db.serviceRole)
    await updateUserField(client, db.userTable, mapping, userId, mapping.emailVerifiedColumn, true)

    await logAuditAction('auth_email_verified', `Manually verified email for user ${userId}`)
    revalidatePath('/admin/auth')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function sendVerificationEmailAction(formData: FormData) {
  const databaseId = formData.get('databaseId') as string
  const userId = formData.get('userId') as string
  const email = formData.get('email') as string

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.authToken.create({
    data: {
      databaseId,
      externalUserId: userId,
      email,
      token,
      type: 'email_verification',
      expiresAt,
    },
  })

  const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
  const result = await sendVerificationEmail(email, token, db?.appName || 'SimplStudios')

  await logAuditAction('auth_verification_sent', `Verification email sent to ${email} (${userId})`)
  revalidatePath('/admin/auth')
  return result
}

export async function sendMagicLinkAction(formData: FormData) {
  const databaseId = formData.get('databaseId') as string
  const userId = formData.get('userId') as string
  const email = formData.get('email') as string

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.authToken.create({
    data: {
      databaseId,
      externalUserId: userId,
      email,
      token,
      type: 'magic_link',
      expiresAt,
    },
  })

  const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
  const result = await sendMagicLinkEmail(email, token, db?.appName || 'SimplStudios')

  await logAuditAction('auth_magic_link_sent', `Magic link sent to ${email} (${userId})`)
  revalidatePath('/admin/auth')
  return result
}

export async function forceLogout(databaseId: string, userId: string) {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const mapping = await getSchemaMapping(databaseId)
    const client = getTursoClient(db.connectionUrl, db.serviceRole)

    const count = await deleteExternalSessions(client, mapping, userId)

    await logAuditAction('auth_force_logout', `Force logged out user ${userId}, ${count} sessions destroyed`)
    revalidatePath('/admin/auth')
    return { success: true, sessionsDestroyed: count }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteExternalUserAction(databaseId: string, userId: string) {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const mapping = await getSchemaMapping(databaseId)
    const client = getTursoClient(db.connectionUrl, db.serviceRole)

    // Get user info for audit log
    const user = await getUserById(client, db.userTable, mapping, userId)

    await deleteExternalUserFromDb(client, db.userTable, mapping, userId)

    // Clean up local records
    await prisma.authUserBan.deleteMany({ where: { databaseId, externalUserId: userId } })
    await prisma.authToken.deleteMany({ where: { databaseId, externalUserId: userId } })

    await logAuditAction('auth_user_deleted', `Deleted user ${user?.email} (${userId}) from ${db.appName}`)
    revalidatePath('/admin/auth')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function createExternalUserAction(formData: FormData) {
  const databaseId = formData.get('databaseId') as string

  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const mapping = await getSchemaMapping(databaseId)
    const client = getTursoClient(db.connectionUrl, db.serviceRole)

    const fields: Record<string, string | number | boolean | null> = {}

    // ID - generate a UUID if not provided
    const id = formData.get('id') as string
    fields[mapping.idColumn] = id || crypto.randomUUID()

    // Required: email
    const email = formData.get('email') as string
    if (!email) return { error: 'Email is required' }
    fields[mapping.emailColumn] = email

    // Optional mapped fields
    if (mapping.nameColumn) {
      const name = formData.get('name') as string
      if (name) fields[mapping.nameColumn] = name
    }
    if (mapping.usernameColumn) {
      const username = formData.get('username') as string
      if (username) fields[mapping.usernameColumn] = username
    }
    if (mapping.passwordColumn) {
      const password = formData.get('password') as string
      if (password) {
        fields[mapping.passwordColumn] = await hashPassword(password)
      }
    }
    if (mapping.roleColumn) {
      const role = formData.get('role') as string
      if (role) fields[mapping.roleColumn] = role
    }
    if (mapping.emailVerifiedColumn) {
      const emailVerified = formData.get('emailVerified') === 'true'
      fields[mapping.emailVerifiedColumn] = emailVerified ? 1 : 0
    }
    if (mapping.createdAtColumn) {
      fields[mapping.createdAtColumn] = new Date().toISOString()
    }

    await createExternalUserInDb(client, db.userTable, mapping, fields)

    await logAuditAction('auth_user_created', `Created user ${email} in ${db.appName}`)
    revalidatePath('/admin/auth')
    return { success: true, userId: fields[mapping.idColumn] }
  } catch (error: any) {
    return { error: error.message }
  }
}

// ============= STATS =============

export async function getAuthStats(databaseId?: string | null) {
  const bansWhere = databaseId ? { databaseId, isActive: true } : { isActive: true }
  const tokensWhere = databaseId ? { databaseId } : {}

  const [activeBans, pendingTokens, databases] = await Promise.all([
    prisma.authUserBan.count({ where: bansWhere }),
    prisma.authToken.count({
      where: { ...tokensWhere, usedAt: null, expiresAt: { gt: new Date() } },
    }),
    prisma.connectedDatabase.count({ where: { isActive: true } }),
  ])

  return { activeBans, pendingTokens, databases }
}

// ============= AUDIT LOG (filtered for auth actions) =============

export async function getAuthAuditLogs(limit = 20) {
  return await prisma.auditLog.findMany({
    where: {
      action: { startsWith: 'auth_' },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// ============= DATABASE INTROSPECTION =============

export async function introspectDatabase(databaseId: string) {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const client = getTursoClient(db.connectionUrl, db.serviceRole)
    const tables = await getTables(client)
    const columns = await getTableColumns(client, db.userTable)
    const detected = await detectSchema(client, db.userTable)

    return { tables, columns, detected }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getDatabaseInfo(databaseId: string) {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const client = getTursoClient(db.connectionUrl, db.serviceRole)
    const overview = await getDatabaseOverview(client)

    return { ...overview, dbName: db.name, appName: db.appName }
  } catch (error: any) {
    return { error: error.message }
  }
}

// ============= CONTENT MODERATION =============

export async function fetchContentTables(databaseId: string): Promise<{ tables: ContentTableInfo[]; error?: string }> {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { tables: [], error: 'Database not found' }

    const client = getTursoClient(db.connectionUrl, db.serviceRole)
    const tables = await detectContentTables(client, db.userTable)
    return { tables }
  } catch (error: any) {
    return { tables: [], error: error.message }
  }
}

export async function fetchContentRows(
  databaseId: string,
  tableName: string,
  options: { page?: number; limit?: number; userId?: string }
): Promise<{ rows: Record<string, unknown>[]; total: number; tableInfo?: ContentTableInfo; error?: string }> {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { rows: [], total: 0, error: 'Database not found' }

    const client = getTursoClient(db.connectionUrl, db.serviceRole)

    // Verify tableName is a detected content table (security)
    const contentTables = await detectContentTables(client, db.userTable)
    const tableInfo = contentTables.find(t => t.name === tableName)
    if (!tableInfo) return { rows: [], total: 0, error: 'Table not found or not a content table' }

    // Pick columns to select (up to 6 meaningful ones)
    const selectColumns: string[] = [tableInfo.idColumn]
    if (tableInfo.userFkColumn && !selectColumns.includes(tableInfo.userFkColumn)) {
      selectColumns.push(tableInfo.userFkColumn)
    }
    if (tableInfo.displayColumns.titleColumn) selectColumns.push(tableInfo.displayColumns.titleColumn)
    if (tableInfo.displayColumns.bodyColumn) selectColumns.push(tableInfo.displayColumns.bodyColumn)
    if (tableInfo.displayColumns.createdAtColumn) selectColumns.push(tableInfo.displayColumns.createdAtColumn)
    // Fill remaining slots with other columns (skip blobs/passwords)
    const skipPatterns = ['password', 'hash', 'token', 'secret', 'avatar_b64']
    for (const col of tableInfo.columns) {
      if (selectColumns.length >= 7) break
      if (selectColumns.includes(col.name)) continue
      if (skipPatterns.some(p => col.name.toLowerCase().includes(p))) continue
      selectColumns.push(col.name)
    }

    const { page = 1, limit = 25, userId } = options
    const orderBy = tableInfo.displayColumns.createdAtColumn || tableInfo.idColumn

    const result = await queryContentTable(client, tableName, {
      columns: selectColumns,
      userFkColumn: userId ? (tableInfo.userFkColumn || undefined) : undefined,
      userId,
      limit,
      offset: (page - 1) * limit,
      orderBy,
      orderDir: 'DESC',
    })

    // Truncate long text values
    const truncatedRows = result.rows.map(row => {
      const truncated: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string' && value.length > 200) {
          truncated[key] = value.slice(0, 200) + '...'
        } else {
          truncated[key] = value
        }
      }
      return truncated
    })

    return { rows: truncatedRows, total: result.total, tableInfo }
  } catch (error: any) {
    return { rows: [], total: 0, error: error.message }
  }
}

export async function deleteContentAction(databaseId: string, tableName: string, rowId: string) {
  try {
    const db = await prisma.connectedDatabase.findUnique({ where: { id: databaseId } })
    if (!db) return { error: 'Database not found' }

    const client = getTursoClient(db.connectionUrl, db.serviceRole)

    // Verify table is content table
    const contentTables = await detectContentTables(client, db.userTable)
    const tableInfo = contentTables.find(t => t.name === tableName)
    if (!tableInfo) return { error: 'Table not found or not a content table' }

    await deleteContentRow(client, tableName, tableInfo.idColumn, rowId)

    await logAuditAction('auth_content_deleted', `Deleted row ${rowId} from ${tableName} in ${db.appName}`)
    revalidatePath('/admin/auth')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// ============= CONNECT NEW DATABASE =============

export async function connectDatabase(formData: FormData) {
  const name = formData.get('name') as string
  const appName = formData.get('appName') as string
  const connectionUrl = formData.get('connectionUrl') as string
  const authToken = formData.get('authToken') as string || null
  const userTable = formData.get('userTable') as string || 'users'

  // Test the connection first
  try {
    const client = getTursoClient(connectionUrl, authToken)
    await client.execute(`SELECT 1`)
  } catch (error: any) {
    return { error: `Connection failed: ${error.message}` }
  }

  const db = await prisma.connectedDatabase.create({
    data: {
      name,
      appName,
      connectionUrl,
      serviceRole: authToken,
      userTable,
    },
  })

  // Auto-detect schema
  try {
    const client = getTursoClient(connectionUrl, authToken)
    const detected = await detectSchema(client, userTable)
    await prisma.authSchemaMapping.create({
      data: {
        databaseId: db.id,
        idColumn: detected.idColumn || 'id',
        emailColumn: detected.emailColumn || 'email',
        nameColumn: detected.nameColumn,
        usernameColumn: detected.usernameColumn,
        passwordColumn: detected.passwordColumn,
        avatarColumn: detected.avatarColumn,
        roleColumn: detected.roleColumn,
        statusColumn: detected.statusColumn,
        createdAtColumn: detected.createdAtColumn,
        lastLoginColumn: detected.lastLoginColumn,
        emailVerifiedColumn: detected.emailVerifiedColumn,
      },
    })
  } catch (e) {
    // Non-critical: mapping can be set up manually
  }

  await logAuditAction('auth_database_connected', `Connected database: ${name} (${appName})`)
  revalidatePath('/admin/auth')
  return { success: true, databaseId: db.id }
}

export async function disconnectDatabase(databaseId: string) {
  await prisma.connectedDatabase.update({
    where: { id: databaseId },
    data: { isActive: false },
  })

  await logAuditAction('auth_database_disconnected', `Disconnected database: ${databaseId}`)
  revalidatePath('/admin/auth')
}

// ============= AUTO-MIGRATION =============

// ============= EMAIL SETTINGS =============

export async function getEmailSettings(): Promise<{
  resendApiKey: string | null
  fromEmail: string
  appUrl: string
  configured: boolean
}> {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT resend_api_key, from_email, app_url FROM auth_email_settings WHERE id = 'default' LIMIT 1`
    )
    if (result.length > 0) {
      return {
        resendApiKey: result[0].resend_api_key,
        fromEmail: result[0].from_email,
        appUrl: result[0].app_url,
        configured: !!result[0].resend_api_key,
      }
    }
  } catch (e) {
    // Table might not exist yet
  }
  return {
    resendApiKey: process.env.RESEND_API_KEY || null,
    fromEmail: process.env.AUTH_MANAGER_FROM_EMAIL || 'onboarding@resend.dev',
    appUrl: process.env.AUTH_MANAGER_APP_URL || 'https://simplstudios.vercel.app',
    configured: !!process.env.RESEND_API_KEY,
  }
}

export async function saveEmailSettings(formData: FormData) {
  const resendApiKey = formData.get('resendApiKey') as string
  const fromEmail = formData.get('fromEmail') as string || 'onboarding@resend.dev'
  const appUrl = formData.get('appUrl') as string || 'https://simplstudios.vercel.app'

  if (!resendApiKey) return { error: 'Resend API key is required' }

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO auth_email_settings (id, resend_api_key, from_email, app_url, updated_at)
       VALUES ('default', $1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         resend_api_key = EXCLUDED.resend_api_key,
         from_email = EXCLUDED.from_email,
         app_url = EXCLUDED.app_url,
         updated_at = CURRENT_TIMESTAMP`,
      resendApiKey,
      fromEmail,
      appUrl
    )

    // Clear the cached Resend instance so it picks up the new key
    const { clearEmailCache } = await import('@/lib/email')
    clearEmailCache()

    await logAuditAction('auth_email_settings_updated', `Updated email settings (from: ${fromEmail})`)
    revalidatePath('/admin/auth')
    revalidatePath('/admin/auth/settings')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function testEmailConnection(formData: FormData) {
  const testEmail = formData.get('testEmail') as string
  if (!testEmail) return { error: 'Test email address is required' }

  try {
    const settings = await getEmailSettings()
    if (!settings.configured || !settings.resendApiKey) {
      return { error: 'Resend is not configured. Save your API key first.' }
    }

    const { Resend } = await import('resend')
    const resend = new Resend(settings.resendApiKey)

    const { error } = await resend.emails.send({
      from: `SimplStudios <${settings.fromEmail}>`,
      to: testEmail,
      subject: 'SimplStudios Auth Manager - Test Email',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #e2e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Test Email</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">SimplStudios Auth Manager</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
            <p style="color: #22d3ee; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">It works!</p>
            <p style="color: #e2e8f0; font-size: 16px; margin: 0;">
              Your Resend integration is configured correctly. You can now send password resets, verification emails, and magic links through the Auth Manager.
            </p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Sent by SimplStudios Auth Manager
          </p>
        </div>
      `,
    })

    if (error) return { error: error.message }

    await logAuditAction('auth_test_email_sent', `Test email sent to ${testEmail}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to send test email' }
  }
}

const AUTH_MANAGER_MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS auth_user_bans (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT NOT NULL,
    external_user_id TEXT NOT NULL,
    email TEXT,
    reason TEXT NOT NULL,
    type TEXT DEFAULT 'permanent',
    expires_at TIMESTAMP,
    banned_by TEXT DEFAULT 'Admin',
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unbanned_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
  )`,
  `CREATE INDEX IF NOT EXISTS idx_auth_bans_db_user ON auth_user_bans(database_id, external_user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_auth_bans_db_active ON auth_user_bans(database_id, is_active)`,
  `CREATE TABLE IF NOT EXISTS auth_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT NOT NULL,
    external_user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token)`,
  `CREATE INDEX IF NOT EXISTS idx_auth_tokens_db_user ON auth_tokens(database_id, external_user_id)`,
  `CREATE TABLE IF NOT EXISTS auth_schema_mappings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT UNIQUE NOT NULL,
    id_column TEXT DEFAULT 'id',
    email_column TEXT DEFAULT 'email',
    name_column TEXT,
    username_column TEXT,
    password_column TEXT,
    avatar_column TEXT,
    role_column TEXT,
    status_column TEXT,
    created_at_column TEXT,
    last_login_column TEXT,
    email_verified_column TEXT,
    session_table TEXT,
    session_user_id_column TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS auth_email_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    resend_api_key TEXT NOT NULL,
    from_email TEXT NOT NULL DEFAULT 'onboarding@resend.dev',
    app_url TEXT NOT NULL DEFAULT 'https://simplstudios.vercel.app',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
]

export async function runAuthManagerMigration() {
  try {
    for (const sql of AUTH_MANAGER_MIGRATIONS) {
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.error('[Auth Manager] Migration error:', e.message)
        }
      }
    }
    return { success: true }
  } catch (e: any) {
    console.error('[Auth Manager] Migration failed:', e.message)
    return { success: false, error: e.message }
  }
}
