// Rate Limiter in-memory para endpoints publicos
// Usa sliding window counter por IP

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Limpar entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximo de requests permitidos na janela */
  maxRequests: number
  /** Janela de tempo em segundos */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Verifica rate limit por chave (geralmente IP)
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // Nova janela
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Extrai IP do request (x-forwarded-for ou x-real-ip)
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

// Configs pre-definidas
export const RATE_LIMITS = {
  /** Register: 5 tentativas por minuto por IP */
  register: { maxRequests: 5, windowSeconds: 60 },
  /** Password change: 5 tentativas por minuto por IP */
  password: { maxRequests: 5, windowSeconds: 60 },
  /** Webhooks: 100 requests por minuto por IP */
  webhook: { maxRequests: 100, windowSeconds: 60 },
  /** Login: 10 tentativas por minuto por IP */
  login: { maxRequests: 10, windowSeconds: 60 },
} as const
