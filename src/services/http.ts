/**
 * Thin fetch wrapper for the ModelFeed ASP.NET Core API.
 *
 * Every endpoint answers with the same envelope (BaseResponse<T>):
 *   200 { success: true,  data: T }
 *   400 { success: false, errors: [{ code, message }] }
 * Errors are turned into ApiError so the screens can show `message` as-is.
 */
import { API_BASE_URL } from '../config'

export interface ApiEnvelope<T> {
  success: boolean
  data?: T
  errors?: { code?: string | null; message: string }[]
}

export class HttpError extends Error {
  /** HTTP status, 0 when the request never reached the server. */
  readonly status: number
  /** `code` of each server error, e.g. "Username/Password", "User.Login". */
  readonly codes: string[]

  constructor(status: number, message: string, codes: string[] = []) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.codes = codes
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** JWT from TokenResponse.accessToken, for [Authorize] endpoints. */
  token?: string
}

export async function apiRequest<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new HttpError(0, 'We could not reach VELVET FX. Check your connection and try again.')
  }

  if (response.status === 401 || response.status === 403) {
    throw new HttpError(response.status, 'Your session has expired. Please sign in again.')
  }

  let envelope: ApiEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    // Not JSON: IIS error page, proxy error, etc.
  }

  if (!envelope) {
    throw new HttpError(response.status, 'Something went wrong on our side. Please try again.')
  }
  if (!response.ok || !envelope.success) {
    const errors = envelope.errors ?? []
    const message = errors.map((error) => error.message).find(Boolean) ?? 'Something went wrong. Please try again.'
    throw new HttpError(response.status, message, errors.map((error) => error.code ?? ''))
  }
  return envelope.data as T
}
