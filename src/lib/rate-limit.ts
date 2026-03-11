const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(identifier: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }

  if (record.count >= limit) return false // blocked

  record.count++
  return true // allowed
}
