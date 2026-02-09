import { NextRequest, NextResponse } from 'next/server'
import {
  sendConversionEvent,
  extractClientIp,
  extractUserAgent,
  generateEventId,
} from '@/lib/meta/conversions-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, event_id, event_source_url, custom_data, user_data } = body

    if (!event_name) {
      return NextResponse.json({ error: 'event_name is required' }, { status: 400 })
    }

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
