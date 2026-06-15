import type { ApiSuccessResponse, ApiErrorResponse } from '@wend/shared'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  public status: number
  public code?: string
  public details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  })

  let data
  try {
    data = await response.json()
  } catch {
    if (!response.ok) {
      throw new ApiError(response.statusText, response.status)
    }
    return {} as ApiSuccessResponse<T>
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse
    throw new ApiError(
      errorData.error.message || 'An error occurred',
      response.status,
      errorData.error.code,
      errorData.error.details
    )
  }

  return data as ApiSuccessResponse<T>
}
