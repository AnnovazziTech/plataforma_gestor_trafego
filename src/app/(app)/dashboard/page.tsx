'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout'
import { MetricCard } from '@/components/ui'
import { FinanceChart } from '@/components/charts/FinanceChart'
import { FinancialEntriesList } from '@/components/financeiro/FinancialEntriesList'
import { AddFinancialEntryModal } from '@/components/financeiro/AddFinancialEntryModal'
import { ExportFinancialModal } from '@/components/financeiro/ExportFinancialModal'
import { useApp } from '@/contexts'
import {
  DollarSign,
  TrendingDown,
  Building2,
  Wallet,
  Plus,
  FileDown,
  Loader2,
} from 'lucide-react'

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  totalAssets: number
  balance: number
  monthlyRevenue: number
  activeClients: number
  testingClients: number
  chartData: Array<{
    month: string
    income: number
    expenses: number
    assets: number
    balance: number
  }>
}

export default function DashboardPage() {
  const {
    financialEntries, fetchFinancialEntries, removeFinancialEntry,
    showToast,
  } = useApp()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])

  const fetchDashboard = async () => {
    try {
      const [dashRes, clientsRes] = await Promise.all([
        fetch('/api/financial-dashboard'),
        fetch('/api/clients'),
      ])
      if (dashRes.ok) {
        setDashboardData(await dashRes.json())
      }
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await Promise.all([fetchDashboard(), fetchFinancialEntries()])
  }

  useEffect(() => {
    fetchDashboard()
    fetchFinancialEntries()
  }, [])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Dashboard Financeiro" subtitle="Gestão financeira completa" variant="simple" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6B6B7B', marginTop: '16px' }}>Carregando dados...</p>
          </div>
        </main>
      </div>
    )
  }

  const data = dashboardData || {
    totalIncome: 0, totalExpenses: 0, totalAssets: 0, balance: 0,
    monthlyRevenue: 0, activeClients: 0, testingClients: 0, chartData: [],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        title="Dashboard Financeiro"
        subtitle="Gestão financeira completa"
        variant="simple"
        onRefresh={handleRefresh}
      />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <MetricCard
            title="Receita Total"
            value={data.totalIncome}
            format="currency"
            icon={<DollarSign size={20} />}
            color="green"
            delay={0}
          />
          <MetricCard
            title="Despesas"
            value={data.totalExpenses}
            format="currency"
            icon={<TrendingDown size={20} />}
            color="orange"
            delay={0.1}
          />
          <MetricCard
            title="Patrimônio"
            value={data.totalAssets}
            format="currency"
            icon={<Building2 size={20} />}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="Saldo"
            value={data.balance}
            format="currency"
            icon={<Wallet size={20} />}
            color={data.balance >= 0 ? 'green' : 'orange'}
            delay={0.3}
          />
        </div>

        {/* Chart */}
        <div style={{ marginBottom: '24px' }}>
          <FinanceChart data={data.chartData} />
        </div>

        {/* Entries list */}
        <div style={{
          padding: '24px', borderRadius: '16px',
          backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFF' }}>Lançamentos</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowExportModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                  borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                  color: '#A0A0B0', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                <FileDown size={16} /> Exportar
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                  borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                  color: '#FFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                <Plus size={16} /> Novo Lançamento
              </button>
            </div>
          </div>
          <FinancialEntriesList entries={financialEntries} onRemove={removeFinancialEntry} />
        </div>
      </main>

      <AddFinancialEntryModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); fetchDashboard(); }}
        clients={clients}
      />

      <ExportFinancialModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        entries={financialEntries}
      />
    </div>
  )
}
