'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Palette,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Grid,
  List,
  Heart,
  Copy,
  Check,
  Sparkles,
  Image,
  Video,
  Calendar,
  Bookmark,
  Chrome,
  ChevronDown,
} from 'lucide-react'

interface Creative {
  id: string
  title: string
  type: 'image' | 'video' | 'carousel'
  platform: 'facebook' | 'instagram' | 'tiktok' | 'google'
  advertiser: string
  savedAt: string
  thumbnail: string
  likes: number
  tags: string[]
  url: string
}

const mockCreatives: Creative[] = [
  {
    id: '1',
    title: 'Anúncio de Lançamento - E-commerce',
    type: 'image',
    platform: 'facebook',
    advertiser: 'Loja ABC',
    savedAt: '2024-02-15',
    thumbnail: 'https://picsum.photos/seed/1/400/400',
    likes: 1250,
    tags: ['e-commerce', 'lançamento', 'promoção'],
    url: 'https://facebook.com/ads/123'
  },
  {
    id: '2',
    title: 'Vídeo Produto - Demonstração',
    type: 'video',
    platform: 'instagram',
    advertiser: 'Tech Solutions',
    savedAt: '2024-02-14',
    thumbnail: 'https://picsum.photos/seed/2/400/400',
    likes: 3420,
    tags: ['demonstração', 'produto', 'tech'],
    url: 'https://instagram.com/ads/456'
  },
  {
    id: '3',
    title: 'Carrossel Educacional',
    type: 'carousel',
    platform: 'instagram',
    advertiser: 'Curso Online XYZ',
    savedAt: '2024-02-13',
    thumbnail: 'https://picsum.photos/seed/3/400/400',
    likes: 890,
    tags: ['educação', 'curso', 'dicas'],
    url: 'https://instagram.com/ads/789'
  },
  {
    id: '4',
    title: 'TikTok Viral - Trend',
    type: 'video',
    platform: 'tiktok',
    advertiser: 'Marca XYZ',
    savedAt: '2024-02-12',
    thumbnail: 'https://picsum.photos/seed/4/400/400',
    likes: 15600,
    tags: ['viral', 'trend', 'jovem'],
    url: 'https://tiktok.com/ads/101'
  },
]

export default function CriativosPage() {
  const { showToast } = useApp()
  const [creatives, setCreatives] = useState<Creative[]>(mockCreatives)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [extensionInstalled, setExtensionInstalled] = useState(false)

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    showToast('Link copiado!', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = (creative: Creative) => {
    showToast(`Baixando ${creative.title}...`, 'info')
  }

  const handleDelete = (id: string) => {
    setCreatives(prev => prev.filter(c => c.id !== id))
    showToast('Criativo removido!', 'success')
  }

  const handleMinerar = () => {
    window.open('https://www.facebook.com/ads/library', '_blank')
    showToast('Abrindo Biblioteca de Anúncios...', 'info')
  }

  const filteredCreatives = creatives.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.advertiser.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || c.type === selectedType
    const matchesPlatform = selectedPlatform === 'all' || c.platform === selectedPlatform
    return matchesSearch && matchesType && matchesPlatform
  })

  const typeIcons: Record<string, any> = {
    image: Image,
    video: Video,
    carousel: Copy,
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Criativos"
        subtitle="Biblioteca de anúncios salvos"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard
            label="Criativos Salvos"
            value={creatives.length}
            icon={Bookmark}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Imagens"
            value={creatives.filter(c => c.type === 'image').length}
            icon={Image}
            color="yellow"
            delay={0.1}
          />
          <StatCard
            label="Vídeos"
            value={creatives.filter(c => c.type === 'video').length}
            icon={Video}
            color="blue"
            delay={0.2}
          />
          <StatCard
            label="Carrosséis"
            value={creatives.filter(c => c.type === 'carousel').length}
            icon={Copy}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Extension Banner */}
        {!extensionInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <Chrome size={28} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Instale nossa Extensão</h3>
                  <p style={{ fontSize: '14px', color: '#A0A0B0', margin: 0 }}>
                    Com a extensão, você pode salvar anúncios diretamente da Biblioteca do Facebook
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setExtensionInstalled(true)
                    showToast('Extensão instalada!', 'success')
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} />
                    Instalar Extensão
                  </span>
                </Button>
                <Button variant="secondary" onClick={handleMinerar}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} />
                    Minerar Agora
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar criativos..."
                style={{
                  height: '44px',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  width: '280px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>

            {/* Type Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  height: '44px',
                  paddingLeft: '16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '160px',
                }}
              >
                <option value="all" style={{ backgroundColor: '#12121A' }}>Todos os Tipos</option>
                <option value="image" style={{ backgroundColor: '#12121A' }}>Imagens</option>
                <option value="video" style={{ backgroundColor: '#12121A' }}>Vídeos</option>
                <option value="carousel" style={{ backgroundColor: '#12121A' }}>Carrosséis</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
            </div>

            {/* Platform Filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                style={{
                  height: '44px',
                  paddingLeft: '16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '180px',
                }}
              >
                <option value="all" style={{ backgroundColor: '#12121A' }}>Todas Plataformas</option>
                <option value="facebook" style={{ backgroundColor: '#12121A' }}>Facebook</option>
                <option value="instagram" style={{ backgroundColor: '#12121A' }}>Instagram</option>
                <option value="tiktok" style={{ backgroundColor: '#12121A' }}>TikTok</option>
                <option value="google" style={{ backgroundColor: '#12121A' }}>Google</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '4px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.2)' : 'none',
                  border: 'none',
                  color: viewMode === 'grid' ? '#3B82F6' : '#6B6B7B',
                  cursor: 'pointer',
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.2)' : 'none',
                  border: 'none',
                  color: viewMode === 'list' ? '#3B82F6' : '#6B6B7B',
                  cursor: 'pointer',
                }}
              >
                <List size={18} />
              </button>
            </div>

            {extensionInstalled && (
              <Button variant="primary" onClick={handleMinerar}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} />
                  Minerar
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Creatives Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
            >
              {filteredCreatives.map((creative, index) => {
                const TypeIcon = typeIcons[creative.type]
                return (
                  <motion.div
                    key={creative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderRadius: '16px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#1A1A25', overflow: 'hidden' }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <TypeIcon size={48} style={{ color: '#6B6B7B' }} />
                      </div>

                      {/* Type Badge */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <Badge variant={creative.type === 'video' ? 'warning' : 'info'}>
                          {creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Vídeo' : 'Carrossel'}
                        </Badge>
                      </div>

                      {/* Actions Overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        opacity: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'opacity 0.2s',
                      }}
                      className="creative-overlay"
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                      >
                        <button
                          onClick={() => handleDownload(creative)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleCopy(creative.id, creative.url)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedId === creative.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button
                          onClick={() => window.open(creative.url, '_blank')}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(creative.id)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {creative.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', marginBottom: '12px' }}>{creative.advertiser}</p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#6B6B7B' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={12} />
                          {creative.likes.toLocaleString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {new Date(creative.savedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                        {creative.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: '#A0A0B0',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {filteredCreatives.map((creative, index) => {
                const TypeIcon = typeIcons[creative.type]
                return (
                  <motion.div
                    key={creative.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      backgroundColor: '#1A1A25',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <TypeIcon size={24} style={{ color: '#6B6B7B' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}>
                          {creative.title}
                        </h3>
                        <Badge variant={creative.type === 'video' ? 'warning' : 'info'}>
                          {creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Vídeo' : 'Carrossel'}
                        </Badge>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
                        {creative.advertiser} • {creative.platform} • {creative.likes.toLocaleString()} likes
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleDownload(creative)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: 'none',
                          color: '#6B6B7B',
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleCopy(creative.id, creative.url)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: 'none',
                          color: '#6B6B7B',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === creative.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(creative.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: 'none',
                          color: '#6B6B7B',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredCreatives.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
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
              <Palette style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
            </div>
            <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhum criativo encontrado</p>
            <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0 }}>
              {extensionInstalled ? 'Clique em "Minerar" para buscar novos anúncios' : 'Instale a extensão para começar a salvar anúncios'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
