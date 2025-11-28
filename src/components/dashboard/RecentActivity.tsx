'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, PlatformIcon } from '@/components/ui'
import {
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit,
} from 'lucide-react'
import { Platform } from '@/types'

interface Activity {
  id: string
  type: 'campaign_started' | 'campaign_paused' | 'budget_increased' | 'milestone_reached' | 'alert' | 'campaign_created' | 'campaign_edited'
  title: string
  description: string
  platform?: Platform
  timestamp: string
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'milestone_reached',
    title: 'Meta de conversoes atingida',
    description: 'Campanha "Remarketing" alcancou 1000 conversoes',
    platform: 'meta',
    timestamp: '2024-11-20T16:00:00Z',
  },
  {
    id: '2',
    type: 'budget_increased',
    title: 'Budget aumentado automaticamente',
    description: 'Black Friday 2024 - Budget aumentado em 20%',
    platform: 'meta',
    timestamp: '2024-11-20T14:30:00Z',
  },
  {
    id: '3',
    type: 'alert',
    title: 'CPA acima do limite',
    description: 'Campanha "Google Search" com CPA de R$52,30',
    platform: 'google',
    timestamp: '2024-11-20T12:15:00Z',
  },
  {
    id: '4',
    type: 'campaign_started',
    title: 'Campanha iniciada',
    description: 'TikTok - Gen Z Campaign esta ativa',
    platform: 'tiktok',
    timestamp: '2024-11-20T10:00:00Z',
  },
  {
    id: '5',
    type: 'campaign_paused',
    title: 'Campanha pausada',
    description: 'Instagram Stories - Produto finalizado',
    platform: 'meta',
    timestamp: '2024-11-19T23:59:00Z',
  },
  {
    id: '6',
    type: 'campaign_created',
    title: 'Nova campanha criada',
    description: 'LinkedIn - B2B Lead Gen configurada',
    platform: 'linkedin',
    timestamp: '2024-11-19T14:00:00Z',
  },
]

export function RecentActivity() {
  const getActivityIcon = (type: Activity['type']) => {
    const iconStyle = { width: '14px', height: '14px' }
    const icons = {
      campaign_started: <Play style={{ ...iconStyle, color: '#3B82F6' }} />,
      campaign_paused: <Pause style={{ ...iconStyle, color: '#FACC15' }} />,
      budget_increased: <DollarSign style={{ ...iconStyle, color: '#60A5FA' }} />,
      milestone_reached: <CheckCircle style={{ ...iconStyle, color: '#3B82F6' }} />,
      alert: <AlertTriangle style={{ ...iconStyle, color: '#EF4444' }} />,
      campaign_created: <TrendingUp style={{ ...iconStyle, color: '#FACC15' }} />,
      campaign_edited: <Edit style={{ ...iconStyle, color: '#A0A0B0' }} />,
    }
    return icons[type]
  }

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      campaign_started: { border: 'rgba(59, 130, 246, 0.3)', bg: 'rgba(59, 130, 246, 0.05)' },
      campaign_paused: { border: 'rgba(250, 204, 21, 0.3)', bg: 'rgba(250, 204, 21, 0.05)' },
      budget_increased: { border: 'rgba(96, 165, 250, 0.3)', bg: 'rgba(96, 165, 250, 0.05)' },
      milestone_reached: { border: 'rgba(59, 130, 246, 0.3)', bg: 'rgba(59, 130, 246, 0.05)' },
      alert: { border: 'rgba(239, 68, 68, 0.3)', bg: 'rgba(239, 68, 68, 0.05)' },
      campaign_created: { border: 'rgba(250, 204, 21, 0.3)', bg: 'rgba(250, 204, 21, 0.05)' },
      campaign_edited: { border: 'rgba(255, 255, 255, 0.2)', bg: 'rgba(255, 255, 255, 0.05)' },
    }
    return colors[type]
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m atras`
    if (diffHours < 24) return `${diffHours}h atras`
    if (diffDays < 7) return `${diffDays}d atras`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <button style={{ fontSize: '12px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
          Ver tudo
        </button>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activities.map((activity, index) => {
            const colors = getActivityColor(activity.type)
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.bg,
                    flexShrink: 0,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {activity.title}
                    </p>
                    {activity.platform && (
                      <PlatformIcon platform={activity.platform} size={16} />
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activity.description}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#6B6B7B',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                  }}
                >
                  {formatTimestamp(activity.timestamp)}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* View All Link */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              color: '#3B82F6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Ver todas as atividades
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
