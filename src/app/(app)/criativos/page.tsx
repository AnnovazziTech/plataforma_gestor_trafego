'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout'
import { useApp } from '@/contexts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, Video, Plus, Trash2, Edit3, X, Loader2, Search,
  Tag, Calendar, Clock, Users,
} from 'lucide-react'

interface Creative {
  id: string
  title: string
  type: string
  mediaUrl?: string
  thumbnailUrl?: string
  tags: string[]
  sourceAdvertiser?: string
  createdAt: string
}

export default function CriativosPage() {
  const { showToast } = useApp()
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Creative | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterClient, setFilterClient] = useState('')
  const [formData, setFormData] = useState({
    title: '', type: 'IMAGE' as string, mediaUrl: '', tags: '',
    clientName: '',
  })

  const fetchCreatives = useCallback(async () => {
    try {
      const res = await fetch('/api/creatives')
      if (res.ok) {
        const data = await res.json()
        setCreatives(data.creatives || [])
      }
    } catch (error) {
      console.error('Erro ao buscar criativos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetchCreatives(),
      fetch('/api/clients').then(r => r.json()).then(data => {
        setClients(Array.isArray(data) ? data : data.clients || [])
      }),
    ])
  }, [fetchCreatives])

  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt)
    const expiry = new Date(created.getTime() + 15 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const openAdd = () => {
    setEditing(null)
    setFormData({ title: '', type: 'IMAGE', mediaUrl: '', tags: '', clientName: '' })
    setShowModal(true)
  }

  const openEdit = (c: Creative) => {
    setEditing(c)
    setFormData({
      title: c.title,
      type: c.type,
      mediaUrl: c.mediaUrl || '',
      tags: (c.tags || []).join(', '),
      clientName: c.sourceAdvertiser || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      title: formData.title,
      type: formData.type,
      mediaUrl: formData.mediaUrl || undefined,
      thumbnailUrl: formData.mediaUrl || undefined,
      tags,
      sourceAdvertiser: formData.clientName || undefined,
    }

    try {
      if (editing) {
        const res = await fetch(`/api/creatives/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          showToast('Criativo atualizado!', 'success')
          closeModal()
          fetchCreatives()
        } else {
          showToast('Erro ao atualizar criativo', 'error')
        }
      } else {
        const res = await fetch('/api/creatives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          showToast('Criativo adicionado!', 'success')
          closeModal()
          fetchCreatives()
        } else {
          showToast('Erro ao adicionar criativo', 'error')
        }
      }
    } catch {
      showToast('Erro ao salvar criativo', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/creatives/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCreatives(prev => prev.filter(c => c.id !== id))
        showToast('Criativo removido!', 'success')
      }
    } catch {
      showToast('Erro ao remover criativo', 'error')
    }
  }

  const filtered = creatives.filter(c => {
    const matchSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchType = filterType === 'all' || c.type === filterType
    const matchClient = !filterClient || c.sourceAdvertiser === filterClient
    return matchSearch && matchType && matchClient
  })

  const totalImages = creatives.filter(c => c.type === 'IMAGE').length
  const totalVideos = creatives.filter(c => c.type === 'VIDEO').length

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF', fontSize: '14px', outline: 'none',
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Criativos" subtitle="Gerencie seus criativos" variant="simple" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Criativos" subtitle="Gerencie seus criativos" variant="simple" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total', value: creatives.length, icon: <Tag size={20} />, color: '#3B82F6' },
            { label: 'Fotos', value: totalImages, icon: <Image size={20} />, color: '#10B981' },
            { label: 'Videos', value: totalVideos, icon: <Video size={20} />, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '20px', borderRadius: '16px',
              backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFF' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#6B6B7B' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B7B' }} />
              <input
                type="text" placeholder="Buscar..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, width: '200px', paddingLeft: '34px' }}
              />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
              <option value="all">Todos tipos</option>
              <option value="IMAGE">Fotos</option>
              <option value="VIDEO">Videos</option>
            </select>
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ ...inputStyle, width: '160px' }}>
              <option value="">Todos clientes</option>
              {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
            borderRadius: '10px', border: 'none',
            background: 'linear-gradient(to right, #3B82F6, #2563EB)',
            color: '#FFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>
            <Plus size={16} /> Novo Criativo
          </button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px', borderRadius: '16px',
            backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Image size={48} style={{ color: '#6B6B7B', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF', marginBottom: '8px' }}>Nenhum criativo</h3>
            <p style={{ color: '#6B6B7B', fontSize: '14px' }}>Clique em "Novo Criativo" para adicionar fotos e videos.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filtered.map((creative, i) => {
              const daysLeft = getDaysRemaining(creative.createdAt)
              const isExpiring = daysLeft <= 3
              const isVideo = creative.type === 'VIDEO'

              return (
                <motion.div
                  key={creative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    borderRadius: '16px', overflow: 'hidden',
                    backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    position: 'relative', height: '180px', backgroundColor: '#0D0D14',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {creative.mediaUrl ? (
                      isVideo ? (
                        <video
                          src={creative.mediaUrl}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          muted
                        />
                      ) : (
                        <img
                          src={creative.mediaUrl}
                          alt={creative.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )
                    ) : (
                      <div style={{
                        background: isVideo
                          ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))'
                          : 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))',
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isVideo ? <Video size={40} style={{ color: '#F59E0B' }} /> : <Image size={40} style={{ color: '#3B82F6' }} />}
                      </div>
                    )}

                    {/* Type badge */}
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                      backgroundColor: isVideo ? 'rgba(245,158,11,0.9)' : 'rgba(59,130,246,0.9)',
                      color: '#FFF',
                    }}>
                      {isVideo ? 'VIDEO' : 'FOTO'}
                    </span>

                    {/* Days left */}
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                      backgroundColor: isExpiring ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.6)',
                      color: '#FFF', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Clock size={10} />
                      {daysLeft > 0 ? `${daysLeft}d` : 'Expirado'}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '14px', fontWeight: 600, color: '#FFF', marginBottom: '6px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {creative.title}
                    </h3>

                    {creative.sourceAdvertiser && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#A0A0B0', marginBottom: '8px' }}>
                        <Users size={12} />
                        {creative.sourceAdvertiser}
                      </div>
                    )}

                    {/* Tags */}
                    {creative.tags && creative.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                        {creative.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '10px',
                            backgroundColor: 'rgba(139,92,246,0.15)', color: '#A855F7',
                          }}>
                            #{tag}
                          </span>
                        ))}
                        {creative.tags.length > 3 && (
                          <span style={{ fontSize: '10px', color: '#6B6B7B' }}>+{creative.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Date + Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6B6B7B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(creative.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => openEdit(creative)}
                          style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px' }}
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(creative.id)}
                          style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px' }}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '440px', backgroundColor: '#12121A',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>
                  {editing ? 'Editar Criativo' : 'Novo Criativo'}
                </h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Titulo *</label>
                  <input
                    required type="text" value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    style={inputStyle} placeholder="Ex: Banner Black Friday"
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="IMAGE">Foto</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>URL da Midia</label>
                  <input
                    type="url" value={formData.mediaUrl}
                    onChange={e => setFormData(p => ({ ...p, mediaUrl: e.target.value }))}
                    style={inputStyle} placeholder="https://..."
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente</label>
                  <select
                    value={formData.clientName}
                    onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Nenhum</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Tags (separadas por virgula)</label>
                  <input
                    type="text" value={formData.tags}
                    onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                    style={inputStyle} placeholder="Ex: promo, black-friday, feed"
                  />
                </div>
                <button type="submit" style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                  color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {editing ? 'Salvar Alteracoes' : 'Adicionar Criativo'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
