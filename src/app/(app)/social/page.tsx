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
  const [postUrl, setPostUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null)

  // Analysis results
  const [siteAnalysis, setSiteAnalysis] = useState<{
    url: string
    traffic: string
    timeOnSite: string
    bounceRate: string
    pagesPerSession: string
    sources: { source: string; value: number; color: string }[]
  } | null>(null)

  const [socialAnalysis, setSocialAnalysis] = useState<{
    handle: string
    platforms: { platform: string; followers: string; engagement: string; growth: string }[]
  } | null>(null)

  const [postAnalysis, setPostAnalysis] = useState<{
    url: string
    likes: number
    comments: number
    shares: number
    reach: number
    engagement: string
    sentiment: string
  } | null>(null)

  const handleAnalyzeSite = () => {
    if (!siteUrl) {
      showToast('Digite uma URL para analisar', 'error')
      return
    }
    setAnalyzing(true)
    setSiteAnalysis(null)

    // Simulate analysis with random data
    setTimeout(() => {
      const traffic = Math.floor(Math.random() * 500 + 50)
      const bounce = Math.floor(Math.random() * 40 + 25)
      const sources = [
        { source: 'Busca Orgânica', value: Math.floor(Math.random() * 30 + 30), color: '#3B82F6' },
        { source: 'Redes Sociais', value: Math.floor(Math.random() * 20 + 15), color: '#FACC15' },
        { source: 'Direto', value: Math.floor(Math.random() * 20 + 10), color: '#8B5CF6' },
        { source: 'Referência', value: Math.floor(Math.random() * 15 + 5), color: '#22C55E' },
      ]
      // Normalize to 100%
      const total = sources.reduce((acc, s) => acc + s.value, 0)
      sources.forEach(s => s.value = Math.round((s.value / total) * 100))

      setSiteAnalysis({
        url: siteUrl,
        traffic: `${traffic}K`,
        timeOnSite: `${Math.floor(Math.random() * 4 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        bounceRate: `${bounce}%`,
        pagesPerSession: (Math.random() * 4 + 1).toFixed(1),
        sources,
      })
      setAnalyzing(false)
      showToast('Análise concluída!', 'success')
    }, 2500)
  }

  const handleAnalyzeSocial = () => {
    if (!socialHandle) {
      showToast('Digite um @ para analisar', 'error')
      return
    }
    setAnalyzing(true)
    setSocialAnalysis(null)

    setTimeout(() => {
      setSocialAnalysis({
        handle: socialHandle,
        platforms: [
          { platform: 'Instagram', followers: `${Math.floor(Math.random() * 100 + 10)}K`, engagement: `${(Math.random() * 5 + 2).toFixed(1)}%`, growth: `+${(Math.random() * 10 + 1).toFixed(1)}%` },
          { platform: 'Facebook', followers: `${Math.floor(Math.random() * 80 + 5)}K`, engagement: `${(Math.random() * 4 + 1).toFixed(1)}%`, growth: `+${(Math.random() * 8 + 0.5).toFixed(1)}%` },
          { platform: 'LinkedIn', followers: `${Math.floor(Math.random() * 50 + 5)}K`, engagement: `${(Math.random() * 6 + 2).toFixed(1)}%`, growth: `+${(Math.random() * 12 + 2).toFixed(1)}%` },
          { platform: 'Twitter', followers: `${Math.floor(Math.random() * 40 + 3)}K`, engagement: `${(Math.random() * 3 + 1).toFixed(1)}%`, growth: `+${(Math.random() * 6 + 0.5).toFixed(1)}%` },
        ],
      })
      setAnalyzing(false)
      showToast('Análise concluída!', 'success')
    }, 2500)
  }

  const handleAnalyzePost = () => {
    if (!postUrl) {
      showToast('Cole o link do post para analisar', 'error')
      return
    }
    setAnalyzing(true)
    setPostAnalysis(null)

    setTimeout(() => {
      const likes = Math.floor(Math.random() * 10000 + 500)
      const comments = Math.floor(Math.random() * 500 + 50)
      const shares = Math.floor(Math.random() * 300 + 20)
      const reach = Math.floor(Math.random() * 50000 + 5000)

      setPostAnalysis({
        url: postUrl,
        likes,
        comments,
        shares,
        reach,
        engagement: `${((likes + comments + shares) / reach * 100).toFixed(2)}%`,
        sentiment: Math.random() > 0.3 ? 'Positivo' : Math.random() > 0.5 ? 'Neutro' : 'Negativo',
      })
      setAnalyzing(false)
      showToast('Análise do post concluída!', 'success')
    }, 2500)
  }

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post)
    setNewPost({
      name: post.name,
      platform: post.platform,
      date: post.date,
      time: post.time,
      format: post.format,
      text: post.text || '',
    })
    setShowScheduleModal(true)
  }

  const handleUpdatePost = async () => {
    if (!editingPost) return
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
      const response = await fetch(`/api/scheduled-posts/${editingPost.id}`, {
        method: 'PUT',
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
        setShowScheduleModal(false)
        setEditingPost(null)
        setNewPost({ name: '', platform: 'instagram', date: '', time: '', format: 'feed', text: '' })
        showToast('Post atualizado com sucesso!', 'success')
        fetchPosts()
      } else {
        const error = await response.json()
        showToast(error.error || 'Erro ao atualizar post', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      showToast('Erro ao atualizar post', 'error')
    } finally {
      setSaving(false)
    }
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
                {!siteAnalysis && !analyzing && (
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
                      <Globe style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhuma análise realizada</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Digite a URL de um site e clique em Analisar</p>
                  </div>
                )}

                {analyzing && activeTab === 'site' && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      margin: '0 auto 16px',
                      border: '3px solid rgba(59, 130, 246, 0.2)',
                      borderTopColor: '#3B82F6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>Analisando {siteUrl}...</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B' }}>Coletando dados de tráfego e performance</p>
                  </div>
                )}

                {siteAnalysis && !analyzing && (
                  <>
                    <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <p style={{ fontSize: '12px', color: '#3B82F6', margin: 0 }}>Resultados para: <strong>{siteAnalysis.url}</strong></p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                      {[
                        { label: 'Tráfego Mensal', value: siteAnalysis.traffic, trend: `+${Math.floor(Math.random() * 20 + 5)}%` },
                        { label: 'Tempo no Site', value: siteAnalysis.timeOnSite, trend: `+${Math.floor(Math.random() * 15 + 2)}%` },
                        { label: 'Taxa de Rejeição', value: siteAnalysis.bounceRate, trend: `-${Math.floor(Math.random() * 10 + 3)}%` },
                        { label: 'Páginas/Sessão', value: siteAnalysis.pagesPerSession, trend: `+${Math.floor(Math.random() * 20 + 5)}%` },
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
                        {siteAnalysis.sources.map((item) => (
                          <div key={item.source} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                            <span style={{ fontSize: '14px', color: '#A0A0B0', flex: 1 }}>{item.source}</span>
                            <div style={{ flex: 2, height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${item.value}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', minWidth: '40px', textAlign: 'right' }}>{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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

                {/* Resultado da Análise */}
                {!socialAnalysis && !analyzing && (
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
                      <Share2 style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhuma análise realizada</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Digite um @ de usuário e clique em Analisar</p>
                  </div>
                )}

                {analyzing && activeTab === 'social' && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      margin: '0 auto 16px',
                      border: '3px solid rgba(250, 204, 21, 0.2)',
                      borderTopColor: '#FACC15',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>Analisando {socialHandle}...</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B' }}>Coletando dados de redes sociais</p>
                  </div>
                )}

                {socialAnalysis && !analyzing && (
                  <>
                    <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
                      <p style={{ fontSize: '12px', color: '#FACC15', margin: 0 }}>Resultados para: <strong>{socialAnalysis.handle}</strong></p>
                    </div>

                    {/* Métricas por Plataforma */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {socialAnalysis.platforms.map((item) => {
                        const platformIcons: Record<string, any> = {
                          Instagram: Instagram,
                          Facebook: Facebook,
                          LinkedIn: Linkedin,
                          Twitter: Twitter,
                        }
                        const platformColors: Record<string, string> = {
                          Instagram: '#E4405F',
                          Facebook: '#1877F2',
                          LinkedIn: '#0A66C2',
                          Twitter: '#1DA1F2',
                        }
                        const Icon = platformIcons[item.platform]
                        const color = platformColors[item.platform]
                        return (
                          <div
                            key={item.platform}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              border: `1px solid ${color}30`,
                              backgroundColor: `${color}10`,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                              <Icon size={20} style={{ color: color }} />
                              <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{item.platform}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Seguidores</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{item.followers}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Engajamento</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: color }}>{item.engagement}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Crescimento</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>{item.growth}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
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

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="Cole o link do post aqui..."
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
                  <Button variant="primary" onClick={handleAnalyzePost}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {analyzing ? (
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <BarChart3 size={16} />
                      )}
                      Analisar
                    </span>
                  </Button>
                </div>

                {/* Resultado da Análise */}
                {!postAnalysis && !analyzing && (
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
                      <Image style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhuma análise realizada</p>
                    <p style={{ fontSize: '12px', color: '#4B4B5B' }}>Cole o link de um post e clique em Analisar</p>
                  </div>
                )}

                {analyzing && activeTab === 'post' && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      margin: '0 auto 16px',
                      border: '3px solid rgba(139, 92, 246, 0.2)',
                      borderTopColor: '#8B5CF6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>Analisando post...</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B' }}>Coletando métricas de engajamento</p>
                  </div>
                )}

                {postAnalysis && !analyzing && (
                  <>
                    <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <p style={{ fontSize: '12px', color: '#8B5CF6', margin: 0, wordBreak: 'break-all' }}>Analisando: <strong>{postAnalysis.url}</strong></p>
                    </div>

                    {/* Métricas do Post */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                      {[
                        { label: 'Curtidas', value: postAnalysis.likes.toLocaleString('pt-BR'), icon: Heart, color: '#EF4444' },
                        { label: 'Comentários', value: postAnalysis.comments.toLocaleString('pt-BR'), icon: MessageCircle, color: '#3B82F6' },
                        { label: 'Compartilhamentos', value: postAnalysis.shares.toLocaleString('pt-BR'), icon: Share2, color: '#10B981' },
                      ].map((metric, idx) => (
                        <div key={idx} style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <metric.icon size={16} style={{ color: metric.color }} />
                            <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{metric.label}</span>
                          </div>
                          <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Eye size={16} style={{ color: '#FACC15' }} />
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Alcance</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{postAnalysis.reach.toLocaleString('pt-BR')}</p>
                      </div>
                      <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <TrendingUp size={16} style={{ color: '#8B5CF6' }} />
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Engajamento</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#8B5CF6', margin: 0 }}>{postAnalysis.engagement}</p>
                      </div>
                      <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <MessageCircle size={16} style={{ color: postAnalysis.sentiment === 'Positivo' ? '#10B981' : postAnalysis.sentiment === 'Negativo' ? '#EF4444' : '#FACC15' }} />
                          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Sentimento</span>
                        </div>
                        <p style={{
                          fontSize: '24px',
                          fontWeight: 700,
                          color: postAnalysis.sentiment === 'Positivo' ? '#10B981' : postAnalysis.sentiment === 'Negativo' ? '#EF4444' : '#FACC15',
                          margin: 0
                        }}>
                          {postAnalysis.sentiment}
                        </p>
                      </div>
                    </div>
                  </>
                )}
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
                <Button variant="primary" onClick={() => { setEditingPost(null); setNewPost({ name: '', platform: 'instagram', date: '', time: '', format: 'feed', text: '' }); setShowScheduleModal(true); }}>
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
                          <button
                            onClick={() => handleEditPost(post)}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                          >
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
            onClick={() => { setShowScheduleModal(false); setEditingPost(null); }}
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
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                      {editingPost ? 'Editar Post' : 'Agendar Post'}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                      {editingPost ? 'Atualize os dados do post' : 'Programe suas postagens'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowScheduleModal(false); setEditingPost(null); }}
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
                <Button variant="ghost" onClick={() => { setShowScheduleModal(false); setEditingPost(null); }}>Cancelar</Button>
                <Button variant="primary" onClick={editingPost ? handleUpdatePost : handleCreatePost} disabled={saving}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {saving ? (
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Calendar size={16} />
                    )}
                    {saving ? (editingPost ? 'Salvando...' : 'Agendando...') : (editingPost ? 'Salvar Alterações' : 'Agendar')}
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
