'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout'
import { useApp } from '@/contexts'
import { formatCurrency, formatDate, calcularFinalizaraEm } from '@/lib/utils/financial'
import {
  Loader2, TrendingDown, TrendingUp, Minus, CalendarDays, DollarSign,
  Target, Clock, BarChart3, Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Client {
  id: string
  name: string
  monthlyValue?: number
  startDate?: string
  status: string
}

interface CampaignSummary {
  clientId: string
  clientName: string
  totalMaxBudget: number
  totalSpent: number
  remaining: number
  dailyBudget: number
  finalizaEm: number
  currentLeadCost: number | null
  previousLeadCost: number | null
  leadCostVariation: number | null
  campaignCount: number
  earliestStart: string | null
}

export default function ResumoPage() {
  const { budgetCampaigns, fetchBudgetCampaigns, budgetCampaignsLoading } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
    fetchBudgetCampaigns()
  }, [fetchClients, fetchBudgetCampaigns])

  // Build summary per client
  const summaries: CampaignSummary[] = (() => {
    const byClient = new Map<string, typeof budgetCampaigns>()
    for (const c of budgetCampaigns) {
      const cid = c.clientId
      if (!byClient.has(cid)) byClient.set(cid, [])
      byClient.get(cid)!.push(c)
    }

    const result: CampaignSummary[] = []
    for (const [clientId, campaigns] of byClient) {
      const client = clients.find(c => c.id === clientId)
      const totalMaxBudget = campaigns.reduce((s, c) => s + c.maxMeta + c.maxGoogle, 0)
      const totalSpent = campaigns.reduce((s, c) => s + c.spentMeta + c.spentGoogle, 0)
      const remaining = totalMaxBudget - totalSpent
      const totalDailyBudget = campaigns.reduce((s, c) => s + c.dailyBudget, 0)
      const finalizaEm = calcularFinalizaraEm(totalMaxBudget, totalSpent, totalDailyBudget)

      // Average lead cost across campaigns that have it
      const withLeadCost = campaigns.filter(c => c.currentLeadCost != null)
      const currentLeadCost = withLeadCost.length > 0
        ? withLeadCost.reduce((s, c) => s + (c.currentLeadCost || 0), 0) / withLeadCost.length
        : null
      const withPrevLeadCost = campaigns.filter(c => c.previousLeadCost != null)
      const previousLeadCost = withPrevLeadCost.length > 0
        ? withPrevLeadCost.reduce((s, c) => s + (c.previousLeadCost || 0), 0) / withPrevLeadCost.length
        : null

      let leadCostVariation: number | null = null
      if (currentLeadCost != null && previousLeadCost != null && previousLeadCost > 0) {
        leadCostVariation = ((currentLeadCost - previousLeadCost) / previousLeadCost) * 100
      }

      const startDates = campaigns.map(c => c.startDate).filter(Boolean).sort()
      const earliestStart = startDates.length > 0 ? startDates[0] : null

      result.push({
        clientId,
        clientName: client?.name || campaigns[0]?.client?.name || 'Cliente',
        totalMaxBudget,
        totalSpent,
        remaining,
        dailyBudget: totalDailyBudget,
        finalizaEm,
        currentLeadCost,
        previousLeadCost,
        leadCostVariation,
        campaignCount: campaigns.length,
        earliestStart,
      })
    }

    return result.sort((a, b) => a.finalizaEm - b.finalizaEm)
  })()

  const totalBudget = summaries.reduce((s, c) => s + c.totalMaxBudget, 0)
  const totalSpent = summaries.reduce((s, c) => s + c.totalSpent, 0)
  const totalRemaining = summaries.reduce((s, c) => s + c.remaining, 0)

  if (isLoading || budgetCampaignsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Resumo" subtitle="Resumo por cliente" variant="simple" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Resumo" subtitle="Visao geral por cliente" variant="simple" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Global metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <MetricBox icon={<Users size={18} />} label="Clientes c/ Campanhas" value={String(summaries.length)} color="#3B82F6" />
          <MetricBox icon={<DollarSign size={18} />} label="Orcamento Total" value={formatCurrency(totalBudget)} color="#10B981" />
          <MetricBox icon={<BarChart3 size={18} />} label="Total Gasto" value={formatCurrency(totalSpent)} color="#F59E0B" />
          <MetricBox icon={<Target size={18} />} label="Saldo Restante" value={formatCurrency(totalRemaining)} color="#8B5CF6" />
        </div>

        {/* Client summary cards */}
        {summaries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#6B6B7B',
            backgroundColor: '#12121A', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 500 }}>Nenhuma campanha cadastrada</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Adicione campanhas no Controle ADS para ver o resumo aqui.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
            {summaries.map((summary, i) => (
              <ClientSummaryCard key={summary.clientId} summary={summary} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function MetricBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '20px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          backgroundColor: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '13px', color: '#A0A0B0' }}>{label}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#FFF' }}>{value}</div>
    </motion.div>
  )
}

function ClientSummaryCard({ summary, index }: { summary: CampaignSummary; index: number }) {
  const urgency = summary.finalizaEm <= 5 ? 'critical' : summary.finalizaEm <= 15 ? 'warning' : 'ok'
  const urgencyColor = urgency === 'critical' ? '#EF4444' : urgency === 'warning' ? '#F59E0B' : '#10B981'
  const spentPercent = summary.totalMaxBudget > 0 ? (summary.totalSpent / summary.totalMaxBudget) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#FFF',
          }}>
            {summary.clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>{summary.clientName}</div>
            <div style={{ fontSize: '12px', color: '#6B6B7B' }}>
              {summary.campaignCount} campanha{summary.campaignCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
          backgroundColor: `${urgencyColor}20`, color: urgencyColor,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Clock size={12} />
          {summary.finalizaEm === Infinity ? 'Sem previsao' : `${summary.finalizaEm}d restantes`}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Gasto</span>
          <span style={{ fontSize: '12px', color: '#A0A0B0', fontWeight: 500 }}>{spentPercent.toFixed(1)}%</span>
        </div>
        <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            width: `${Math.min(100, spentPercent)}%`,
            background: spentPercent > 90 ? '#EF4444' : spentPercent > 70 ? '#F59E0B' : '#3B82F6',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <InfoItem label="Orcamento" value={formatCurrency(summary.totalMaxBudget)} icon={<DollarSign size={14} />} />
        <InfoItem label="Gasto" value={formatCurrency(summary.totalSpent)} icon={<BarChart3 size={14} />} />
        <InfoItem label="Saldo Restante" value={formatCurrency(summary.remaining)} icon={<Target size={14} />} color={summary.remaining < 0 ? '#EF4444' : '#10B981'} />
        <InfoItem label="Diario" value={formatCurrency(summary.dailyBudget)} icon={<Clock size={14} />} />

        {/* Lead cost */}
        {summary.currentLeadCost != null && (
          <div style={{
            gridColumn: '1 / -1', padding: '12px', borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6B6B7B', marginBottom: '4px' }}>Custo por Lead</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>
                  {formatCurrency(summary.currentLeadCost)}
                </div>
              </div>
              {summary.leadCostVariation != null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  backgroundColor: summary.leadCostVariation <= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: summary.leadCostVariation <= 0 ? '#10B981' : '#EF4444',
                }}>
                  {summary.leadCostVariation <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  {summary.leadCostVariation > 0 ? '+' : ''}{summary.leadCostVariation.toFixed(1)}%
                </div>
              )}
            </div>
            {summary.previousLeadCost != null && (
              <div style={{ fontSize: '11px', color: '#6B6B7B', marginTop: '4px' }}>
                Anterior: {formatCurrency(summary.previousLeadCost)}
              </div>
            )}
          </div>
        )}

        {/* Start date */}
        {summary.earliestStart && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px', color: '#6B6B7B', fontSize: '12px' }}>
            <CalendarDays size={14} />
            Inicio: {formatDate(summary.earliestStart)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function InfoItem({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <span style={{ color: '#6B6B7B' }}>{icon}</span>
        <span style={{ fontSize: '11px', color: '#6B6B7B' }}>{label}</span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: color || '#FFF' }}>{value}</div>
    </div>
  )
}
