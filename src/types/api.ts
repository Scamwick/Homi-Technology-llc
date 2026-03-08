export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean>
}

// Common API error codes
export const API_ERROR_CODES = {
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  RATE_LIMITED: 'rate_limited',
  INTERNAL_ERROR: 'internal_error',
  SUBSCRIPTION_REQUIRED: 'subscription_required',
} as const

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const
