'use client'

import { useState, ReactNode, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PlatformIcon, StatCard } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  Users,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Eye,
  Share2,
  Copy,
  Check,
  X,
  CalendarClock,
  MessageCircle,
} from 'lucide-react'
import { Report, Platform } from '@/types'

const reportTypeLabels: Record<string, string> = {
  performance: 'Performance',
  audience: 'Audiência',
  creative: 'Criativos',
  custom: 'Personalizado',
}

const reportTypeIcons: Record<string, ReactNode> = {
  performance: <BarChart3 size={18} />,
  audience: <Users size={18} />,
  creative: <PieChart size={18} />,
  custom: <Target size={18} />,
}

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Personalizado',
}

const metricsOptions = [
  { id: 'impressions', label: 'Impressões' },
  { id: 'clicks', label: 'Cliques' },
  { id: 'ctr', label: 'CTR' },
  { id: 'cpc', label: 'CPC' },
  { id: 'conversions', label: 'Conversões' },
  { id: 'investment', label: 'Investimento' },
  { id: 'roas', label: 'ROAS' },
  { id: 'cpa', label: 'CPA' },
  { id: 'reach', label: 'Alcance' },
  { id: 'frequency', label: 'Frequência' },
]

export default function ReportsPage() {
  const { connectedAccounts, showToast, reports, deleteReport, fetchReports } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledReports, setScheduledReports] = useState<any[]>([])
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Use reports from context with fallback to empty array
  const reportsData = useMemo(() => reports || [], [reports])

  const handleEditReport = (report: Report) => {
    setEditingReport(report)
  }

  const handleSaveEdit = async () => {
    if (!editingReport) return
    try {
      // Atualizar via API
      const response = await fetch(`/api/reports/${editingReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingReport.name,
          status: editingReport.status.toUpperCase(),
        }),
      })
      if (response.ok) {
        await fetchReports()
        showToast('Relatório atualizado com sucesso!', 'success')
      }
    } catch (error) {
      showToast('Erro ao atualizar relatório', 'error')
    }
    setEditingReport(null)
  }

  const handleDeleteReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
      if (response.ok) {
        deleteReport(id)
        showToast('Relatório excluído!', 'success')
      }
    } catch (error) {
      showToast('Erro ao excluir relatório', 'error')
    }
    setShowDeleteConfirm(null)
  }

  const handleToggleStatus = async (id: string) => {
    const report = reportsData.find(r => r.id === id)
    if (!report) return
    try {
      const newStatus = report.status === 'active' ? 'PAUSED' : 'ACTIVE'
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        await fetchReports()
        showToast('Status atualizado!', 'success')
      }
    } catch (error) {
      showToast('Erro ao atualizar status', 'error')
    }
  }

  const handleDownload = (report: Report) => {
    showToast(`Gerando PDF: ${report.name}...`, 'info')
    // Simular download
    setTimeout(() => {
      showToast('PDF gerado com sucesso!', 'success')
    }, 1500)
  }

  const handleShare = (report: Report) => {
    showToast('Link copiado para área de transferência!', 'success')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Relatórios"
        subtitle="Crie e gerencie relatórios automatizados"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard
            label="Relatórios Ativos"
            value={reportsData.filter(r => r.status === 'active').length}
            icon={FileText}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Gerados Este Mês"
            value={24}
            icon={Download}
            color="yellow"
            delay={0.1}
          />
          <StatCard
            label="Destinatários"
            value={8}
            icon={Mail}
            color="blue"
            delay={0.2}
          />
          <StatCard
            label="Programados"
            value={scheduledReports.length}
            icon={CalendarClock}
            color="yellow"
            delay={0.3}
          />
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Meus Relatórios</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="secondary" onClick={() => setShowScheduleModal(true)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarClock size={18} />
                Programar
              </span>
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} />
                Novo Relatório
              </span>
            </Button>
          </div>
        </div>

        {/* Reports Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {reportsData.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report as unknown as Report}
              index={index}
              onEdit={handleEditReport}
              onDelete={(id) => setShowDeleteConfirm(id)}
              onToggleStatus={handleToggleStatus}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          ))}

          {/* Create New Report Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reportsData.length * 0.1 }}
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              cursor: 'pointer',
              minHeight: '280px',
              transition: 'all 0.2s',
            }}
            whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
          >
            <div style={{
              padding: '16px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}>
              <Plus size={24} style={{ color: '#6B6B7B' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>Criar Novo Relatório</p>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Configure relatórios automáticos</p>
            </div>
          </motion.div>
        </div>

        {/* Report Templates */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>Templates Disponíveis</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingBottom: '32px' }}>
            {[
              { name: 'Performance Semanal', description: 'Métricas de performance completas', icon: TrendingUp, color: 'blue' },
              { name: 'Análise de Audiência', description: 'Demografia e comportamento', icon: Users, color: 'blue' },
              { name: 'ROI por Plataforma', description: 'Comparativo de retorno', icon: BarChart3, color: 'yellow' },
              { name: 'Criativos Top', description: 'Melhores anúncios e copies', icon: Eye, color: 'yellow' },
            ].map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: 'fit-content',
                  backgroundColor: template.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                  color: template.color === 'blue' ? '#3B82F6' : '#FACC15',
                }}>
                  <template.icon size={20} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {template.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{template.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Criar Relatório */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        connectedAccounts={connectedAccounts}
      />

      {/* Modal Programar Relatório */}
      <ScheduleReportModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false)
          setEditingSchedule(null)
        }}
        connectedAccounts={connectedAccounts}
        scheduledReports={scheduledReports}
        onSave={(schedule) => {
          if (editingSchedule) {
            setScheduledReports(prev => prev.map(s => s.id === editingSchedule.id ? { ...schedule, id: editingSchedule.id } : s))
          } else {
            setScheduledReports(prev => [...prev, { ...schedule, id: Date.now().toString() }])
          }
          setEditingSchedule(null)
          showToast('Relatório programado com sucesso!', 'success')
        }}
        onEdit={(schedule) => setEditingSchedule(schedule)}
        onDelete={(id) => {
          setScheduledReports(prev => prev.filter(s => s.id !== id))
          showToast('Programação removida!', 'info')
        }}
        editingSchedule={editingSchedule}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
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
                maxWidth: '400px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Trash2 size={24} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Excluir Relatório</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: '4px 0 0' }}>Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#A0A0B0', marginBottom: '24px', lineHeight: '1.6' }}>
                Tem certeza que deseja excluir este relatório? Ele será removido permanentemente.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <button
                  onClick={() => handleDeleteReport(showDeleteConfirm)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingReport(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
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
                maxWidth: '500px',
                background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Edit size={20} style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Editar Relatório</h2>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Atualize os dados do relatório</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingReport(null)}
                  style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Nome</label>
                  <input
                    type="text"
                    value={editingReport.name}
                    onChange={(e) => setEditingReport({ ...editingReport, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Status</label>
                  <select
                    value={editingReport.status}
                    onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value as 'active' | 'paused' })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="active" style={{ backgroundColor: '#12121A' }}>Ativo</option>
                    <option value="paused" style={{ backgroundColor: '#12121A' }}>Pausado</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setEditingReport(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CreateReportModal({ isOpen, onClose, connectedAccounts }: { isOpen: boolean; onClose: () => void; connectedAccounts: any[] }) {
  const { showToast } = useApp()
  const [formData, setFormData] = useState({
    account: '',
    platform: '',
    startDate: '',
    endDate: '',
    name: '',
    metrics: [] as string[],
  })

  const handleMetricToggle = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }))
  }

  const handleExport = (type: 'email' | 'whatsapp' | 'download') => {
    if (!formData.name || !formData.account || !formData.platform || !formData.startDate || !formData.endDate) {
      showToast('Preencha todos os campos obrigatórios', 'error')
      return
    }
    if (formData.metrics.length === 0) {
      showToast('Selecione pelo menos uma métrica', 'error')
      return
    }

    const messages = {
      email: 'Relatório enviado por e-mail!',
      whatsapp: 'Relatório enviado por WhatsApp!',
      download: 'Relatório baixado com sucesso!'
    }
    showToast(messages[type], 'success')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              maxWidth: '672px',
              background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}>
                  <FileText style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Criar Novo Relatório</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure os detalhes do relatório</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#6B6B7B',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Conta de anúncios */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Conta de Anúncios *</label>
                <select
                  value={formData.account}
                  onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
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
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ backgroundColor: '#12121A' }}>Selecione uma conta</option>
                  {connectedAccounts.filter(a => a.connected).map((account) => (
                    <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plataforma */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Plataforma Ads *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {['meta', 'google', 'linkedin', 'tiktok'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setFormData(prev => ({ ...prev, platform }))}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: formData.platform === platform ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: formData.platform === platform ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <PlatformIcon platform={platform as Platform} size={24} />
                      <span style={{ fontSize: '12px', color: '#FFFFFF', textTransform: 'capitalize' }}>
                        {platform === 'meta' ? 'Meta Ads' : `${platform} Ads`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Datas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Data Início *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Data Fim *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
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

              {/* Nome do Relatório */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Nome do Relatório *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório Mensal - Cliente X"
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

              {/* Métricas */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Métricas do Relatório</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {metricsOptions.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricToggle(metric.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: formData.metrics.includes(metric.id) ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: formData.metrics.includes(metric.id) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: formData.metrics.includes(metric.id) ? '#3B82F6' : '#A0A0B0',
                        cursor: 'pointer',
                      }}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="secondary" onClick={() => handleExport('email')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} />
                    Enviar E-mail
                  </span>
                </Button>
                <Button variant="secondary" onClick={() => handleExport('whatsapp')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={16} />
                    WhatsApp
                  </span>
                </Button>
                <Button variant="primary" onClick={() => handleExport('download')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} />
                    Baixar PDF
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScheduleReportModal({
  isOpen,
  onClose,
  connectedAccounts,
  scheduledReports,
  onSave,
  onEdit,
  onDelete,
  editingSchedule
}: {
  isOpen: boolean
  onClose: () => void
  connectedAccounts: any[]
  scheduledReports: any[]
  onSave: (schedule: any) => void
  onEdit: (schedule: any) => void
  onDelete: (id: string) => void
  editingSchedule: any | null
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    account: '',
    platform: '',
    startDate: '',
    endDate: '',
    name: '',
    metrics: [] as string[],
    days: [] as number[],
    months: [] as number[],
    sendMethod: 'email' as 'email' | 'whatsapp',
    recipient: '',
  })

  const handleMetricToggle = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }))
  }

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const handleMonthToggle = (month: number) => {
    setFormData(prev => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter(m => m !== month)
        : [...prev.months, month]
    }))
  }

  const handleSave = () => {
    onSave(formData)
    setShowForm(false)
    setFormData({
      account: '',
      platform: '',
      startDate: '',
      endDate: '',
      name: '',
      metrics: [],
      days: [],
      months: [],
      sendMethod: 'email',
      recipient: '',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              maxWidth: '768px',
              background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(250, 204, 21, 0.1)',
                }}>
                  <CalendarClock style={{ width: '20px', height: '20px', color: '#FACC15' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Programar Relatórios</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure envios automáticos para seus clientes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#6B6B7B',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {!showForm && !editingSchedule ? (
                <>
                  {/* Lista de relatórios programados */}
                  {scheduledReports.length > 0 ? (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>Relatórios Programados</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {scheduledReports.map((schedule) => (
                          <div
                            key={schedule.id}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{schedule.name}</p>
                              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
                                Dias: {schedule.days.join(', ')} | Via {schedule.sendMethod === 'email' ? 'E-mail' : 'WhatsApp'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => onEdit(schedule)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: 'none',
                                  color: '#6B6B7B',
                                  cursor: 'pointer',
                                }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => onDelete(schedule.id)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: 'none',
                                  color: '#6B6B7B',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
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
                        <CalendarClock style={{ width: '32px', height: '32px', color: '#6B6B7B' }} />
                      </div>
                      <p style={{ fontSize: '14px', color: '#6B6B7B', marginBottom: '8px' }}>Nenhum relatório programado</p>
                      <p style={{ fontSize: '12px', color: '#4B4B5B', margin: 0 }}>Crie sua primeira programação de envio automático</p>
                    </div>
                  )}

                  <Button variant="primary" onClick={() => setShowForm(true)} style={{ width: '100%' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Plus size={18} />
                      Criar Programação
                    </span>
                  </Button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Formulário de programação */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Nome da Programação *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Relatório Semanal - Cliente X"
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Conta de Anúncios</label>
                      <select
                        value={formData.account}
                        onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
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
                          appearance: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="" style={{ backgroundColor: '#12121A' }}>Selecione</option>
                        {connectedAccounts.filter(a => a.connected).map((account) => (
                          <option key={account.id} value={account.id} style={{ backgroundColor: '#12121A' }}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Plataforma</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
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
                          appearance: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="" style={{ backgroundColor: '#12121A' }}>Selecione</option>
                        <option value="meta" style={{ backgroundColor: '#12121A' }}>Meta Ads</option>
                        <option value="google" style={{ backgroundColor: '#12121A' }}>Google Ads</option>
                        <option value="linkedin" style={{ backgroundColor: '#12121A' }}>LinkedIn Ads</option>
                        <option value="tiktok" style={{ backgroundColor: '#12121A' }}>TikTok Ads</option>
                      </select>
                    </div>
                  </div>

                  {/* Dias do mês */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Dias do Mês para Envio</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[1, 5, 10, 15, 20, 25, 30].map((day) => (
                        <button
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            border: formData.days.includes(day) ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: formData.days.includes(day) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: formData.days.includes(day) ? '#3B82F6' : '#A0A0B0',
                            cursor: 'pointer',
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meses */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Meses para Envio</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, idx) => (
                        <button
                          key={month}
                          onClick={() => handleMonthToggle(idx + 1)}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: formData.months.includes(idx + 1) ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: formData.months.includes(idx + 1) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: formData.months.includes(idx + 1) ? '#3B82F6' : '#A0A0B0',
                            cursor: 'pointer',
                          }}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Métricas</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {metricsOptions.slice(0, 5).map((metric) => (
                        <button
                          key={metric.id}
                          onClick={() => handleMetricToggle(metric.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: formData.metrics.includes(metric.id) ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: formData.metrics.includes(metric.id) ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: formData.metrics.includes(metric.id) ? '#FACC15' : '#A0A0B0',
                            cursor: 'pointer',
                          }}
                        >
                          {metric.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Método de envio */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>Enviar Via</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, sendMethod: 'email' }))}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: formData.sendMethod === 'email' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: formData.sendMethod === 'email' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <Mail size={20} style={{ color: formData.sendMethod === 'email' ? '#3B82F6' : '#6B6B7B' }} />
                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>E-mail</span>
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, sendMethod: 'whatsapp' }))}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: formData.sendMethod === 'whatsapp' ? '1px solid rgba(37, 211, 102, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: formData.sendMethod === 'whatsapp' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <MessageCircle size={20} style={{ color: formData.sendMethod === 'whatsapp' ? '#25D366' : '#6B6B7B' }} />
                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Destinatário */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                      {formData.sendMethod === 'email' ? 'E-mail do Destinatário' : 'WhatsApp do Destinatário'}
                    </label>
                    <input
                      type={formData.sendMethod === 'email' ? 'email' : 'tel'}
                      value={formData.recipient}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder={formData.sendMethod === 'email' ? 'cliente@email.com' : '+55 11 99999-9999'}
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
              )}
            </div>

            {/* Footer */}
            {(showForm || editingSchedule) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}>
                <Button variant="ghost" onClick={() => {
                  setShowForm(false)
                  onClose()
                }}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarClock size={16} />
                    Programar
                  </span>
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ReportCard({
  report,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
  onDownload,
  onShare,
}: {
  report: Report
  index: number
  onEdit: (report: Report) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onDownload: (report: Report) => void
  onShare: (report: Report) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    onShare(report)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            backgroundColor: report.type === 'performance' ? 'rgba(59, 130, 246, 0.1)' :
              report.type === 'audience' ? 'rgba(96, 165, 250, 0.1)' :
              report.type === 'creative' ? 'rgba(250, 204, 21, 0.1)' :
              'rgba(253, 224, 71, 0.1)',
            color: report.type === 'performance' ? '#3B82F6' :
              report.type === 'audience' ? '#60A5FA' :
              report.type === 'creative' ? '#FACC15' :
              '#FDE047',
          }}>
            {reportTypeIcons[report.type]}
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              {report.name}
            </h3>
            <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{reportTypeLabels[report.type]}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={report.status === 'active' ? 'success' : 'warning'}>
            {report.status === 'active' ? 'Ativo' : 'Pausado'}
          </Badge>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: '#6B6B7B',
                cursor: 'pointer',
              }}
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    width: '160px',
                    backgroundColor: '#1A1A25',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onEdit(report)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Edit size={14} style={{ color: '#3B82F6' }} />
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onDownload(report)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Download size={14} style={{ color: '#10B981' }} />
                    Baixar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onShare(report)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Share2 size={14} style={{ color: '#A855F7' }} />
                    Compartilhar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onToggleStatus(report.id)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {report.status === 'active' ? (
                      <>
                        <Pause size={14} style={{ color: '#FACC15' }} />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play size={14} style={{ color: '#34D399' }} />
                        Ativar
                      </>
                    )}
                  </button>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onDelete(report.id)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B6B7B' }}>
          <Clock size={12} />
          <span>Frequência: {frequencyLabels[report.frequency]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B6B7B' }}>
          <Calendar size={12} />
          <span>
            {new Date(report.dateRange.start).toLocaleDateString('pt-BR')} - {new Date(report.dateRange.end).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B6B7B' }}>
          <Mail size={12} />
          <span>{report.recipients.length} destinatário(s)</span>
        </div>
      </div>

      {/* Platforms */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {report.platforms.map((platform) => (
          <div key={platform} style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <PlatformIcon platform={platform} size={14} />
          </div>
        ))}
      </div>

      {/* Last Generated */}
      {report.lastGenerated && (
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Última geração</span>
            <span style={{ fontSize: '12px', color: '#FFFFFF' }}>
              {new Date(report.lastGenerated).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
        <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => onDownload(report)}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Download size={14} />
            Baixar
          </span>
        </Button>
        <button
          onClick={handleCopy}
          style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: copied ? '#10B981' : '#6B6B7B',
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </motion.div>
  )
}
