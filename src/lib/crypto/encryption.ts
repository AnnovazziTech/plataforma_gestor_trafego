// Sistema de Criptografia AES-256-GCM
// Para armazenar tokens de API de forma segura

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment variables')
  }
  // A chave deve ter 64 caracteres hex (32 bytes)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Criptografa um texto usando AES-256-GCM
 * Retorna: iv:authTag:ciphertext (tudo em base64)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Formato: iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Descriptografa um texto criptografado com encrypt()
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey()

  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const [ivBase64, authTagBase64, ciphertext] = parts
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Gera um hash seguro (para API keys, etc)
 */
export function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')
}

/**
 * Gera uma API key aleatoria
 * Formato: tp_live_xxxxx ou tp_test_xxxxx
 */
export function generateApiKey(isTest: boolean = false): { key: string; prefix: string; hash: string } {
  const prefix = isTest ? 'tp_test_' : 'tp_live_'
  const randomPart = crypto.randomBytes(24).toString('base64url')
  const key = `${prefix}${randomPart}`

  return {
    key,
    prefix: key.substring(0, 12), // Para identificacao visual
    hash: hashApiKey(key),
  }
}

/**
 * Gera um secret para webhooks
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('base64url')}`
}

/**
 * Valida assinatura de webhook HMAC
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Gera um token de verificacao de email
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Gera um token de reset de senha
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
