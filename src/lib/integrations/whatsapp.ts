// WhatsApp Business API Integration
// Suporta tanto Evolution API quanto WhatsApp Cloud API oficial

interface WhatsAppConfig {
  type: 'evolution' | 'cloud'
  baseUrl?: string // Para Evolution API
  apiKey?: string // Para Evolution API
  phoneNumberId?: string // Para Cloud API
  accessToken?: string // Para Cloud API
}

interface WhatsAppMessage {
  id: string
  from: string
  to: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
  content: string
  mediaUrl?: string
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read' | 'failed'
}

interface WhatsAppContact {
  phone: string
  name?: string
  profilePicture?: string
}

// ============================================
// EVOLUTION API
// ============================================

/**
 * Enviar mensagem de texto via Evolution API
 */
export async function sendEvolutionMessage(
  instanceName: string,
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          number: formatPhoneNumber(to),
          textMessage: { text: message },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message || 'Erro ao enviar mensagem' }
    }

    const data = await response.json()
    return { success: true, messageId: data.key?.id }
  } catch (error) {
    return { success: false, error: 'Erro de conexao com Evolution API' }
  }
}

/**
 * Enviar midia via Evolution API
 */
export async function sendEvolutionMedia(
  instanceName: string,
  to: string,
  type: 'image' | 'video' | 'audio' | 'document',
  mediaUrl: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const endpoint = type === 'document' ? 'sendDocument' : `sendMedia`

    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/${endpoint}/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          number: formatPhoneNumber(to),
          mediaMessage: {
            mediatype: type,
            media: mediaUrl,
            caption,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message }
    }

    const data = await response.json()
    return { success: true, messageId: data.key?.id }
  } catch (error) {
    return { success: false, error: 'Erro de conexao' }
  }
}

/**
 * Criar instancia no Evolution API
 */
export async function createEvolutionInstance(
  instanceName: string
): Promise<{ success: boolean; qrCode?: string; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message }
    }

    return { success: true, qrCode: data.qrcode?.base64 }
  } catch (error) {
    return { success: false, error: 'Erro ao criar instancia' }
  }
}

/**
 * Verificar status da instancia Evolution
 */
export async function getEvolutionInstanceStatus(
  instanceName: string
): Promise<{ connected: boolean; phone?: string; name?: string }> {
  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
      {
        headers: { apikey: process.env.EVOLUTION_API_KEY! },
      }
    )

    const data = await response.json()

    return {
      connected: data.state === 'open',
      phone: data.instance?.wuid?.replace('@s.whatsapp.net', ''),
      name: data.instance?.profileName,
    }
  } catch {
    return { connected: false }
  }
}

/**
 * Buscar mensagens recentes de um contato via Evolution
 */
export async function getEvolutionMessages(
  instanceName: string,
  contactPhone: string,
  limit: number = 50
): Promise<WhatsAppMessage[]> {
  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/chat/findMessages/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          where: {
            key: {
              remoteJid: formatPhoneNumber(contactPhone) + '@s.whatsapp.net',
            },
          },
          limit,
        }),
      }
    )

    const data = await response.json()

    return (data.messages || []).map((msg: any) => ({
      id: msg.key.id,
      from: msg.key.fromMe ? 'me' : msg.key.remoteJid.replace('@s.whatsapp.net', ''),
      to: msg.key.fromMe ? msg.key.remoteJid.replace('@s.whatsapp.net', '') : 'me',
      type: getMessageType(msg.message),
      content: getMessageContent(msg.message),
      mediaUrl: msg.message?.imageMessage?.url || msg.message?.videoMessage?.url,
      timestamp: new Date(msg.messageTimestamp * 1000),
      status: msg.status,
    }))
  } catch {
    return []
  }
}

// ============================================
// WHATSAPP CLOUD API (Oficial)
// ============================================

const WHATSAPP_CLOUD_URL = 'https://graph.facebook.com/v18.0'

/**
 * Enviar mensagem de texto via Cloud API
 */
export async function sendCloudMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${WHATSAPP_CLOUD_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formatPhoneNumber(to),
          type: 'text',
          text: { body: message },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    return { success: false, error: 'Erro de conexao com WhatsApp Cloud API' }
  }
}

/**
 * Enviar template de mensagem via Cloud API
 */
export async function sendCloudTemplate(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  languageCode: string = 'pt_BR',
  components?: any[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${WHATSAPP_CLOUD_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formatPhoneNumber(to),
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    return { success: false, error: 'Erro ao enviar template' }
  }
}

/**
 * Enviar midia via Cloud API
 */
export async function sendCloudMedia(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  type: 'image' | 'video' | 'audio' | 'document',
  mediaUrl: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mediaPayload: any = { link: mediaUrl }
    if (caption && (type === 'image' || type === 'video' || type === 'document')) {
      mediaPayload.caption = caption
    }

    const response = await fetch(
      `${WHATSAPP_CLOUD_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formatPhoneNumber(to),
          type,
          [type]: mediaPayload,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    return { success: false, error: 'Erro ao enviar midia' }
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Formatar numero de telefone para padrao internacional
 */
export function formatPhoneNumber(phone: string): string {
  // Remover caracteres especiais
  let cleaned = phone.replace(/\D/g, '')

  // Se comecar com 0, remover
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  // Se nao comecar com codigo do pais, adicionar 55 (Brasil)
  if (!cleaned.startsWith('55') && cleaned.length <= 11) {
    cleaned = '55' + cleaned
  }

  return cleaned
}

/**
 * Extrair tipo de mensagem do objeto
 */
function getMessageType(message: any): WhatsAppMessage['type'] {
  if (message?.conversation || message?.extendedTextMessage) return 'text'
  if (message?.imageMessage) return 'image'
  if (message?.videoMessage) return 'video'
  if (message?.audioMessage) return 'audio'
  if (message?.documentMessage) return 'document'
  if (message?.locationMessage) return 'location'
  if (message?.contactMessage) return 'contact'
  return 'text'
}

/**
 * Extrair conteudo da mensagem
 */
function getMessageContent(message: any): string {
  if (message?.conversation) return message.conversation
  if (message?.extendedTextMessage?.text) return message.extendedTextMessage.text
  if (message?.imageMessage?.caption) return message.imageMessage.caption
  if (message?.videoMessage?.caption) return message.videoMessage.caption
  if (message?.documentMessage?.caption) return message.documentMessage.caption
  if (message?.locationMessage) {
    return `Localizacao: ${message.locationMessage.degreesLatitude}, ${message.locationMessage.degreesLongitude}`
  }
  return ''
}

/**
 * Processar webhook do WhatsApp (ambas APIs)
 */
export function parseWhatsAppWebhook(body: any): {
  type: 'message' | 'status' | 'unknown'
  data: any
} {
  // Evolution API webhook
  if (body.event) {
    if (body.event === 'messages.upsert') {
      return { type: 'message', data: body.data }
    }
    if (body.event === 'messages.update') {
      return { type: 'status', data: body.data }
    }
  }

  // WhatsApp Cloud API webhook
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    return {
      type: 'message',
      data: body.entry[0].changes[0].value,
    }
  }

  if (body.entry?.[0]?.changes?.[0]?.value?.statuses) {
    return {
      type: 'status',
      data: body.entry[0].changes[0].value.statuses,
    }
  }

  return { type: 'unknown', data: body }
}
