import { createClient, type Client } from '@libsql/client'

// Connection cache to avoid recreating clients per request
const clientCache = new Map<string, Client>()

export function getTursoClient(connectionUrl: string, authToken?: string | null): Client {
  const cacheKey = connectionUrl

  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!
  }

  const client = createClient({
    url: connectionUrl,
    authToken: authToken || undefined,
  })

  clientCache.set(cacheKey, client)
  return client
}

// Generic type for external user row - all fields optional since schema varies
export interface ExternalUser {
  id: string
  email?: string
  name?: string
  username?: string
  avatar?: string
  role?: string
  status?: string
  emailVerified?: boolean | string | null
  createdAt?: string
  lastLogin?: string
  [key: string]: unknown
}

export interface SchemaMapping {
  idColumn: string
  emailColumn: string
  nameColumn?: string | null
  usernameColumn?: string | null
  passwordColumn?: string | null
  avatarColumn?: string | null
  roleColumn?: string | null
  statusColumn?: string | null
  createdAtColumn?: string | null
  lastLoginColumn?: string | null
  emailVerifiedColumn?: string | null
  sessionTable?: string | null
  sessionUserIdColumn?: string | null
}

// Validate column name to prevent SQL injection
function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

function validateColumn(name: string): string {
  if (!isValidColumnName(name)) {
    throw new Error(`Invalid column name: ${name}`)
  }
  return name
}

// Query users with pagination, search, sorting
export async function queryUsers(
  client: Client,
  userTable: string,
  mapping: SchemaMapping,
  options: {
    search?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortDir?: 'ASC' | 'DESC'
  } = {}
): Promise<{ users: ExternalUser[]; total: number }> {
  const { search, limit = 50, offset = 0, sortBy, sortDir = 'DESC' } = options

  validateColumn(userTable)

  // Build SELECT columns from mapping
  const selectParts: string[] = [
    `${validateColumn(mapping.idColumn)} as id`,
    `${validateColumn(mapping.emailColumn)} as email`,
  ]
  if (mapping.nameColumn) selectParts.push(`${validateColumn(mapping.nameColumn)} as name`)
  if (mapping.usernameColumn) selectParts.push(`${validateColumn(mapping.usernameColumn)} as username`)
  if (mapping.avatarColumn) selectParts.push(`${validateColumn(mapping.avatarColumn)} as avatar`)
  if (mapping.roleColumn) selectParts.push(`${validateColumn(mapping.roleColumn)} as role`)
  if (mapping.statusColumn) selectParts.push(`${validateColumn(mapping.statusColumn)} as status`)
  if (mapping.createdAtColumn) selectParts.push(`${validateColumn(mapping.createdAtColumn)} as createdAt`)
  if (mapping.lastLoginColumn) selectParts.push(`${validateColumn(mapping.lastLoginColumn)} as lastLogin`)
  if (mapping.emailVerifiedColumn) selectParts.push(`${validateColumn(mapping.emailVerifiedColumn)} as emailVerified`)

  const columns = selectParts.join(', ')

  let whereClause = ''
  const args: Record<string, string | number> = {}

  if (search) {
    const searchConditions = [`${validateColumn(mapping.emailColumn)} LIKE ?`]
    if (mapping.nameColumn) searchConditions.push(`${validateColumn(mapping.nameColumn)} LIKE ?`)
    if (mapping.usernameColumn) searchConditions.push(`${validateColumn(mapping.usernameColumn)} LIKE ?`)
    whereClause = `WHERE ${searchConditions.join(' OR ')}`
  }

  const orderColumn = sortBy ? validateColumn(sortBy) : (mapping.createdAtColumn ? validateColumn(mapping.createdAtColumn) : validateColumn(mapping.idColumn))
  const direction = sortDir === 'ASC' ? 'ASC' : 'DESC'

  // Count query
  const searchPattern = search ? `%${search}%` : null
  const countArgs = searchPattern
    ? Array(whereClause.split('?').length - 1).fill(searchPattern)
    : []

  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM ${userTable} ${whereClause}`,
    args: countArgs,
  })
  const total = Number(countResult.rows[0]?.count ?? 0)

  // Data query
  const dataArgs = searchPattern
    ? [...Array(whereClause.split('?').length - 1).fill(searchPattern), limit, offset]
    : [limit, offset]

  const result = await client.execute({
    sql: `SELECT ${columns} FROM ${userTable} ${whereClause} ORDER BY ${orderColumn} ${direction} LIMIT ? OFFSET ?`,
    args: dataArgs,
  })

  const users: ExternalUser[] = result.rows.map(row => {
    const user: ExternalUser = { id: String(row.id ?? '') }
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'id' && value !== undefined && value !== null) {
        user[key] = value as string
      }
    }
    return user
  })

  return { users, total }
}

// Get single user by ID
export async function getUserById(
  client: Client,
  userTable: string,
  mapping: SchemaMapping,
  userId: string
): Promise<ExternalUser | null> {
  validateColumn(userTable)

  const selectParts: string[] = [`${validateColumn(mapping.idColumn)} as id`, `${validateColumn(mapping.emailColumn)} as email`]
  if (mapping.nameColumn) selectParts.push(`${validateColumn(mapping.nameColumn)} as name`)
  if (mapping.usernameColumn) selectParts.push(`${validateColumn(mapping.usernameColumn)} as username`)
  if (mapping.avatarColumn) selectParts.push(`${validateColumn(mapping.avatarColumn)} as avatar`)
  if (mapping.roleColumn) selectParts.push(`${validateColumn(mapping.roleColumn)} as role`)
  if (mapping.statusColumn) selectParts.push(`${validateColumn(mapping.statusColumn)} as status`)
  if (mapping.createdAtColumn) selectParts.push(`${validateColumn(mapping.createdAtColumn)} as createdAt`)
  if (mapping.lastLoginColumn) selectParts.push(`${validateColumn(mapping.lastLoginColumn)} as lastLogin`)
  if (mapping.emailVerifiedColumn) selectParts.push(`${validateColumn(mapping.emailVerifiedColumn)} as emailVerified`)

  const result = await client.execute({
    sql: `SELECT ${selectParts.join(', ')} FROM ${userTable} WHERE ${validateColumn(mapping.idColumn)} = ?`,
    args: [userId],
  })

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  const user: ExternalUser = { id: String(row.id ?? '') }
  for (const [key, value] of Object.entries(row)) {
    if (key !== 'id' && value !== undefined && value !== null) {
      user[key] = value as string
    }
  }
  return user
}

// Update a user field in external DB
export async function updateUserField(
  client: Client,
  userTable: string,
  mapping: SchemaMapping,
  userId: string,
  columnName: string,
  value: string | number | boolean | null
): Promise<void> {
  validateColumn(userTable)
  validateColumn(columnName)

  await client.execute({
    sql: `UPDATE ${userTable} SET ${columnName} = ? WHERE ${validateColumn(mapping.idColumn)} = ?`,
    args: [value, userId],
  })
}

// Update user password in external DB
export async function updateUserPassword(
  client: Client,
  userTable: string,
  mapping: SchemaMapping,
  userId: string,
  hashedPassword: string
): Promise<void> {
  if (!mapping.passwordColumn) throw new Error('No password column mapped')
  validateColumn(userTable)
  validateColumn(mapping.passwordColumn)

  await client.execute({
    sql: `UPDATE ${userTable} SET ${mapping.passwordColumn} = ? WHERE ${validateColumn(mapping.idColumn)} = ?`,
    args: [hashedPassword, userId],
  })
}

// Create a new user in external DB
export async function createExternalUser(
  client: Client,
  userTable: string,
  mapping: SchemaMapping,
  fields: Record<string, string | number | boolean | null>
): Promise<void> {
  validateColumn(userTable)

  const columns: string[] = []
  const placeholders: string[] = []
  const values: (string | number | boolean | null)[] = []

  for (const [col, val] of Object.entries(fields)) {
    if (val !== null && val !== undefined && val !== '') {
      columns.push(validateColumn(col))
      placeholders.push('?')
      values.push(val)
    }
  }

  if (columns.length === 0) throw new Error('No fields provided')

  await client.execute({
    sql: `INSERT INTO ${userTable} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    args: values,
  })
}

// Delete user from external DB
export async function deleteExternalUser(
  client: Client,
  userTable: string,
  mapping: SchemaMapping,
  userId: string
): Promise<void> {
  validateColumn(userTable)

  await client.execute({
    sql: `DELETE FROM ${userTable} WHERE ${validateColumn(mapping.idColumn)} = ?`,
    args: [userId],
  })
}

// Get active sessions for a user (if session table is mapped)
export async function getUserSessions(
  client: Client,
  mapping: SchemaMapping,
  userId: string
): Promise<Record<string, unknown>[]> {
  if (!mapping.sessionTable || !mapping.sessionUserIdColumn) return []
  validateColumn(mapping.sessionTable)
  validateColumn(mapping.sessionUserIdColumn)

  const result = await client.execute({
    sql: `SELECT * FROM ${mapping.sessionTable} WHERE ${mapping.sessionUserIdColumn} = ?`,
    args: [userId],
  })

  return result.rows.map(row => {
    const session: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      session[key] = value
    }
    return session
  })
}

// Delete all sessions for a user (force logout)
export async function deleteUserSessions(
  client: Client,
  mapping: SchemaMapping,
  userId: string
): Promise<number> {
  if (!mapping.sessionTable || !mapping.sessionUserIdColumn) return 0
  validateColumn(mapping.sessionTable)
  validateColumn(mapping.sessionUserIdColumn)

  const result = await client.execute({
    sql: `DELETE FROM ${mapping.sessionTable} WHERE ${mapping.sessionUserIdColumn} = ?`,
    args: [userId],
  })

  return result.rowsAffected
}

// Auto-detect schema by introspecting the table
export async function detectSchema(
  client: Client,
  tableName: string
): Promise<Partial<SchemaMapping>> {
  validateColumn(tableName)

  const result = await client.execute(`PRAGMA table_info(${tableName})`)
  const columns = result.rows.map(r => String(r.name).toLowerCase())

  const find = (candidates: string[]) =>
    columns.find(c => candidates.includes(c)) || null

  return {
    idColumn: find(['id', 'user_id', 'uid', 'userid']) || 'id',
    emailColumn: find(['email', 'user_email', 'email_address']) || 'email',
    nameColumn: find(['name', 'full_name', 'display_name', 'fullname']),
    usernameColumn: find(['username', 'user_name', 'handle', 'screen_name']),
    passwordColumn: find(['password', 'password_hash', 'hashed_password', 'passwd']),
    avatarColumn: find(['avatar', 'avatar_url', 'image', 'profile_image', 'photo_url', 'image_url', 'avatar_b64']),
    roleColumn: find(['role', 'user_role', 'roles', 'type', 'account_type']),
    statusColumn: find(['status', 'account_status', 'is_active', 'active', 'banned', 'state']),
    createdAtColumn: find(['created_at', 'createdat', 'registered_at', 'joined_at', 'date_joined', 'signup_date']),
    lastLoginColumn: find(['last_login', 'lastlogin', 'last_login_at', 'last_seen', 'last_active']),
    emailVerifiedColumn: find(['email_verified', 'emailverified', 'verified', 'is_verified', 'email_confirmed']),
  }
}

// Get all table names from a Turso database
export async function getTables(client: Client): Promise<string[]> {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' AND name NOT LIKE 'libsql_%' ORDER BY name"
  )
  return result.rows.map(r => String(r.name))
}

// Get column info for a table
export async function getTableColumns(client: Client, tableName: string): Promise<{ name: string; type: string }[]> {
  validateColumn(tableName)
  const result = await client.execute(`PRAGMA table_info(${tableName})`)
  return result.rows.map(r => ({
    name: String(r.name),
    type: String(r.type),
  }))
}

// Get full database overview: all tables with row counts and column info
export interface TableInfo {
  name: string
  rowCount: number
  columns: { name: string; type: string }[]
}

export async function getDatabaseOverview(client: Client): Promise<{
  tables: TableInfo[]
  totalRows: number
  pageSize: number
  pageCount: number
}> {
  const tableNames = await getTables(client)

  const tables: TableInfo[] = []
  let totalRows = 0

  for (const name of tableNames) {
    const cols = await getTableColumns(client, name)
    const countResult = await client.execute(`SELECT COUNT(*) as c FROM ${name}`)
    const rowCount = Number(countResult.rows[0]?.c ?? 0)
    totalRows += rowCount
    tables.push({ name, rowCount, columns: cols })
  }

  // Get SQLite page size and page count for storage estimate
  let pageSize = 4096
  let pageCount = 0
  try {
    const ps = await client.execute('PRAGMA page_size')
    pageSize = Number(ps.rows[0]?.page_size ?? 4096)
    const pc = await client.execute('PRAGMA page_count')
    pageCount = Number(pc.rows[0]?.page_count ?? 0)
  } catch (e) {
    // PRAGMA may not be supported on all Turso configurations
  }

  return { tables, totalRows, pageSize, pageCount }
}

// ============= CONTENT TABLE DETECTION & QUERYING =============

const SYSTEM_TABLES = new Set([
  'sessions', 'session', 'accounts', 'account',
  'verification_tokens', 'verification_token',
  'authenticators', 'authenticator',
  '_prisma_migrations', 'schema_migrations',
])

const USER_FK_CANDIDATES = ['user_id', 'author_id', 'creator_id', 'owner_id', 'posted_by', 'created_by', 'userid']
const TITLE_CANDIDATES = ['title', 'subject', 'name', 'heading', 'label']
const BODY_CANDIDATES = ['content', 'body', 'message', 'text', 'description', 'comment']
const DATE_CANDIDATES = ['created_at', 'createdat', 'posted_at', 'date', 'timestamp', 'sent_at', 'updated_at']

export interface ContentTableInfo {
  name: string
  rowCount: number
  columns: { name: string; type: string }[]
  userFkColumn: string | null
  idColumn: string
  displayColumns: {
    titleColumn: string | null
    bodyColumn: string | null
    createdAtColumn: string | null
  }
}

export async function detectContentTables(
  client: Client,
  userTable: string
): Promise<ContentTableInfo[]> {
  const tableNames = await getTables(client)
  const contentTables: ContentTableInfo[] = []

  for (const name of tableNames) {
    if (name === userTable || SYSTEM_TABLES.has(name.toLowerCase())) continue

    const cols = await getTableColumns(client, name)
    const colNames = cols.map(c => c.name.toLowerCase())

    // Skip tables with very few columns (likely junction/system tables)
    if (cols.length < 2) continue

    // Detect user FK: first try PRAGMA foreign_key_list, then heuristic
    let userFkColumn: string | null = null
    try {
      validateColumn(name)
      const fks = await client.execute(`PRAGMA foreign_key_list(${name})`)
      for (const fk of fks.rows) {
        if (String(fk.table).toLowerCase() === userTable.toLowerCase()) {
          userFkColumn = String(fk.from)
          break
        }
      }
    } catch (e) { /* ignore */ }

    if (!userFkColumn) {
      userFkColumn = colNames.find(c => USER_FK_CANDIDATES.includes(c))
        ? cols.find(c => USER_FK_CANDIDATES.includes(c.name.toLowerCase()))?.name || null
        : null
    }

    // Detect ID column (prefer 'id', fallback to first pk column)
    let idColumn = 'id'
    const idCol = cols.find(c => c.name.toLowerCase() === 'id')
    if (!idCol) {
      // Try PRAGMA to find primary key
      try {
        validateColumn(name)
        const pragmaResult = await client.execute(`PRAGMA table_info(${name})`)
        const pkCol = pragmaResult.rows.find(r => Number(r.pk) === 1)
        if (pkCol) idColumn = String(pkCol.name)
      } catch (e) { /* fallback to 'id' */ }
    }

    // Smart-pick display columns
    const find = (candidates: string[]) =>
      cols.find(c => candidates.includes(c.name.toLowerCase()))?.name || null

    const titleColumn = find(TITLE_CANDIDATES)
    const bodyColumn = find(BODY_CANDIDATES)
    const createdAtColumn = find(DATE_CANDIDATES)

    // Get row count
    const countResult = await client.execute(`SELECT COUNT(*) as c FROM ${name}`)
    const rowCount = Number(countResult.rows[0]?.c ?? 0)

    contentTables.push({
      name,
      rowCount,
      columns: cols,
      userFkColumn,
      idColumn,
      displayColumns: { titleColumn, bodyColumn, createdAtColumn },
    })
  }

  return contentTables
}

export async function queryContentTable(
  client: Client,
  tableName: string,
  options: {
    columns: string[]
    userFkColumn?: string
    userId?: string
    limit?: number
    offset?: number
    orderBy?: string
    orderDir?: 'ASC' | 'DESC'
  }
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  validateColumn(tableName)
  const { columns, userFkColumn, userId, limit = 25, offset = 0, orderBy, orderDir = 'DESC' } = options

  const selectCols = columns.map(c => validateColumn(c)).join(', ')

  let whereClause = ''
  const args: (string | number)[] = []

  if (userFkColumn && userId) {
    validateColumn(userFkColumn)
    whereClause = `WHERE ${userFkColumn} = ?`
    args.push(userId)
  }

  // Count
  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as c FROM ${tableName} ${whereClause}`,
    args,
  })
  const total = Number(countResult.rows[0]?.c ?? 0)

  // Data
  const orderColumn = orderBy ? validateColumn(orderBy) : validateColumn(columns[0])
  const direction = orderDir === 'ASC' ? 'ASC' : 'DESC'

  const dataResult = await client.execute({
    sql: `SELECT ${selectCols} FROM ${tableName} ${whereClause} ORDER BY ${orderColumn} ${direction} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })

  const rows = dataResult.rows.map(row => {
    const obj: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      obj[key] = value
    }
    return obj
  })

  return { rows, total }
}

export async function deleteContentRow(
  client: Client,
  tableName: string,
  idColumn: string,
  rowId: string
): Promise<void> {
  validateColumn(tableName)
  validateColumn(idColumn)
  await client.execute({
    sql: `DELETE FROM ${tableName} WHERE ${idColumn} = ?`,
    args: [rowId],
  })
}
