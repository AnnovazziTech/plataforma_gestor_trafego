'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'

// Define local interface for display purposes
interface LocalCreative {
  id: string
  title: string
  type: 'image' | 'video' | 'carousel'
  platform: string
  advertiser: string
  savedAt: string
  thumbnail: string
  likes: number
  tags: string[]
  url: string
  isFavorite: boolean
}

interface LocalArtTemplate {
  id: string
  name: string
  niche: Niche
  type: string
  thumbnail: string
  canvaUrl: string
  downloads: number
  rating: number
  tags: string[]
  isNew: boolean
  isPremium: boolean
  isSaved?: boolean
}
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
  Brush,
  Star,
  Tag,
  Edit3,
  X,
  Eye,
  Folder,
  Layers,
} from 'lucide-react'

// Types
type TabType = 'biblioteca' | 'artes'
type Niche = 'all' | 'ecommerce' | 'infoproduto' | 'servicos' | 'restaurante' | 'moda' | 'fitness' | 'educacao' | 'imobiliaria' | 'saude'

const nicheLabels: Record<Niche, string> = {
  all: 'Todos os Nichos',
  ecommerce: 'E-commerce',
  infoproduto: 'Infoproduto',
  servicos: 'Servicos',
  restaurante: 'Restaurante',
  moda: 'Moda',
  fitness: 'Fitness',
  educacao: 'Educacao',
  imobiliaria: 'Imobiliaria',
  saude: 'Saude',
}

const nicheColors: Record<Niche, string> = {
  all: '#3B82F6',
  ecommerce: '#FACC15',
  infoproduto: '#A855F7',
  servicos: '#34D399',
  restaurante: '#F97316',
  moda: '#EC4899',
  fitness: '#EF4444',
  educacao: '#06B6D4',
  imobiliaria: '#84CC16',
  saude: '#14B8A6',
}

export default function CriativosPage() {
  const {
    showToast,
    creatives,
    creativesLoading,
    creativesStats,
    fetchCreatives,
    deleteCreative,
    toggleCreativeFavorite,
    artTemplates,
    artTemplatesLoading,
    fetchArtTemplates,
  } = useApp()

  const [activeTab, setActiveTab] = useState<TabType>('biblioteca')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [extensionInstalled, setExtensionInstalled] = useState(false)

  // Estados para aba Artes
  const [artSearchTerm, setArtSearchTerm] = useState('')
  const [selectedNiche, setSelectedNiche] = useState<Niche>('all')
  const [selectedArtType, setSelectedArtType] = useState<string>('all')
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const [showOnlyPremium, setShowOnlyPremium] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<LocalArtTemplate | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchCreatives()
    fetchArtTemplates()
  }, [fetchCreatives, fetchArtTemplates])

  // Transform context creatives to local format for display
  const displayCreatives: LocalCreative[] = creatives.map(c => ({
    id: c.id,
    title: c.title,
    type: c.type.toLowerCase() as 'image' | 'video' | 'carousel',
    platform: c.platform?.toLowerCase() || 'meta',
    advertiser: c.sourceAdvertiser || 'Desconhecido',
    savedAt: c.createdAt,
    thumbnail: c.thumbnailUrl || '',
    likes: 0,
    tags: c.tags || [],
    url: c.sourceUrl || c.mediaUrl || '',
    isFavorite: c.isFavorite,
  }))

  // Transform context templates to local format
  const displayTemplates: LocalArtTemplate[] = artTemplates.map(t => ({
    id: t.id,
    name: t.name,
    niche: (t.niche?.toLowerCase() || 'all') as Niche,
    type: t.type?.toLowerCase() || 'feed',
    thumbnail: t.thumbnailUrl || '',
    canvaUrl: t.canvaUrl || '',
    downloads: t.downloads || 0,
    rating: t.rating || 0,
    tags: t.tags || [],
    isNew: t.isNew || false,
    isPremium: t.isPremium || false,
    isSaved: t.isSaved,
  }))

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    showToast('Link copiado!', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = (creative: LocalCreative) => {
    showToast(`Baixando ${creative.title}...`, 'info')
    // In a real app, this would trigger an actual download
    if (creative.url) {
      window.open(creative.url, '_blank')
    }
  }

  const handleDelete = async (id: string) => {
    await deleteCreative(id)
  }

  const handleToggleFavorite = async (id: string) => {
    await toggleCreativeFavorite(id)
  }

  const handleMinerar = () => {
    window.open('https://www.facebook.com/ads/library', '_blank')
    showToast('Abrindo Biblioteca de Anuncios...', 'info')
  }

  const handleUseTemplate = (template: LocalArtTemplate) => {
    window.open(template.canvaUrl, '_blank')
    showToast(`Abrindo template "${template.name}" no Canva...`, 'success')
  }

  const filteredCreatives = displayCreatives.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.advertiser.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || c.type === selectedType
    const matchesPlatform = selectedPlatform === 'all' || c.platform === selectedPlatform
    return matchesSearch && matchesType && matchesPlatform
  })

  const filteredTemplates = displayTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(artSearchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(artSearchTerm.toLowerCase()))
    const matchesNiche = selectedNiche === 'all' || template.niche === selectedNiche
    const matchesType = selectedArtType === 'all' || template.type === selectedArtType
    const matchesNew = !showOnlyNew || template.isNew
    const matchesPremium = !showOnlyPremium || template.isPremium
    return matchesSearch && matchesNiche && matchesType && matchesNew && matchesPremium
  })

  const typeIcons: Record<string, any> = {
    image: Image,
    video: Video,
    carousel: Copy,
  }

  const tabs = [
    { id: 'biblioteca' as TabType, label: 'Biblioteca', icon: Folder },
    { id: 'artes' as TabType, label: 'Artes', icon: Palette },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Criativos"
        subtitle="Biblioteca de anuncios salvos e templates de artes editaveis"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', width: 'fit-content' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#6B6B7B',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Tab: Biblioteca */}
          {activeTab === 'biblioteca' && (
            <motion.div
              key="biblioteca"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <StatCard
                  label="Criativos Salvos"
                  value={creativesStats.total || displayCreatives.length}
                  icon={Bookmark}
                  color="blue"
                  delay={0}
                />
                <StatCard
                  label="Imagens"
                  value={creativesStats.byType?.IMAGE || displayCreatives.filter(c => c.type === 'image').length}
                  icon={Image}
                  color="yellow"
                  delay={0.1}
                />
                <StatCard
                  label="Videos"
                  value={creativesStats.byType?.VIDEO || displayCreatives.filter(c => c.type === 'video').length}
                  icon={Video}
                  color="blue"
                  delay={0.2}
                />
                <StatCard
                  label="Carrosseis"
                  value={creativesStats.byType?.CAROUSEL || displayCreatives.filter(c => c.type === 'carousel').length}
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
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Instale nossa Extensao</h3>
                        <p style={{ fontSize: '14px', color: '#A0A0B0', margin: 0 }}>
                          Com a extensao, voce pode salvar anuncios diretamente da Biblioteca do Facebook
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setExtensionInstalled(true)
                          showToast('Extensao instalada!', 'success')
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Download size={16} />
                          Instalar Extensao
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
                      <option value="video" style={{ backgroundColor: '#12121A' }}>Videos</option>
                      <option value="carousel" style={{ backgroundColor: '#12121A' }}>Carrosseis</option>
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
                                {creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Video' : 'Carrossel'}
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
                                {creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Video' : 'Carrossel'}
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
                    {extensionInstalled ? 'Clique em "Minerar" para buscar novos anuncios' : 'Instale a extensao para comecar a salvar anuncios'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Artes */}
          {activeTab === 'artes' && (
            <motion.div
              key="artes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Header da Aba */}
              <div
                style={{
                  padding: '24px',
                  marginBottom: '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                    <Palette size={24} style={{ color: '#A855F7' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>Templates de Artes Editaveis</h2>
                    <p style={{ fontSize: '14px', color: '#A0A0B0' }}>
                      +{displayTemplates.length} templates prontos para usar no Canva. Encontre o criativo perfeito para seu nicho!
                    </p>
                  </div>
                </div>

                {/* Busca */}
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                  <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B6B7B' }} />
                  <input
                    type="text"
                    value={artSearchTerm}
                    onChange={(e) => setArtSearchTerm(e.target.value)}
                    placeholder="Buscar templates por nome, nicho ou tag..."
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '44px',
                      paddingRight: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '14px',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Filtros */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Filtro Nicho */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedNiche}
                      onChange={(e) => setSelectedNiche(e.target.value as Niche)}
                      style={{
                        height: '44px',
                        paddingLeft: '16px',
                        paddingRight: '40px',
                        borderRadius: '12px',
                        backgroundColor: selectedNiche !== 'all' ? `${nicheColors[selectedNiche]}15` : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${selectedNiche !== 'all' ? `${nicheColors[selectedNiche]}40` : 'rgba(255, 255, 255, 0.1)'}`,
                        fontSize: '14px',
                        color: selectedNiche !== 'all' ? nicheColors[selectedNiche] : '#FFFFFF',
                        appearance: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '180px',
                      }}
                    >
                      {Object.entries(nicheLabels).map(([key, label]) => (
                        <option key={key} value={key} style={{ backgroundColor: '#12121A', color: '#FFFFFF' }}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: selectedNiche !== 'all' ? nicheColors[selectedNiche] : '#6B6B7B', pointerEvents: 'none' }} />
                  </div>

                  {/* Filtro Tipo */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedArtType}
                      onChange={(e) => setSelectedArtType(e.target.value)}
                      style={{
                        height: '44px',
                        paddingLeft: '16px',
                        paddingRight: '40px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '14px',
                        color: '#FFFFFF',
                        appearance: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#12121A' }}>Todos os Formatos</option>
                      <option value="feed" style={{ backgroundColor: '#12121A' }}>Feed</option>
                      <option value="stories" style={{ backgroundColor: '#12121A' }}>Stories</option>
                      <option value="reels" style={{ backgroundColor: '#12121A' }}>Reels</option>
                      <option value="carrossel" style={{ backgroundColor: '#12121A' }}>Carrossel</option>
                      <option value="banner" style={{ backgroundColor: '#12121A' }}>Banner</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B', pointerEvents: 'none' }} />
                  </div>

                  {/* Toggle Novos */}
                  <button
                    onClick={() => setShowOnlyNew(!showOnlyNew)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      height: '44px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: showOnlyNew ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${showOnlyNew ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: showOnlyNew ? '#34D399' : '#6B6B7B',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={16} />
                    Novos
                  </button>

                  {/* Toggle Premium */}
                  <button
                    onClick={() => setShowOnlyPremium(!showOnlyPremium)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      height: '44px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      backgroundColor: showOnlyPremium ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${showOnlyPremium ? 'rgba(250, 204, 21, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: showOnlyPremium ? '#FACC15' : '#6B6B7B',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <Star size={16} />
                    Premium
                  </button>
                </div>

                <span style={{ fontSize: '14px', color: '#6B6B7B' }}>
                  {filteredTemplates.length} templates encontrados
                </span>
              </div>

              {/* Nicho Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {(Object.keys(nicheLabels) as Niche[]).filter(n => n !== 'all').map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(selectedNiche === niche ? 'all' : niche)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      backgroundColor: selectedNiche === niche ? `${nicheColors[niche]}20` : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${selectedNiche === niche ? nicheColors[niche] : 'rgba(255, 255, 255, 0.1)'}`,
                      color: selectedNiche === niche ? nicheColors[niche] : '#A0A0B0',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Tag size={12} />
                    {nicheLabels[niche]}
                  </button>
                ))}
              </div>

              {/* Grid de Templates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    style={{
                      borderRadius: '16px',
                      backgroundColor: 'rgba(18, 18, 26, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: `${nicheColors[template.niche]}10` }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Brush size={48} style={{ color: nicheColors[template.niche], opacity: 0.5 }} />
                      </div>

                      {/* Badges */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                        {template.isNew && (
                          <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(52, 211, 153, 0.9)', color: '#FFFFFF', fontSize: '10px', fontWeight: 600 }}>
                            NOVO
                          </span>
                        )}
                        {template.isPremium && (
                          <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(250, 204, 21, 0.9)', color: '#000', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={10} /> PREMIUM
                          </span>
                        )}
                      </div>

                      {/* Tipo Badge */}
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#FFFFFF', fontSize: '11px', textTransform: 'capitalize' }}>
                          {template.type}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {template.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: `${nicheColors[template.niche]}15`,
                            color: nicheColors[template.niche],
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                        >
                          {nicheLabels[template.niche]}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#FACC15" style={{ color: '#FACC15' }} />
                          <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 500 }}>{template.rating}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#6B6B7B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Download size={12} />
                          {template.downloads.toLocaleString()}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseTemplate(template)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            backgroundColor: nicheColors[template.niche],
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={12} />
                          Usar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Palette size={48} style={{ color: '#6B6B7B', marginBottom: '16px' }} />
                  <p style={{ color: '#6B6B7B', fontSize: '14px' }}>Nenhum template encontrado para este filtro</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Preview do Template */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTemplate(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '600px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
            >
              {/* Preview */}
              <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: `${nicheColors[selectedTemplate.niche]}15` }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brush size={80} style={{ color: nicheColors[selectedTemplate.niche], opacity: 0.3 }} />
                </div>

                <button
                  onClick={() => setSelectedTemplate(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>

                {/* Badges */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                  {selectedTemplate.isNew && (
                    <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.9)', color: '#FFFFFF', fontSize: '12px', fontWeight: 600 }}>
                      NOVO
                    </span>
                  )}
                  {selectedTemplate.isPremium && (
                    <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(250, 204, 21, 0.9)', color: '#000', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} /> PREMIUM
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {selectedTemplate.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: `${nicheColors[selectedTemplate.niche]}20`,
                      color: nicheColors[selectedTemplate.niche],
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    {nicheLabels[selectedTemplate.niche]}
                  </span>

                  <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#A0A0B0', fontSize: '13px', textTransform: 'capitalize' }}>
                    {selectedTemplate.type}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Download size={20} style={{ color: '#3B82F6', marginBottom: '8px' }} />
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{selectedTemplate.downloads.toLocaleString()}</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B' }}>Downloads</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Star size={20} style={{ color: '#FACC15', marginBottom: '8px' }} />
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{selectedTemplate.rating}</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B' }}>Avaliacao</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Eye size={20} style={{ color: '#34D399', marginBottom: '8px' }} />
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{Math.round(selectedTemplate.downloads * 2.5).toLocaleString()}</p>
                    <p style={{ fontSize: '12px', color: '#6B6B7B' }}>Visualizacoes</p>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {selectedTemplate.tags.map((tag, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#A855F7', fontSize: '12px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: nicheColors[selectedTemplate.niche] }}
                  >
                    <Edit3 size={18} />
                    Editar no Canva
                  </Button>
                  <button
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#A0A0B0',
                      cursor: 'pointer',
                    }}
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
