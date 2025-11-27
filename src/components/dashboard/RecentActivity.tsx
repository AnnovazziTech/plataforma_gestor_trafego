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
  Trash,
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
    title: 'Meta de conversões atingida',
    description: 'Campanha "Remarketing" alcançou 1000 conversões',
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
    description: 'TikTok - Gen Z Campaign está ativa',
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
    const icons = {
      campaign_started: <Play size={14} className="text-[#3B82F6]" />,
      campaign_paused: <Pause size={14} className="text-[#FACC15]" />,
      budget_increased: <DollarSign size={14} className="text-[#60A5FA]" />,
      milestone_reached: <CheckCircle size={14} className="text-[#3B82F6]" />,
      alert: <AlertTriangle size={14} className="text-red-400" />,
      campaign_created: <TrendingUp size={14} className="text-[#FACC15]" />,
      campaign_edited: <Edit size={14} className="text-[#A0A0B0]" />,
    }
    return icons[type]
  }

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      campaign_started: 'border-[#3B82F6]/30 bg-[#3B82F6]/5',
      campaign_paused: 'border-[#FACC15]/30 bg-[#FACC15]/5',
      budget_increased: 'border-[#60A5FA]/30 bg-[#60A5FA]/5',
      milestone_reached: 'border-[#3B82F6]/30 bg-[#3B82F6]/5',
      alert: 'border-red-500/30 bg-red-500/5',
      campaign_created: 'border-[#FACC15]/30 bg-[#FACC15]/5',
      campaign_edited: 'border-white/20 bg-white/5',
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

    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <button className="text-xs text-[#3B82F6] hover:underline">Ver tudo</button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <div className={`p-2.5 rounded-xl border flex-shrink-0 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm font-medium text-white truncate flex-1">{activity.title}</p>
                  {activity.platform && (
                    <PlatformIcon platform={activity.platform} size={16} className="flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[#6B6B7B] truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-[#6B6B7B] whitespace-nowrap flex-shrink-0 bg-white/5 px-2 py-1 rounded-lg">
                {formatTimestamp(activity.timestamp)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="w-full py-2 text-sm text-[#3B82F6] hover:text-[#3B82F6]/80 transition-colors">
            Ver todas as atividades
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
