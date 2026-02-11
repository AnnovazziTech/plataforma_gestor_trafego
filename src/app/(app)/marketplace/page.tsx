'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Download,
  ExternalLink,
  Heart,
  Tag,
  Zap,
  FileText,
  Image,
  Video,
  Code,
  Palette,
  BarChart3,
  Bot,
  Megaphone,
  Users,
  CheckCircle,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  downloads: number
  icon: string
  features: string[]
  isFeatured: boolean
  isNew: boolean
  isPurchased: boolean
}

// Dados serao carregados do banco de dados via API

const categories = ['Todos', 'Copys', 'Templates', 'Planilhas', 'Scripts', 'Automação', 'Vídeos']

const iconMap: Record<string, any> = {
  FileText,
  Palette,
  BarChart3,
  Megaphone,
  Bot,
  Video,
  Image,
  Code,
}

export default function MarketplacePage() {
  const { showToast } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price'>('popular')
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      const categoryParam = selectedCategory !== 'Todos' ? `?category=${selectedCategory}` : ''
      const response = await fetch(`/api/products${categoryParam}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.downloads - a.downloads
      if (sortBy === 'price') return a.price - b.price
      return 0
    })

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const handlePurchase = async (product: Product) => {
    if (product.isPurchased) {
      showToast('Acessando produto...', 'info')
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}/purchase`, {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          showToast('Produto adquirido com sucesso!', 'success')
          fetchProducts()
        }
      } else {
        showToast('Erro ao processar compra', 'error')
      }
    } catch (error) {
      showToast('Erro ao processar compra', 'error')
    }
  }

  const featuredProducts = products.filter(p => p.isFeatured)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Marketplace"
        subtitle="Recursos e ferramentas para gestores de tráfego"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '32px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Badge variant="info" style={{ marginBottom: '12px' }}>Destaque</Badge>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
                Pack Completo do Gestor de Tráfego
              </h2>
              <p style={{ fontSize: '16px', color: '#A0A0B0', margin: '0 0 16px', maxWidth: '500px' }}>
                Todos os recursos que você precisa em um único pack: copys, templates, planilhas e scripts
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>R$ 197</span>
                <span style={{ fontSize: '18px', color: '#6B6B7B', textDecoration: 'line-through' }}>R$ 497</span>
                <Badge variant="success">60% OFF</Badge>
              </div>
            </div>
            <Button variant="primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
              <ShoppingCart size={20} style={{ marginRight: '8px' }} />
              Comprar Agora
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B6B7B' }} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: selectedCategory === cat ? '#3B82F6' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === cat ? '#FFFFFF' : '#A0A0B0',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              height: '44px',
              padding: '0 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="popular" style={{ backgroundColor: '#12121A' }}>Mais Populares</option>
            <option value="recent" style={{ backgroundColor: '#12121A' }}>Mais Recentes</option>
            <option value="price" style={{ backgroundColor: '#12121A' }}>Menor Preço</option>
          </select>
        </div>

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {filteredProducts.map((product, index) => {
            const IconComponent = iconMap[product.icon] || FileText
            const isFavorite = favorites.includes(product.id)

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  borderRadius: '16px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  overflow: 'hidden',
                }}
              >
                {/* Product Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComponent size={24} style={{ color: '#3B82F6' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {product.isNew && <Badge variant="info">Novo</Badge>}
                      {product.isPurchased && <Badge variant="success">Comprado</Badge>}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Heart size={18} style={{ color: isFavorite ? '#EF4444' : '#6B6B7B', fill: isFavorite ? '#EF4444' : 'none' }} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px' }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0, lineHeight: 1.5 }}>
                    {product.description}
                  </p>
                </div>

                {/* Features */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.features.slice(0, 3).map((feature, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '12px',
                          color: '#A0A0B0',
                        }}
                      >
                        <CheckCircle size={12} style={{ color: '#10B981' }} />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats & Price */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#FACC15' }}>
                        <Star size={14} fill="#FACC15" />
                        {product.rating}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6B6B7B' }}>
                        {product.reviews} avaliações
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6B6B7B' }}>
                        <Download size={14} />
                        {product.downloads}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>R$ {product.price}</span>
                      {product.originalPrice && (
                        <span style={{ fontSize: '14px', color: '#6B6B7B', textDecoration: 'line-through' }}>
                          R$ {product.originalPrice}
                        </span>
                      )}
                    </div>
                    <Button
                      variant={product.isPurchased ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handlePurchase(product)}
                    >
                      {product.isPurchased ? (
                        <>
                          <ExternalLink size={14} style={{ marginRight: '6px' }} />
                          Acessar
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} style={{ marginRight: '6px' }} />
                          Comprar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <ShoppingCart size={48} style={{ color: '#6B6B7B', marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', color: '#6B6B7B' }}>Nenhum produto encontrado</p>
            <p style={{ fontSize: '14px', color: '#4B4B5B' }}>Tente ajustar os filtros de busca</p>
          </div>
        )}
      </main>
    </div>
  )
}
