'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout'
import { StrategyCard } from '@/components/controle-ads/StrategyCard'
import { BudgetCampaignsTable } from '@/components/controle-ads/BudgetCampaignsTable'
import { useApp } from '@/contexts'
import { Plus, Loader2, X, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ControleAdsPage() {
  const {
    budgetStrategies, fetchBudgetStrategies, addBudgetStrategy, removeBudgetStrategy,
    budgetCampaigns, fetchBudgetCampaigns, addBudgetCampaign, updateBudgetCampaign, removeBudgetCampaign,
    budgetStrategiesLoading, showToast,
  } = useApp()

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [selectedClientFilter, setSelectedClientFilter] = useState('')
  const [showStrategyModal, setShowStrategyModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [strategyForm, setStrategyForm] = useState({ clientId: '', name: '', totalBudget: '' })
  const [campaignForm, setCampaignForm] = useState({
    clientId: '', strategyId: '', name: '',
    maxMeta: '', maxGoogle: '', dailyBudget: '', startDate: new Date().toISOString().split('T')[0],
  })

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

  const handleAddStrategy = async (e: React.FormEvent) => {
    e.preventDefault()
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
    })
    if (result) {
      setShowCampaignModal(false)
      setCampaignForm({ clientId: '', strategyId: '', name: '', maxMeta: '', maxGoogle: '', dailyBudget: '', startDate: new Date().toISOString().split('T')[0] })
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Controle ADS" subtitle="Gerencie orcamentos e estrategias" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Controle ADS" subtitle="Gerencie orcamentos e estrategias" />

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
              onClick={() => setShowStrategyModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)',
                backgroundColor: 'rgba(59,130,246,0.1)',
                color: '#3B82F6', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Estrategia
            </button>
            <button
              onClick={() => setShowCampaignModal(true)}
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
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#A0A0B0', marginBottom: '12px' }}>Estrategias</h3>
          {filteredStrategies.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {filteredStrategies.map(s => (
                <StrategyCard
                  key={s.id}
                  strategy={s}
                  isSelected={selectedStrategy === s.id}
                  onClick={() => setSelectedStrategy(selectedStrategy === s.id ? null : s.id)}
                  onRemove={() => removeBudgetStrategy(s.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px', borderRadius: '14px', backgroundColor: '#0D0D14',
              border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
            }}>
              <Target size={32} style={{ color: '#6B6B7B', margin: '0 auto 8px' }} />
              <p style={{ color: '#6B6B7B', fontSize: '13px' }}>Nenhuma estrategia criada</p>
            </div>
          )}
        </div>

        {/* Campaigns Table */}
        <div style={{
          padding: '24px', borderRadius: '16px',
          backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFF', marginBottom: '16px' }}>
            Campanhas de Orcamento ({filteredCampaigns.length})
          </h3>
          <BudgetCampaignsTable
            campaigns={filteredCampaigns}
            onUpdate={updateBudgetCampaign}
            onRemove={removeBudgetCampaign}
          />
        </div>
      </main>

      {/* Strategy Modal */}
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
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Nova Estrategia</h2>
                <button onClick={() => setShowStrategyModal(false)} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddStrategy}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente *</label>
                  <select required value={strategyForm.clientId} onChange={e => setStrategyForm(p => ({ ...p, clientId: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Nome *</label>
                  <input required type="text" value={strategyForm.name} onChange={e => setStrategyForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} placeholder="Ex: Campanha Janeiro" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Orcamento Total (R$) *</label>
                  <input required type="number" step="0.01" value={strategyForm.totalBudget} onChange={e => setStrategyForm(p => ({ ...p, totalBudget: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} placeholder="0.00" />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #3B82F6, #2563EB)', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Criar Estrategia</button>
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
                {[
                  { label: 'Nome *', key: 'name', type: 'text', required: true },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                    <input required={f.required} type={f.type} value={(campaignForm as any)[f.key]} onChange={e => setCampaignForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente *</label>
                  <select required value={campaignForm.clientId} onChange={e => setCampaignForm(p => ({ ...p, clientId: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Estrategia *</label>
                  <select required value={campaignForm.strategyId} onChange={e => setCampaignForm(p => ({ ...p, strategyId: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }}>
                    <option value="">Selecione...</option>
                    {budgetStrategies.filter(s => !campaignForm.clientId || s.clientId === campaignForm.clientId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Max Meta (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.maxMeta} onChange={e => setCampaignForm(p => ({ ...p, maxMeta: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Max Google (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.maxGoogle} onChange={e => setCampaignForm(p => ({ ...p, maxGoogle: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} placeholder="0.00" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Orcamento Diario (R$)</label>
                    <input type="number" step="0.01" value={campaignForm.dailyBudget} onChange={e => setCampaignForm(p => ({ ...p, dailyBudget: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Data Inicio *</label>
                    <input required type="date" value={campaignForm.startDate} onChange={e => setCampaignForm(p => ({ ...p, startDate: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '14px', outline: 'none' }} />
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
