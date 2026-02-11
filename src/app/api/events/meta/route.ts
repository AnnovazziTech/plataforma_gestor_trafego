import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  sendConversionEvent,
  extractClientIp,
  extractUserAgent,
  generateEventId,
} from '@/lib/meta/conversions-api'

const metaEventSchema = z.object({
  event_name: z.string().min(1).max(100),
  event_id: z.string().max(100).optional(),
  event_source_url: z.string().url().max(1000).optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
  user_data: z.object({
    em: z.string().optional(),
    ph: z.string().optional(),
    fn: z.string().optional(),
    ln: z.string().optional(),
    client_ip_address: z.string().optional(),
    client_user_agent: z.string().optional(),
    fbc: z.string().optional(),
    fbp: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar com Zod schema
    const validated = metaEventSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    const { event_name, event_id, event_source_url, custom_data, user_data } = validated.data

    const clientIp = extractClientIp(request)
    const userAgent = extractUserAgent(request)

    sendConversionEvent({
      event_name,
      event_id: event_id || generateEventId(),
      event_source_url,
      user_data: {
        ...user_data,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      },
      custom_data,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
