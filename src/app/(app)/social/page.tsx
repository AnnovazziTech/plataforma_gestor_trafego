'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Globe,
  Share2,
  Image,
  Calendar,
  Plus,
  Search,
  BarChart3,
  Users,
  Eye,
  Heart,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Clock,
  Edit,
  Trash2,
  X,
  Upload,
  Layout,
  Film,
  MessageCircle,
  Bot,
  ExternalLink,
  GitCompare,
  ChevronDown,
  TrendingUp,
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

// Posts are now fetched from API

const socialMetrics = {
  totalFollowers: 125000,
  engagement: 4.8,
  reach: 450000,
  posts: 156,
}

export default function SocialPage() {
  const { showToast, setIsConnectAccountsModalOpen } = useApp()
  const [activeTab, setActiveTab] = useState<'site' | 'social' | 'post' | 'schedule' | 'comments'>('site')
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [postStats, setPostStats] = useState({ total: 0, scheduled: 0, published: 0, failed: 0 })

  // Form state
  const [newPost, setNewPost] = useState({
    name: '',
    platform: 'instagram' as 'instagram' | 'facebook' | 'linkedin' | 'twitter',
    date: '',
    time: '',
    format: 'feed' as 'feed' | 'story' | 'reels',
    text: '',
  })

  // Fetch scheduled posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/scheduled-posts')
      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(data.posts || [])
        setPostStats(data.stats || { total: 0, scheduled: 0, published: 0, failed: 0 })
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Create new scheduled post
  const handleCreatePost = async () => {
    if (!newPost.name.trim()) {
      showToast('Digite o nome da programação', 'error')
      return
    }
    if (!newPost.date) {
      showToast('Selecione uma data', 'error')
      return
    }
    if (!newPost.time) {
      showToast('Selecione um horário', 'error')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPost.name,
          platform: newPost.platform.toUpperCase(),
          date: newPost.date,
          time: newPost.time,
          format: newPost.format.toUpperCase(),
          text: newPost.text,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(prev => [data.post, ...prev])
        setShowScheduleModal(false)
        setNewPost({ name: '', platform: 'instagram', date: '', time: '', format: 'feed', text: '' })
        showToast('Post agendado com sucesso!', 'success')
        fetchPosts() // Refresh to get updated stats
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao agendar post', 'error')
      }
    } catch (error) {
      console.error('Erro ao criar post:', error)
      showToast('Erro ao agendar post', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete scheduled post
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setScheduledPosts(prev => prev.filter(p => p.id !== postId))
        showToast('Post removido com sucesso', 'success')
        fetchPosts() // Refresh stats
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao remover post', 'error')
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      showToast('Erro ao remover post', 'error')
    }
  }
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
    { id: 'comments', label: 'Comentários', icon: MessageCircle },
  ]

  const platformIcons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Redes Sociais"
        subtitle="Análise de sites, redes sociais e agendamento de posts"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
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
            value={postStats.scheduled}
            icon={Calendar}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                border: activeTab === tab.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab.id ? '#3B82F6' : '#A0A0B0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
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
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Globe size={24} style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Análise de Site</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Analise o tráfego e performance de qualquer site</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://exemplo.com.br"
                    style={{
                      flex: 1,
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                  <Button variant="primary" onClick={handleAnalyzeSite}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {analyzing ? (
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Search size={18} />
                      )}
                      Analisar
                    </span>
                  </Button>
                </div>

                {/* Resultado da Análise */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Tráfego Mensal', value: '125K', trend: '+12%' },
                    { label: 'Tempo no Site', value: '2:45', trend: '+5%' },
                    { label: 'Taxa de Rejeição', value: '42%', trend: '-8%' },
                    { label: 'Páginas/Sessão', value: '3.2', trend: '+15%' },
                  ].map((metric, idx) => (
                    <div key={idx} style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '4px' }}>{metric.label}</p>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{metric.value}</p>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: metric.trend.startsWith('+') ? '#10B981' : '#EF4444' }}>
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>Fontes de Tráfego</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { source: 'Busca Orgânica', value: 45, color: '#3B82F6' },
                      { source: 'Redes Sociais', value: 25, color: '#FACC15' },
                      { source: 'Direto', value: 20, color: '#8B5CF6' },
                      { source: 'Referência', value: 10, color: '#22C55E' },
                    ].map((item) => (
                      <div key={item.source} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                        <span style={{ fontSize: '14px', color: '#A0A0B0', flex: 1 }}>{item.source}</span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{item.value}%</span>
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
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
                    <Share2 size={24} style={{ color: '#FACC15' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Análise de Redes Sociais</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Monitore a performance de qualquer perfil</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder="@usuario ou nome da página"
                    style={{
                      flex: 1,
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                  <Button variant="primary" onClick={handleAnalyzeSocial}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {analyzing ? (
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Search size={18} />
                      )}
                      Analisar
                    </span>
                  </Button>
                </div>

                {/* Métricas por Plataforma */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {[
                    { platform: 'Instagram', icon: Instagram, followers: '45K', engagement: '5.2%', color: '#E4405F' },
                    { platform: 'Facebook', icon: Facebook, followers: '32K', engagement: '3.8%', color: '#1877F2' },
                    { platform: 'LinkedIn', icon: Linkedin, followers: '28K', engagement: '4.5%', color: '#0A66C2' },
                    { platform: 'Twitter', icon: Twitter, followers: '20K', engagement: '2.9%', color: '#1DA1F2' },
                  ].map((item) => (
                    <div
                      key={item.platform}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `1px solid ${item.color}30`,
                        backgroundColor: `${item.color}10`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <item.icon size={20} style={{ color: item.color }} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{item.platform}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Seguidores</span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{item.followers}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Engajamento</span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: item.color }}>{item.engagement}</span>
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
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Image size={24} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Análise de Post</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Analise a performance de posts específicos</p>
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 16px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Upload size={32} style={{ color: '#6B6B7B' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Cole o link do post ou faça upload da imagem</p>
                  <p style={{ fontSize: '12px', color: '#4B4B5B', marginBottom: '24px' }}>Suportamos Instagram, Facebook, LinkedIn e Twitter</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Cole o link do post aqui..."
                      style={{
                        width: '384px',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                      }}
                    />
                    <Button variant="primary">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={16} />
                        Analisar
                      </span>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Agendamento de Posts</h2>
                <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} />
                    Nova Programação
                  </span>
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {scheduledPosts.map((post) => {
                  const PlatformIcon = platformIcons[post.platform]
                  const platformColors: Record<string, string> = {
                    instagram: '#E4405F',
                    facebook: '#1877F2',
                    linkedin: '#0A66C2',
                    twitter: '#1DA1F2',
                  }
                  return (
                    <div
                      key={post.id}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(18, 18, 26, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: `${platformColors[post.platform]}10`,
                          }}>
                            <PlatformIcon size={20} style={{ color: platformColors[post.platform] }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>{post.name}</h3>
                            <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>{post.text}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6B6B7B' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} />
                                {new Date(post.date).toLocaleDateString('pt-BR')}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} />
                                {post.time}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                                {post.format === 'feed' && <Layout size={12} />}
                                {post.format === 'story' && <Image size={12} />}
                                {post.format === 'reels' && <Film size={12} />}
                                {post.format}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge variant={post.status === 'scheduled' ? 'warning' : post.status === 'published' ? 'success' : 'error'}>
                            {post.status === 'scheduled' ? 'Agendado' : post.status === 'published' ? 'Publicado' : 'Falhou'}
                          </Badge>
                          <button style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {scheduledPosts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Calendar style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhum post agendado</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Crie sua primeira programação de post</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab: Comentários */}
          {activeTab === 'comments' && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{
                padding: '32px',
                borderRadius: '20px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                  }}>
                    <MessageCircle style={{ width: '24px', height: '24px', color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Gerenciar Comentários</h2>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Responda comentários de todas as suas redes sociais</p>
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <MessageCircle style={{ width: '40px', height: '40px', color: '#6B6B7B' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>Central de Comentários</h3>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '24px' }}>
                    Conecte suas redes sociais para gerenciar todos os comentários em um só lugar
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsConnectAccountsModalOpen(true)}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Conectar Redes Sociais
                  </Button>
                </div>
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
            onClick={() => setShowScheduleModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '512px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Calendar style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Agendar Post</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Programe suas postagens</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Nome da Programação</label>
                  <input
                    type="text"
                    value={newPost.name}
                    onChange={(e) => setNewPost(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Post de Lançamento"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Plataforma</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['instagram', 'facebook', 'linkedin', 'twitter'].map((platform) => {
                      const Icon = platformIcons[platform]
                      const isSelected = newPost.platform === platform
                      const platformColors: Record<string, string> = {
                        instagram: '#E4405F',
                        facebook: '#1877F2',
                        linkedin: '#0A66C2',
                        twitter: '#1DA1F2',
                      }
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => setNewPost(prev => ({ ...prev, platform: platform as any }))}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? `${platformColors[platform]}20` : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected ? `1px solid ${platformColors[platform]}` : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon size={20} style={{ color: isSelected ? platformColors[platform] : '#6B6B7B' }} />
                          <span style={{ fontSize: '12px', color: isSelected ? platformColors[platform] : '#6B6B7B', textTransform: 'capitalize' }}>{platform}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Data</label>
                    <input
                      type="date"
                      value={newPost.date}
                      onChange={(e) => setNewPost(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Horário</label>
                    <input
                      type="time"
                      value={newPost.time}
                      onChange={(e) => setNewPost(prev => ({ ...prev, time: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Formato</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'feed', label: 'Feed', icon: Layout },
                      { id: 'story', label: 'Story', icon: Image },
                      { id: 'reels', label: 'Reels', icon: Film },
                    ].map((format) => {
                      const isSelected = newPost.format === format.id
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setNewPost(prev => ({ ...prev, format: format.id as any }))}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <format.icon size={16} style={{ color: isSelected ? '#3B82F6' : '#6B6B7B' }} />
                          <span style={{ fontSize: '14px', color: isSelected ? '#3B82F6' : '#6B6B7B' }}>{format.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Mídia</label>
                  <div style={{
                    padding: '32px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}>
                    <Upload size={24} style={{ margin: '0 auto', color: '#6B6B7B', marginBottom: '8px' }} />
                    <p style={{ fontSize: '14px', color: '#6B6B7B' }}>Arraste ou clique para upload</p>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Texto do Post</label>
                  <textarea
                    rows={3}
                    value={newPost.text}
                    onChange={(e) => setNewPost(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Digite o texto da sua postagem..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleCreatePost} disabled={saving}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {saving ? (
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Calendar size={16} />
                    )}
                    {saving ? 'Agendando...' : 'Agendar'}
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
