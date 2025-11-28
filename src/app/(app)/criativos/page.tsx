'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Palette,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Grid,
  List,
  Filter,
  Heart,
  Eye,
  Copy,
  Check,
  Plus,
  Sparkles,
  Image,
  Video,
  FileText,
  Calendar,
  Tag,
  Bookmark,
  Chrome,
  ArrowRight,
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
    <div className="min-h-screen">
      <Header
        title="Criativos"
        subtitle="Biblioteca de anúncios salvos"
        showCreateButton={false}
      />

      <main className="p-6 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        {/* Extensão Banner */}
        {!extensionInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/30 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <Chrome size={28} className="text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Instale nossa Extensão</h3>
                  <p className="text-sm text-[#A0A0B0]">
                    Com a extensão, você pode salvar anúncios diretamente da Biblioteca do Facebook
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  className="gap-2"
                  onClick={() => {
                    setExtensionInstalled(true)
                    showToast('Extensão instalada!', 'success')
                  }}
                >
                  <Download size={16} />
                  Instalar Extensão
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={handleMinerar}
                >
                  <Sparkles size={16} />
                  Minerar Agora
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B7B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar criativos..."
                className="h-11 pl-10 pr-4 w-64 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]/50"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
            >
              <option value="all">Todos os Tipos</option>
              <option value="image">Imagens</option>
              <option value="video">Vídeos</option>
              <option value="carousel">Carrosséis</option>
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50"
            >
              <option value="all">Todas Plataformas</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#6B6B7B] hover:text-white'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#6B6B7B] hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>

            {extensionInstalled && (
              <Button variant="primary" className="gap-2" onClick={handleMinerar}>
                <Sparkles size={16} />
                Minerar
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredCreatives.map((creative, index) => {
                const TypeIcon = typeIcons[creative.type]
                return (
                  <motion.div
                    key={creative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-2xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 overflow-hidden transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-[#1A1A25] overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                        <TypeIcon size={48} className="text-[#6B6B7B]" />
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge variant={creative.type === 'video' ? 'warning' : 'info'}>
                          {creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Vídeo' : 'Carrossel'}
                        </Badge>
                      </div>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(creative)}
                          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                          title="Baixar"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleCopy(creative.id, creative.url)}
                          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                          title="Copiar Link"
                        >
                          {copiedId === creative.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button
                          onClick={() => window.open(creative.url, '_blank')}
                          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                          title="Ver Original"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(creative.id)}
                          className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{creative.title}</h3>
                      <p className="text-xs text-[#6B6B7B] mb-3">{creative.advertiser}</p>

                      <div className="flex items-center justify-between text-xs text-[#6B6B7B]">
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {creative.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(creative.savedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {creative.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-[#A0A0B0]"
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
              className="space-y-3"
            >
              {filteredCreatives.map((creative, index) => {
                const TypeIcon = typeIcons[creative.type]
                return (
                  <motion.div
                    key={creative.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-4 rounded-xl bg-[#12121A]/80 border border-white/5 hover:border-[#3B82F6]/30 transition-all flex items-center gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-[#1A1A25] flex items-center justify-center flex-shrink-0">
                      <TypeIcon size={24} className="text-[#6B6B7B]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">{creative.title}</h3>
                        <Badge variant={creative.type === 'video' ? 'warning' : 'info'} className="flex-shrink-0">
                          {creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Vídeo' : 'Carrossel'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#6B6B7B]">
                        {creative.advertiser} • {creative.platform} • {creative.likes.toLocaleString()} likes
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleDownload(creative)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleCopy(creative.id, creative.url)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-all"
                      >
                        {copiedId === creative.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(creative.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#6B6B7B] hover:text-red-400 transition-all"
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
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Palette className="w-8 h-8 text-[#6B6B7B]" />
            </div>
            <p className="text-sm text-[#6B6B7B] mb-2">Nenhum criativo encontrado</p>
            <p className="text-xs text-[#4B4B5B]">
              {extensionInstalled ? 'Clique em "Minerar" para buscar novos anúncios' : 'Instale a extensão para começar a salvar anúncios'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
