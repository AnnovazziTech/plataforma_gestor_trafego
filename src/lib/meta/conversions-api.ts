import { createHash, randomUUID } from 'crypto'

// --- Types ---

export interface MetaUserData {
  em?: string   // email (will be hashed)
  ph?: string   // phone (will be hashed)
  fn?: string   // first name (will be hashed)
  ln?: string   // last name (will be hashed)
  client_ip_address?: string
  client_user_agent?: string
  fbc?: string  // click ID cookie
  fbp?: string  // browser ID cookie
}

export interface MetaCustomData {
  currency?: string
  value?: number
  content_name?: string
  content_ids?: string[]
  content_type?: string
  order_id?: string
}

export interface MetaEventData {
  event_name: string
  event_time?: number
  event_id?: string
  event_source_url?: string
  action_source?: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'other'
  user_data: MetaUserData
  custom_data?: MetaCustomData
}

// --- Helpers ---

export function hashUserData(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return createHash('sha256').update(normalized).digest('hex')
}

export function generateEventId(): string {
  return randomUUID()
}

// --- Send Event ---

const PIXEL_ID = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE

export async function sendConversionEvent(event: MetaEventData): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[Meta CAPI] META_PIXEL_ID or META_CONVERSIONS_API_TOKEN not configured, skipping event')
    return
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.event_name,
        event_time: event.event_time ?? Math.floor(Date.now() / 1000),
        event_id: event.event_id ?? generateEventId(),
        event_source_url: event.event_source_url,
        action_source: event.action_source ?? 'website',
        user_data: {
          em: event.user_data.em ? hashUserData(event.user_data.em) : undefined,
          ph: event.user_data.ph ? hashUserData(event.user_data.ph) : undefined,
          fn: event.user_data.fn ? hashUserData(event.user_data.fn) : undefined,
          ln: event.user_data.ln ? hashUserData(event.user_data.ln) : undefined,
          client_ip_address: event.user_data.client_ip_address,
          client_user_agent: event.user_data.client_user_agent,
          fbc: event.user_data.fbc,
          fbp: event.user_data.fbp,
        },
        custom_data: event.custom_data,
      },
    ],
    access_token: ACCESS_TOKEN,
  }

  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE
  }

  // Fire-and-forget: don't await in the caller
  fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.text()
      }
    })
    .catch((err) => {
    })
}

// --- Request Helpers ---

export function extractClientIp(request: Request): string | undefined {
  const headers = request.headers
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    undefined
  )
}

export function extractUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}
