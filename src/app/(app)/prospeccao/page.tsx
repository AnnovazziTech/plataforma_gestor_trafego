'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Search,
  Filter,
  Plus,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Star,
  StarOff,
  MoreVertical,
  Send,
  UserPlus,
  Eye,
  TrendingUp,
  Users,
  Target,
  Briefcase,
  X,
  Instagram,
  Facebook,
  Linkedin,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

interface Prospect {
  id: string
  companyName: string
  website: string
  industry: string
  size: string
  location: string
  contactName: string
  contactEmail: string
  contactPhone: string
  socialMedia: {
    instagram?: string
    facebook?: string
    linkedin?: string
  }
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  score: number
  notes: string
  isFavorite: boolean
  createdAt: string
  lastContact?: string
}

// Dados serao carregados do banco de dados via API

const statusConfig = {
  new: { label: 'Novo', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  contacted: { label: 'Contatado', color: '#FACC15', bg: 'rgba(250, 204, 21, 0.1)' },
  qualified: { label: 'Qualificado', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  proposal: { label: 'Proposta', color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
  won: { label: 'Ganho', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  lost: { label: 'Perdido', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

const industries = ['Todas', 'Tecnologia', 'E-commerce', 'Alimentacao', 'Saude', 'Educacao', 'Servicos']

export default function ProspeccaoPage() {
  const { showToast } = useApp()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('Todas')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)

  const [newProspect, setNewProspect] = useState({
    companyName: '',
    website: '',
    industry: 'Tecnologia',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    location: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados da API
  useEffect(() => {
    fetchProspects()
  }, [])

  const fetchProspects = async () => {
    try {
      const response = await fetch('/api/prospects')
      if (response.ok) {
        const data = await response.json()
        setProspects(data)
      }
    } catch (error) {
      console.error('Erro ao carregar prospectos:', error)
      showToast('Erro ao carregar prospectos', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProspects = prospects.filter(p => {
    const matchesSearch = p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === 'Todas' || p.industry === selectedIndustry
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus
    return matchesSearch && matchesIndustry && matchesStatus
  })

  const handleAddProspect = async () => {
    if (!newProspect.companyName.trim()) {
      showToast('Informe o nome da empresa', 'error')
      return
    }

    try {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProspect),
      })

      if (response.ok) {
        const prospect = await response.json()
        setProspects(prev => [prospect, ...prev])
        setShowAddModal(false)
        setNewProspect({
          companyName: '',
          website: '',
          industry: 'Tecnologia',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          location: '',
          notes: '',
        })
        showToast('Prospecto adicionado com sucesso!', 'success')
      } else {
        showToast('Erro ao adicionar prospecto', 'error')
      }
    } catch (error) {
      console.error('Erro ao adicionar prospecto:', error)
      showToast('Erro ao adicionar prospecto', 'error')
    }
  }

  const toggleFavorite = async (id: string) => {
    const prospect = prospects.find(p => p.id === id)
    if (!prospect) return

    try {
      const response = await fetch(`/api/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !prospect.isFavorite }),
      })

      if (response.ok) {
        setProspects(prev => prev.map(p =>
          p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
        ))
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
    }
  }

  const updateStatus = async (id: string, status: Prospect['status']) => {
    try {
      const response = await fetch(`/api/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, lastContactAt: new Date().toISOString() }),
      })

      if (response.ok) {
        setProspects(prev => prev.map(p =>
          p.id === id ? { ...p, status, lastContact: new Date().toISOString().split('T')[0] } : p
        ))
        showToast('Status atualizado!', 'success')
      } else {
        showToast('Erro ao atualizar status', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showToast('Erro ao atualizar status', 'error')
    }
  }

  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    qualified: prospects.filter(p => p.status === 'qualified').length,
    won: prospects.filter(p => p.status === 'won').length,
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Prospeccao"
        subtitle="Encontre e gerencie potenciais clientes"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total de Prospectos" value={stats.total} icon={Users} color="blue" delay={0} />
          <StatCard label="Novos" value={stats.new} icon={Target} color="blue" delay={0.1} />
          <StatCard label="Qualificados" value={stats.qualified} icon={TrendingUp} color="yellow" delay={0.2} />
          <StatCard label="Convertidos" value={stats.won} icon={CheckCircle} color="yellow" delay={0.3} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B6B7B' }} />
              <input
                type="text"
                placeholder="Buscar empresa ou contato..."
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

            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
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
              {industries.map(ind => (
                <option key={ind} value={ind} style={{ backgroundColor: '#12121A' }}>{ind}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              <option value="all" style={{ backgroundColor: '#12121A' }}>Todos Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key} style={{ backgroundColor: '#12121A' }}>{config.label}</option>
              ))}
            </select>
          </div>

          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Novo Prospecto
          </Button>
        </div>

        {/* Prospects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredProspects.map((prospect, index) => (
            <motion.div
              key={prospect.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}>
                    {prospect.companyName.charAt(0)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                        {prospect.companyName}
                      </h3>
                      <Badge variant="default" style={{ backgroundColor: statusConfig[prospect.status].bg, color: statusConfig[prospect.status].color }}>
                        {statusConfig[prospect.status].label}
                      </Badge>
                      <button
                        onClick={() => toggleFavorite(prospect.id)}
                        style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {prospect.isFavorite ? (
                          <Star size={18} style={{ color: '#FACC15', fill: '#FACC15' }} />
                        ) : (
                          <StarOff size={18} style={{ color: '#6B6B7B' }} />
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B7B' }}>
                        <Briefcase size={14} />
                        {prospect.industry}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B7B' }}>
                        <MapPin size={14} />
                        {prospect.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B6B7B' }}>
                        <Users size={14} />
                        {prospect.size}
                      </span>
                      {prospect.website && (
                        <a
                          href={`https://${prospect.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#3B82F6', textDecoration: 'none' }}
                        >
                          <Globe size={14} />
                          {prospect.website}
                        </a>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Contato</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{prospect.contactName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Email</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{prospect.contactEmail}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Telefone</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0 }}>{prospect.contactPhone}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '0 0 4px' }}>Score</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: prospect.score >= 80 ? '#10B981' : prospect.score >= 50 ? '#FACC15' : '#EF4444', margin: 0 }}>
                          {prospect.score}/100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={prospect.status}
                    onChange={(e) => updateStatus(prospect.id, e.target.value as Prospect['status'])}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key} style={{ backgroundColor: '#12121A' }}>{config.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      window.open(`mailto:${prospect.contactEmail}`, '_blank')
                      showToast('Abrindo email...', 'info')
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: 'none',
                      color: '#3B82F6',
                      cursor: 'pointer',
                    }}
                    title="Enviar Email"
                  >
                    <Mail size={16} />
                  </button>

                  <button
                    onClick={() => {
                      window.open(`https://wa.me/55${prospect.contactPhone.replace(/\D/g, '')}`, '_blank')
                      showToast('Abrindo WhatsApp...', 'info')
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: 'none',
                      color: '#10B981',
                      cursor: 'pointer',
                    }}
                    title="WhatsApp"
                  >
                    <Send size={16} />
                  </button>

                  <button
                    onClick={() => setSelectedProspect(prospect)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      color: '#6B6B7B',
                      cursor: 'pointer',
                    }}
                    title="Ver Detalhes"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {prospect.notes && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  <p style={{ fontSize: '13px', color: '#A0A0B0', margin: 0 }}>{prospect.notes}</p>
                </div>
              )}
            </motion.div>
          ))}

          {filteredProspects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Search size={48} style={{ color: '#6B6B7B', marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', color: '#6B6B7B' }}>Nenhum prospecto encontrado</p>
              <p style={{ fontSize: '14px', color: '#4B4B5B' }}>Tente ajustar os filtros ou adicione um novo prospecto</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Adicionar Prospecto */}
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
                maxWidth: '550px',
                maxHeight: '90vh',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <UserPlus size={20} style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Novo Prospecto</h2>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Adicione um potencial cliente</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Nome da Empresa *</label>
                  <input
                    type="text"
                    value={newProspect.companyName}
                    onChange={(e) => setNewProspect(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Ex: Tech Solutions"
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Website</label>
                    <input
                      type="text"
                      value={newProspect.website}
                      onChange={(e) => setNewProspect(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="www.exemplo.com.br"
                      style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Segmento</label>
                    <select
                      value={newProspect.industry}
                      onChange={(e) => setNewProspect(prev => ({ ...prev, industry: e.target.value }))}
                      style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    >
                      {industries.slice(1).map(ind => (
                        <option key={ind} value={ind} style={{ backgroundColor: '#12121A' }}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Nome do Contato</label>
                  <input
                    type="text"
                    value={newProspect.contactName}
                    onChange={(e) => setNewProspect(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Ex: Joao Silva"
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Email</label>
                    <input
                      type="email"
                      value={newProspect.contactEmail}
                      onChange={(e) => setNewProspect(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="email@empresa.com"
                      style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Telefone</label>
                    <input
                      type="tel"
                      value={newProspect.contactPhone}
                      onChange={(e) => setNewProspect(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Localizacao</label>
                  <input
                    type="text"
                    value={newProspect.location}
                    onChange={(e) => setNewProspect(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Sao Paulo, SP"
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Observacoes</label>
                  <textarea
                    value={newProspect.notes}
                    onChange={(e) => setNewProspect(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Informacoes adicionais sobre o prospecto..."
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button variant="ghost" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleAddProspect} style={{ flex: 1 }}>
                    Adicionar Prospecto
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
