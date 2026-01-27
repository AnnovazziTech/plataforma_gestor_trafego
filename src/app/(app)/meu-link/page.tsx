'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Link2,
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Eye,
  GripVertical,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Mail,
  Phone,
  MessageCircle,
  QrCode,
  Share2,
  Palette,
  Check,
  X,
  Image,
  User,
} from 'lucide-react'

interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  clicks: number
  isActive: boolean
}

interface PageConfig {
  username: string
  displayName: string
  bio: string
  avatar: string
  theme: 'dark' | 'light' | 'gradient'
  accentColor: string
}

// Dados serao carregados do banco de dados via API

const iconMap: Record<string, any> = {
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MessageCircle,
  Link2,
}

const accentColors = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#F97316',
  '#FACC15',
  '#10B981',
  '#14B8A6',
]

export default function MeuLinkPage() {
  const { showToast } = useApp()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    username: 'gestor-trafego',
    displayName: 'Gestor de Trafego',
    bio: 'Especialista em Facebook Ads, Google Ads e TikTok Ads. Ajudo empresas a escalar seus resultados.',
    avatar: '',
    theme: 'dark',
    accentColor: '#3B82F6',
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'Link2' })
  const [showPreview, setShowPreview] = useState(false)
  const [linkPageId, setLinkPageId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados da API
  useEffect(() => {
    fetchLinkPage()
  }, [])

  const fetchLinkPage = async () => {
    try {
      const response = await fetch('/api/link-pages')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setLinkPageId(data.id)
          setPageConfig({
            username: data.username,
            displayName: data.displayName,
            bio: data.bio || '',
            avatar: data.avatar || '',
            theme: data.theme || 'dark',
            accentColor: data.accentColor || '#3B82F6',
          })
          setLinks(data.links || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar página de links:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const pageUrl = `trafficpro.link/${pageConfig.username}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${pageUrl}`)
    showToast('Link copiado para a area de transferencia!', 'success')
  }

  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      showToast('Preencha todos os campos', 'error')
      return
    }

    try {
      const response = await fetch('/api/link-pages/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkPageId,
          title: newLink.title,
          url: newLink.url,
          icon: newLink.icon,
          order: links.length,
        }),
      })

      if (response.ok) {
        const createdLink = await response.json()
        setLinks(prev => [...prev, { ...createdLink, clicks: createdLink.clicks || 0 }])
        setNewLink({ title: '', url: '', icon: 'Link2' })
        setShowAddModal(false)
        showToast('Link adicionado com sucesso!', 'success')
      } else {
        showToast('Erro ao adicionar link', 'error')
      }
    } catch (error) {
      console.error('Erro ao adicionar link:', error)
      showToast('Erro ao adicionar link', 'error')
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      const response = await fetch('/api/link-pages/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setLinks(prev => prev.filter(l => l.id !== id))
        showToast('Link removido!', 'info')
      } else {
        showToast('Erro ao remover link', 'error')
      }
    } catch (error) {
      console.error('Erro ao remover link:', error)
      showToast('Erro ao remover link', 'error')
    }
  }

  const toggleLinkActive = async (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return

    try {
      const response = await fetch('/api/link-pages/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !link.isActive }),
      })

      if (response.ok) {
        setLinks(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l))
      } else {
        showToast('Erro ao atualizar link', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar link:', error)
      showToast('Erro ao atualizar link', 'error')
    }
  }

  const savePageConfig = async () => {
    try {
      const response = await fetch('/api/link-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageConfig),
      })

      if (response.ok) {
        showToast('Configurações salvas!', 'success')
      } else {
        showToast('Erro ao salvar configurações', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      showToast('Erro ao salvar configurações', 'error')
    }
  }

  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0)
  const activeLinks = links.filter(l => l.isActive).length

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Meu Link"
        subtitle="Crie sua pagina de links personalizada"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          {/* Left Column - Configuration */}
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Total de Cliques</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{totalClicks}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Links Ativos</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{activeLinks}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>CTR Medio</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>-</p>
              </motion.div>
            </div>

            {/* Page URL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link2 size={20} style={{ color: '#3B82F6' }} />
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>https://{pageUrl}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                  <Copy size={16} style={{ marginRight: '6px' }} />
                  Copiar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => window.open(`https://${pageUrl}`, '_blank')}>
                  <ExternalLink size={16} style={{ marginRight: '6px' }} />
                  Abrir
                </Button>
                <Button variant="ghost" size="sm" onClick={() => showToast('QR Code gerado!', 'info')}>
                  <QrCode size={16} />
                </Button>
              </div>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
                Configuracoes do Perfil
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Nome de Usuario</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6B6B7B' }}>trafficpro.link/</span>
                    <input
                      type="text"
                      value={pageConfig.username}
                      onChange={(e) => setPageConfig(prev => ({ ...prev, username: e.target.value }))}
                      style={{
                        flex: 1,
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Nome de Exibicao</label>
                  <input
                    type="text"
                    value={pageConfig.displayName}
                    onChange={(e) => setPageConfig(prev => ({ ...prev, displayName: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Bio</label>
                  <textarea
                    value={pageConfig.bio}
                    onChange={(e) => setPageConfig(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Cor de Destaque</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {accentColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setPageConfig(prev => ({ ...prev, accentColor: color }))}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: color,
                          border: pageConfig.accentColor === color ? '2px solid #FFFFFF' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Button variant="primary" onClick={savePageConfig} style={{ marginTop: '8px' }}>
                  Salvar Configuracoes
                </Button>
              </div>
            </motion.div>

            {/* Links List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  Meus Links
                </h3>
                <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Adicionar Link
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {links.map((link) => {
                  const IconComponent = iconMap[link.icon] || Link2
                  return (
                    <motion.div
                      key={link.id}
                      layout
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        opacity: link.isActive ? 1 : 0.5,
                      }}
                    >
                      <GripVertical size={16} style={{ color: '#6B6B7B', cursor: 'grab' }} />

                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: pageConfig.accentColor + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <IconComponent size={18} style={{ color: pageConfig.accentColor }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: '0 0 2px' }}>{link.title}</p>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{link.clicks} cliques</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => toggleLinkActive(link.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'none',
                            border: 'none',
                            color: link.isActive ? '#10B981' : '#6B6B7B',
                            cursor: 'pointer',
                          }}
                        >
                          {link.isActive ? <Eye size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingLink(link)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'none',
                            border: 'none',
                            color: '#6B6B7B',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview */}
          <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  Preview
                </h3>
                <Badge variant="info">Mobile</Badge>
              </div>

              {/* Phone Frame */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  margin: '0 auto',
                  borderRadius: '32px',
                  padding: '12px',
                  backgroundColor: '#000',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div
                  style={{
                    borderRadius: '24px',
                    backgroundColor: pageConfig.theme === 'dark' ? '#0A0A0F' : '#FFFFFF',
                    padding: '32px 20px',
                    minHeight: '500px',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${pageConfig.accentColor}, ${pageConfig.accentColor}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <User size={32} style={{ color: '#FFFFFF' }} />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: pageConfig.theme === 'dark' ? '#FFFFFF' : '#000', margin: '0 0 8px', textAlign: 'center' }}>
                      {pageConfig.displayName}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6B6B7B', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                      {pageConfig.bio}
                    </p>
                  </div>

                  {/* Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {links.filter(l => l.isActive).map((link) => {
                      const IconComponent = iconMap[link.icon] || Link2
                      return (
                        <div
                          key={link.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '14px 20px',
                            borderRadius: '12px',
                            backgroundColor: pageConfig.accentColor,
                            cursor: 'pointer',
                          }}
                        >
                          <IconComponent size={18} style={{ color: '#FFFFFF' }} />
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{link.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modal Adicionar Link */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '450px',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Adicionar Link</h2>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Titulo</label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Meu Instagram"
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>URL</label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Icone</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.keys(iconMap).map(iconName => {
                      const IconComp = iconMap[iconName]
                      return (
                        <button
                          key={iconName}
                          onClick={() => setNewLink(prev => ({ ...prev, icon: iconName }))}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            border: newLink.icon === iconName ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: newLink.icon === iconName ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <IconComp size={18} style={{ color: newLink.icon === iconName ? '#3B82F6' : '#6B6B7B' }} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button variant="ghost" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleAddLink} style={{ flex: 1 }}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
