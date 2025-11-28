'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Globe,
  Share2,
  Image,
  Calendar,
  Plus,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Clock,
  Edit,
  Trash2,
  X,
  Upload,
  Video,
  Layout,
  Film,
} from 'lucide-react'

interface ScheduledPost {
  id: string
  name: string
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter'
  date: string
  time: string
  format: 'feed' | 'story' | 'reels'
  text: string
  media?: string
  status: 'scheduled' | 'published' | 'failed'
}

const mockPosts: ScheduledPost[] = [
  { id: '1', name: 'Lançamento Produto', platform: 'instagram', date: '2024-02-20', time: '10:00', format: 'feed', text: 'Novidade chegando! 🚀', status: 'scheduled' },
  { id: '2', name: 'Dica do Dia', platform: 'facebook', date: '2024-02-21', time: '14:30', format: 'feed', text: 'Dica importante para seu negócio...', status: 'scheduled' },
  { id: '3', name: 'Bastidores', platform: 'instagram', date: '2024-02-19', time: '18:00', format: 'story', text: 'Por trás das câmeras 📸', status: 'published' },
]

const socialMetrics = {
  totalFollowers: 125000,
  engagement: 4.8,
  reach: 450000,
  posts: 156,
}

export default function SocialPage() {
  const { showToast } = useApp()
  const [activeTab, setActiveTab] = useState<'site' | 'social' | 'post' | 'schedule'>('site')
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(mockPosts)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [siteUrl, setSiteUrl] = useState('')
  const [socialHandle, setSocialHandle] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyzeSite = () => {
    if (!siteUrl) {
      showToast('Digite uma URL para analisar', 'error')
      return
    }
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      showToast('Análise concluída!', 'success')
    }, 3000)
  }

  const handleAnalyzeSocial = () => {
    if (!socialHandle) {
      showToast('Digite um @ para analisar', 'error')
      return
    }
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      showToast('Análise concluída!', 'success')
    }, 3000)
  }

  const tabs = [
    { id: 'site', label: 'Análise de Site', icon: Globe },
    { id: 'social', label: 'Análise de Redes', icon: Share2 },
    { id: 'post', label: 'Análise de Post', icon: Image },
    { id: 'schedule', label: 'Agendamento', icon: Calendar },
  ]

  const platformIcons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Redes Sociais"
        subtitle="Análise de sites, redes sociais e agendamento de posts"
        showCreateButton={false}
      />

      <main className="p-6 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Seguidores Totais"
            value={`${(socialMetrics.totalFollowers / 1000).toFixed(0)}K`}
            icon={Users}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Engajamento"
            value={`${socialMetrics.engagement}%`}
            icon={Heart}
            color="yellow"
            delay={0.1}
          />
          <StatCard
            label="Alcance Mensal"
            value={`${(socialMetrics.reach / 1000).toFixed(0)}K`}
            icon={Eye}
            color="blue"
            delay={0.2}
          />
          <StatCard
            label="Posts Agendados"
            value={scheduledPosts.filter(p => p.status === 'scheduled').length}
            icon={Calendar}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'bg-white/5 text-[#A0A0B0] border border-white/10 hover:border-white/20'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'site' && (
            <motion.div
              key="site"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-6 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[#3B82F6]/10">
                    <Globe size={24} className="text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Análise de Site</h2>
                    <p className="text-sm text-[#6B6B7B]">Analise o tráfego e performance de qualquer site</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://exemplo.com.br"
                    className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                  />
                  <Button variant="primary" className="gap-2 px-6" onClick={handleAnalyzeSite} disabled={analyzing}>
                    {analyzing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                    Analisar
                  </Button>
                </div>

                {/* Resultado da Análise */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Tráfego Mensal', value: '125K', trend: '+12%' },
                    { label: 'Tempo no Site', value: '2:45', trend: '+5%' },
                    { label: 'Taxa de Rejeição', value: '42%', trend: '-8%' },
                    { label: 'Páginas/Sessão', value: '3.2', trend: '+15%' },
                  ].map((metric, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-[#6B6B7B] mb-1">{metric.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                        <span className={`text-xs font-medium ${metric.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-white mb-3">Fontes de Tráfego</h4>
                  <div className="space-y-2">
                    {[
                      { source: 'Busca Orgânica', value: 45, color: '#3B82F6' },
                      { source: 'Redes Sociais', value: 25, color: '#FACC15' },
                      { source: 'Direto', value: 20, color: '#8B5CF6' },
                      { source: 'Referência', value: 10, color: '#22C55E' },
                    ].map((item) => (
                      <div key={item.source} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-[#A0A0B0] flex-1">{item.source}</span>
                        <span className="text-sm font-medium text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-6 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[#FACC15]/10">
                    <Share2 size={24} className="text-[#FACC15]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Análise de Redes Sociais</h2>
                    <p className="text-sm text-[#6B6B7B]">Monitore a performance de qualquer perfil</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder="@usuario ou nome da página"
                    className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                  />
                  <Button variant="primary" className="gap-2 px-6" onClick={handleAnalyzeSocial} disabled={analyzing}>
                    {analyzing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                    Analisar
                  </Button>
                </div>

                {/* Métricas por Plataforma */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { platform: 'Instagram', icon: Instagram, followers: '45K', engagement: '5.2%', color: '#E4405F' },
                    { platform: 'Facebook', icon: Facebook, followers: '32K', engagement: '3.8%', color: '#1877F2' },
                    { platform: 'LinkedIn', icon: Linkedin, followers: '28K', engagement: '4.5%', color: '#0A66C2' },
                    { platform: 'Twitter', icon: Twitter, followers: '20K', engagement: '2.9%', color: '#1DA1F2' },
                  ].map((item) => (
                    <div
                      key={item.platform}
                      className="p-4 rounded-xl border transition-all hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}30` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <item.icon size={20} style={{ color: item.color }} />
                        <span className="text-sm font-medium text-white">{item.platform}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6B6B7B]">Seguidores</span>
                          <span className="text-sm font-semibold text-white">{item.followers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6B6B7B]">Engajamento</span>
                          <span className="text-sm font-semibold" style={{ color: item.color }}>{item.engagement}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'post' && (
            <motion.div
              key="post"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="p-6 rounded-2xl bg-[#12121A]/80 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[#8B5CF6]/10">
                    <Image size={24} className="text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Análise de Post</h2>
                    <p className="text-sm text-[#6B6B7B]">Analise a performance de posts específicos</p>
                  </div>
                </div>

                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Upload size={32} className="text-[#6B6B7B]" />
                  </div>
                  <p className="text-sm text-[#6B6B7B] mb-2">Cole o link do post ou faça upload da imagem</p>
                  <p className="text-xs text-[#4B4B5B] mb-6">Suportamos Instagram, Facebook, LinkedIn e Twitter</p>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="text"
                      placeholder="Cole o link do post aqui..."
                      className="w-96 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                    />
                    <Button variant="primary" className="gap-2">
                      <BarChart3 size={16} />
                      Analisar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Agendamento de Posts</h2>
                <Button variant="primary" className="gap-2" onClick={() => setShowScheduleModal(true)}>
                  <Plus size={16} />
                  Nova Programação
                </Button>
              </div>

              <div className="space-y-4">
                {scheduledPosts.map((post) => {
                  const PlatformIcon = platformIcons[post.platform]
                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            post.platform === 'instagram' ? 'bg-[#E4405F]/10' :
                            post.platform === 'facebook' ? 'bg-[#1877F2]/10' :
                            post.platform === 'linkedin' ? 'bg-[#0A66C2]/10' :
                            'bg-[#1DA1F2]/10'
                          }`}>
                            <PlatformIcon size={20} className={
                              post.platform === 'instagram' ? 'text-[#E4405F]' :
                              post.platform === 'facebook' ? 'text-[#1877F2]' :
                              post.platform === 'linkedin' ? 'text-[#0A66C2]' :
                              'text-[#1DA1F2]'
                            } />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{post.name}</h3>
                            <p className="text-sm text-[#6B6B7B] mt-1">{post.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-[#6B6B7B]">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(post.date).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {post.time}
                              </span>
                              <span className="flex items-center gap-1 capitalize">
                                {post.format === 'feed' && <Layout size={12} />}
                                {post.format === 'story' && <Image size={12} />}
                                {post.format === 'reels' && <Film size={12} />}
                                {post.format}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={post.status === 'scheduled' ? 'warning' : post.status === 'published' ? 'success' : 'error'}>
                            {post.status === 'scheduled' ? 'Agendado' : post.status === 'published' ? 'Publicado' : 'Falhou'}
                          </Badge>
                          <button className="p-2 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all">
                            <Edit size={14} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {scheduledPosts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-[#6B6B7B]" />
                    </div>
                    <p className="text-sm text-[#6B6B7B] mb-2">Nenhum post agendado</p>
                    <p className="text-xs text-[#4B4B5B]">Crie sua primeira programação de post</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Agendamento */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#3B82F6]/10">
                    <Calendar className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Agendar Post</h2>
                    <p className="text-sm text-[#6B6B7B]">Programe suas postagens</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-lg text-[#6B6B7B] hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome da Programação</label>
                  <input
                    type="text"
                    placeholder="Ex: Post de Lançamento"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Plataforma</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['instagram', 'facebook', 'linkedin', 'twitter'].map((platform) => {
                      const Icon = platformIcons[platform]
                      return (
                        <button
                          key={platform}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 transition-all flex flex-col items-center gap-1"
                        >
                          <Icon size={20} className="text-[#6B6B7B]" />
                          <span className="text-xs text-[#6B6B7B] capitalize">{platform}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Data</label>
                    <input
                      type="date"
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Horário</label>
                    <input
                      type="time"
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Formato</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'feed', label: 'Feed', icon: Layout },
                      { id: 'story', label: 'Story', icon: Image },
                      { id: 'reels', label: 'Reels', icon: Film },
                    ].map((format) => (
                      <button
                        key={format.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 transition-all flex items-center justify-center gap-2"
                      >
                        <format.icon size={16} className="text-[#6B6B7B]" />
                        <span className="text-sm text-[#6B6B7B]">{format.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Mídia</label>
                  <div className="p-8 rounded-xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-[#3B82F6]/30 transition-all">
                    <Upload size={24} className="mx-auto text-[#6B6B7B] mb-2" />
                    <p className="text-sm text-[#6B6B7B]">Arraste ou clique para upload</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Texto do Post</label>
                  <textarea
                    rows={3}
                    placeholder="Digite o texto da sua postagem..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancelar</Button>
                <Button variant="primary" className="gap-2" onClick={() => {
                  showToast('Post agendado com sucesso!', 'success')
                  setShowScheduleModal(false)
                }}>
                  <Calendar size={16} />
                  Agendar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
