/**
 * Centralized fetch utility for client-side API calls.
 */
export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<{ data?: T; error?: { code: string; message: string } }> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const json = await res.json()

  if (!res.ok) {
    return { error: json.error || { code: 'UNKNOWN', message: 'Request failed' } }
  }

  return { data: json.data ?? json }
}
