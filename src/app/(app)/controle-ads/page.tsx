'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout'
import { StrategyCard } from '@/components/controle-ads/StrategyCard'
import { BudgetCampaignsTable } from '@/components/controle-ads/BudgetCampaignsTable'
import { LeadCostChart } from '@/components/charts/LeadCostChart'
import { PlatformDistributionChart } from '@/components/charts/PlatformDistributionChart'
import { PlatformCostBenefitChart } from '@/components/charts/PlatformCostBenefitChart'
import { useApp } from '@/contexts'
import { formatCurrency, formatDate } from '@/lib/utils/financial'
import { Plus, Loader2, X, Target, FileDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ControleAdsPage() {
  const {
    budgetStrategies, fetchBudgetStrategies, addBudgetStrategy, updateBudgetStrategy, removeBudgetStrategy,
    budgetCampaigns, fetchBudgetCampaigns, addBudgetCampaign, updateBudgetCampaign, removeBudgetCampaign,
    budgetStrategiesLoading, showToast,
  } = useApp()

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [selectedClientFilter, setSelectedClientFilter] = useState('')
  const [showStrategyModal, setShowStrategyModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingStrategy, setEditingStrategy] = useState<any>(null)

  const [strategyForm, setStrategyForm] = useState({ clientId: '', name: '', totalBudget: '' })
  const [campaignForm, setCampaignForm] = useState({
    clientId: '', strategyId: '', name: '',
    maxMeta: '', maxGoogle: '', dailyBudget: '', startDate: new Date().toISOString().split('T')[0],
    spentMeta: '', spentGoogle: '', currentLeadCost: '', previousLeadCost: '',
  })

  const emptyCampaignForm = {
    clientId: '', strategyId: '', name: '',
    maxMeta: '', maxGoogle: '', dailyBudget: '', startDate: new Date().toISOString().split('T')[0],
    spentMeta: '', spentGoogle: '', currentLeadCost: '', previousLeadCost: '',
  }

  useEffect(() => {
    Promise.all([
      fetchBudgetStrategies(),
      fetchBudgetCampaigns(),
      fetch('/api/clients').then(r => r.json()).then(data => {
        setClients(Array.isArray(data) ? data : data.clients || [])
      }),
    ]).finally(() => setIsLoading(false))
  }, [])

  const filteredStrategies = selectedClientFilter
    ? budgetStrategies.filter(s => s.clientId === selectedClientFilter)
    : budgetStrategies

  const filteredCampaigns = selectedStrategy
    ? budgetCampaigns.filter(c => c.strategyId === selectedStrategy)
    : selectedClientFilter
      ? budgetCampaigns.filter(c => c.clientId === selectedClientFilter)
      : budgetCampaigns

  const openAddStrategy = () => {
    setEditingStrategy(null)
    setStrategyForm({ clientId: '', name: '', totalBudget: '' })
    setShowStrategyModal(true)
  }

  const openEditStrategy = (s: any) => {
    setEditingStrategy(s)
    setStrategyForm({
      clientId: s.clientId || s.client?.id || '',
      name: s.name,
      totalBudget: s.totalBudget.toString(),
    })
    setShowStrategyModal(true)
  }

  const handleSubmitStrategy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingStrategy) {
      await updateBudgetStrategy(editingStrategy.id, {
        name: strategyForm.name,
        totalBudget: parseFloat(strategyForm.totalBudget),
      })
      setShowStrategyModal(false)
    } else {
      const result = await addBudgetStrategy({
        clientId: strategyForm.clientId,
        name: strategyForm.name,
        totalBudget: parseFloat(strategyForm.totalBudget),
      })
      if (result) {
        setShowStrategyModal(false)
        setStrategyForm({ clientId: '', name: '', totalBudget: '' })
      }
    }
  }

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addBudgetCampaign({
      clientId: campaignForm.clientId,
      strategyId: campaignForm.strategyId,
      name: campaignForm.name,
      maxMeta: parseFloat(campaignForm.maxMeta) || 0,
      maxGoogle: parseFloat(campaignForm.maxGoogle) || 0,
      dailyBudget: parseFloat(campaignForm.dailyBudget) || 0,
      startDate: campaignForm.startDate,
      spentMeta: parseFloat(campaignForm.spentMeta) || 0,
      spentGoogle: parseFloat(campaignForm.spentGoogle) || 0,
      currentLeadCost: campaignForm.currentLeadCost ? parseFloat(campaignForm.currentLeadCost) : undefined,
      previousLeadCost: campaignForm.previousLeadCost ? parseFloat(campaignForm.previousLeadCost) : undefined,
    })
    if (result) {
      setShowCampaignModal(false)
      setCampaignForm(emptyCampaignForm)
    }
  }

  const handleExportPDF = () => {
    const campaigns = filteredCampaigns
    if (campaigns.length === 0) {
      showToast('Nenhuma campanha para exportar', 'error')
      return
    }

    const totalMeta = campaigns.reduce((s, c) => s + c.spentMeta, 0)
    const totalGoogle = campaigns.reduce((s, c) => s + c.spentGoogle, 0)
    const totalBudget = campaigns.reduce((s, c) => s + c.maxMeta + c.maxGoogle, 0)

    const rows = campaigns.map(c => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${formatCurrency(c.maxMeta)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${formatCurrency(c.maxGoogle)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;color:${c.spentMeta > c.maxMeta ? '#EF4444' : '#10B981'}">${formatCurrency(c.spentMeta)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right;color:${c.spentGoogle > c.maxGoogle ? '#EF4444' : '#10B981'}">${formatCurrency(c.spentGoogle)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${formatCurrency(c.dailyBudget)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${c.currentLeadCost != null ? formatCurrency(c.currentLeadCost) : '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${formatDate(c.startDate)}</td>
      </tr>
    `).join('')

    const html = `
      <html><head><title>Relatório Controle ADS</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{text-align:center;font-size:24px;margin-bottom:4px}
      .sub{text-align:center;color:#666;font-size:13px;margin-bottom:30px}
      .summary{display:flex;justify-content:center;gap:20px;margin-bottom:30px}
      .summary-box{padding:12px 24px;border-radius:8px;text-align:center;color:#fff;font-weight:700;font-size:15px}
      .summary-label{font-size:11px;font-weight:400;opacity:0.9;display:block;margin-bottom:4px}
      table{width:100%;border-collapse:collapse}
      th{padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;background:#f5f5f5;border-bottom:2px solid #ddd}
      th.right{text-align:right}
      </style></head><body>
      <h1>Relatório Controle ADS</h1>
      <div class="sub">Gerado em: ${formatDate(new Date().toISOString())} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="summary">
        <div class="summary-box" style="background:#0081FB"><span class="summary-label">Gasto Meta</span>${formatCurrency(totalMeta)}</div>
        <div class="summary-box" style="background:#4285F4"><span class="summary-label">Gasto Google</span>${formatCurrency(totalGoogle)}</div>
        <div class="summary-box" style="background:#3B82F6"><span class="summary-label">Orçamento Total</span>${formatCurrency(totalBudget)}</div>
      </div>
      <table>
        <thead><tr>
          <th>Campanha</th><th class="right">Max Meta</th><th class="right">Max Google</th>
          <th class="right">Gasto Meta</th><th class="right">Gasto Google</th>
          <th class="right">Diário</th><th class="right">Custo/Lead</th><th>Início</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </body></html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF', fontSize: '14px', outline: 'none',
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Controle ADS" subtitle="Gerencie orçamentos e estratégias" variant="simple" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Controle ADS" subtitle="Gerencie orçamentos e estratégias" variant="simple" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Filters & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedClientFilter}
              onChange={e => { setSelectedClientFilter(e.target.value); setSelectedStrategy(null); }}
              style={{
                padding: '8px 12px', borderRadius: '10px',
                backgroundColor: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFF', fontSize: '13px', outline: 'none',
              }}
            >
              <option value="">Todos os clientes</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExportPDF}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'transparent',
                color: '#A0A0B0', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <FileDown size={14} /> Exportar PDF
            </button>
            <button
              onClick={openAddStrategy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)',
                backgroundColor: 'rgba(59,130,246,0.1)',
                color: '#3B82F6', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Estratégia
            </button>
            <button
              onClick={() => { setCampaignForm(emptyCampaignForm); setShowCampaignModal(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', border: 'none',
                background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                color: '#FFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Campanha
            </button>
          </div>
        </div>

        {/* Strategies (horizontal scroll) */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#A0A0B0', marginBottom: '12px' }}>Estratégias</h3>
          {filteredStrategies.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {filteredStrategies.map(s => (
                <StrategyCard
                  key={s.id}
                  strategy={s}
                  isSelected={selectedStrategy === s.id}
                  onClick={() => setSelectedStrategy(selectedStrategy === s.id ? null : s.id)}
                  onRemove={() => removeBudgetStrategy(s.id)}
                  onEdit={() => openEditStrategy(s)}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px', borderRadius: '14px', backgroundColor: '#0D0D14',
              border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
            }}>
              <Target size={32} style={{ color: '#6B6B7B', margin: '0 auto 8px' }} />
              <p style={{ color: '#6B6B7B', fontSize: '13px' }}>Nenhuma estratégia criada</p>
            </div>
          )}
        </div>

        {/* Campaigns Table */}
        <div style={{
          padding: '24px', borderRadius: '16px', marginBottom: '24px',
          backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFF', marginBottom: '16px' }}>
            Campanhas de Orçamento ({filteredCampaigns.length})
          </h3>
          <BudgetCampaignsTable
            campaigns={filteredCampaigns}
            onUpdate={updateBudgetCampaign}
            onRemove={removeBudgetCampaign}
          />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <LeadCostChart campaigns={filteredCampaigns} />
          <PlatformDistributionChart campaigns={filteredCampaigns} />
          <PlatformCostBenefitChart campaigns={filteredCampaigns} />
        </div>
      </main>

      {/* Strategy Modal (Add/Edit) */}
      <AnimatePresence>
        {showStrategyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowStrategyModal(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '420px', backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>
                  {editingStrategy ? 'Editar Estratégia' : 'Nova Estratégia'}
                </h2>
                <button onClick={() => setShowStrategyModal(false)} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitStrategy}>
                {!editingStrategy && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente *</label>
                    <select required value={strategyForm.clientId} onChange={e => setStrategyForm(p => ({ ...p, clientId: e.target.value }))} style={inputStyle}>
                      <option value="">Selecione...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Nome *</label>
                  <input required type="text" value={strategyForm.name} onChange={e => setStrategyForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Ex: Campanha Janeiro" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Orçamento Total (R$) *</label>
                  <input required type="number" step="0.01" value={strategyForm.totalBudget} onChange={e => setStrategyForm(p => ({ ...p, totalBudget: e.target.value }))} style={inputStyle} placeholder="0.00" />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #3B82F6, #2563EB)', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  {editingStrategy ? 'Salvar Alterações' : 'Criar Estratégia'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCampaignModal(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '480px', backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Nova Campanha</h2>
                <button onClick={() => setShowCampaignModal(false)} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddCampaign}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Nome *</label>
                  <input required type="text" value={campaignForm.name} onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente *</label>
                  <select required value={campaignForm.clientId} onChange={e => setCampaignForm(p => ({ ...p, clientId: e.target.value }))} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Estratégia *</label>
                  <select required value={campaignForm.strategyId} onChange={e => setCampaignForm(p => ({ ...p, strategyId: e.target.value }))} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {budgetStrategies.filter(s => !campaignForm.clientId || s.clientId === campaignForm.clientId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Max Meta (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.maxMeta} onChange={e => setCampaignForm(p => ({ ...p, maxMeta: e.target.value }))} style={inputStyle} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Max Google (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.maxGoogle} onChange={e => setCampaignForm(p => ({ ...p, maxGoogle: e.target.value }))} style={inputStyle} placeholder="0.00" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Orçamento Diário (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.dailyBudget} onChange={e => setCampaignForm(p => ({ ...p, dailyBudget: e.target.value }))} style={inputStyle} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Data Início *</label>
                    <input required type="date" value={campaignForm.startDate} onChange={e => setCampaignForm(p => ({ ...p, startDate: e.target.value }))} style={inputStyle} />
                  </div>
                </div>

                {/* Spending fields */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '10px', display: 'block', fontWeight: 600 }}>Gastos Atuais (opcional)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#6B6B7B', marginBottom: '4px', display: 'block' }}>Gasto Meta (R$)</label>
                      <input type="number" step="0.01" value={campaignForm.spentMeta} onChange={e => setCampaignForm(p => ({ ...p, spentMeta: e.target.value }))} style={inputStyle} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#6B6B7B', marginBottom: '4px', display: 'block' }}>Gasto Google (R$)</label>
                      <input type="number" step="0.01" value={campaignForm.spentGoogle} onChange={e => setCampaignForm(p => ({ ...p, spentGoogle: e.target.value }))} style={inputStyle} placeholder="0.00" />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6B6B7B', marginBottom: '4px', display: 'block' }}>Custo/Lead Atual (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.currentLeadCost} onChange={e => setCampaignForm(p => ({ ...p, currentLeadCost: e.target.value }))} style={inputStyle} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6B6B7B', marginBottom: '4px', display: 'block' }}>Custo/Lead Anterior (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.previousLeadCost} onChange={e => setCampaignForm(p => ({ ...p, previousLeadCost: e.target.value }))} style={inputStyle} placeholder="0.00" />
                  </div>
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #3B82F6, #2563EB)', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Criar Campanha</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
