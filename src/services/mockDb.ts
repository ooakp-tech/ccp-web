/**
 * MOCK ONLY - a pretend user table kept in sessionStorage so the flow survives
 * a page refresh while there is no backend. Delete this file once
 * src/services/api.ts talks to the real ASP.NET Core API.
 *
 * Nothing here is secure: the "hash" below is a plain checksum that only
 * keeps the typed password out of storage. Real hashing belongs on the server.
 */
import type { AccountRole } from '../types'

const STORAGE_KEY = 'velvetfx.mock.users'

export interface MockUserRecord {
  email: string
  passwordChecksum: string
  /** Missing on records saved before creators existed: fan. */
  role?: AccountRole
  verified: boolean
  verificationToken: string
  verificationSentAt: string
  marketingOptIn: boolean
}

function readAll(): Record<string, MockUserRecord> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeAll(users: Record<string, MockUserRecord>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch {
    // Storage unavailable (private mode / quota): the mock simply won't persist.
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function checksum(value: string): string {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(16)
}

export function newToken(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

export function findUser(email: string): MockUserRecord | undefined {
  return readAll()[normalizeEmail(email)]
}

export function findUserByToken(token: string): MockUserRecord | undefined {
  return Object.values(readAll()).find((user) => user.verificationToken === token)
}

export function saveUser(user: MockUserRecord): void {
  const users = readAll()
  users[normalizeEmail(user.email)] = user
  writeAll(users)
}

export function deleteUser(email: string): void {
  const users = readAll()
  delete users[normalizeEmail(email)]
  writeAll(users)
}
