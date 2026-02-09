'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, Building2, Users, CreditCard, FileSearch,
  BarChart3, TrendingUp, Activity, CheckCircle, XCircle,
  Edit3, ChevronLeft, ChevronRight, Search, Filter,
  Plus, X, Save, Eye, Zap, Layers, ToggleLeft, ToggleRight,
  GripVertical, Lock, Unlock,
} from 'lucide-react'

// ===== TYPES =====
interface Stats {
  metrics: {
    totalOrganizations: number
    activeOrganizations: number
    totalUsers: number
    activeUsers: number
    totalCampaigns: number
    activeCampaigns: number
    totalLeads: number
    totalIntegrations: number
    mrr: number
  }
  planDistribution: { planName: string; count: number }[]
  subscriptionDistribution: { status: string; count: number }[]
}

interface Organization {
  id: string
  name: string
  slug: string
  isActive: boolean
  subscriptionStatus: string
  trialEndsAt: string | null
  createdAt: string
  plan: { id: string; name: string; priceMonthly: number }
  membersCount: number
  campaignsCount: number
  leadsCount: number
}

interface User {
  id: string
  email: string
  name: string | null
  isActive: boolean
  isSuperAdmin: boolean
  lastLoginAt: string | null
  createdAt: string
  memberships: { role: string; isActive: boolean; organization: { id: string; name: string } }[]
}

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  maxUsers: number
  maxCampaigns: number
  maxLeads: number
  maxIntegrations: number
  maxCreatives: number
  hasAiAnalysis: boolean
  hasAdvancedReports: boolean
  hasAutomation: boolean
  hasApiAccess: boolean
  hasPrioritySupport: boolean
  hasWhiteLabel: boolean
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  organizationCount: number
}

interface SystemModule {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  route: string
  isEnabled: boolean
  isFree: boolean
  sortOrder: number
}

interface AuditLog {
  id: string
  action: string
  entity: string | null
  entityId: string | null
  userId: string | null
  userEmail: string | null
  createdAt: string
  organization: { id: string; name: string } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

type Tab = 'overview' | 'organizations' | 'users' | 'plans' | 'modules' | 'audit-logs'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22C55E',
  TRIALING: '#3B82F6',
  PAST_DUE: '#F59E0B',
  CANCELED: '#EF4444',
  UNPAID: '#EF4444',
  INCOMPLETE: '#6B7280',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  TRIALING: 'Trial',
  PAST_DUE: 'Atrasado',
  CANCELED: 'Cancelado',
  UNPAID: 'Nao Pago',
  INCOMPLETE: 'Incompleto',
}

// ===== COMPONENT =====
export default function SuperadminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Overview state
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgPagination, setOrgPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [orgSearch, setOrgSearch] = useState('')
  const [orgStatusFilter, setOrgStatusFilter] = useState('')
  const [loadingOrgs, setLoadingOrgs] = useState(false)

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [userPagination, setUserPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [userSearch, setUserSearch] = useState('')
  const [userActiveFilter, setUserActiveFilter] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [logPagination, setLogPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 })
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Modules state
  const [sysModules, setSysModules] = useState<SystemModule[]>([])
  const [loadingModules, setLoadingModules] = useState(false)

  // All plans for org dropdown
  const [allPlans, setAllPlans] = useState<{ id: string; name: string }[]>([])

  // Guard
  useEffect(() => {
    if (status === 'authenticated' && !(session?.user as any)?.isSuperAdmin) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Fetch functions
  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/superadmin/stats')
      if (res.ok) setStats(await res.json())
    } catch (e) { console.error(e) }
    setLoadingStats(false)
  }, [])

  const fetchOrganizations = useCallback(async (page = 1) => {
    setLoadingOrgs(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (orgSearch) params.set('search', orgSearch)
      if (orgStatusFilter) params.set('status', orgStatusFilter)
      const res = await fetch(`/api/superadmin/organizations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrganizations(data.organizations)
        setOrgPagination(data.pagination)
      }
    } catch (e) { console.error(e) }
    setLoadingOrgs(false)
  }, [orgSearch, orgStatusFilter])

  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (userSearch) params.set('search', userSearch)
      if (userActiveFilter) params.set('isActive', userActiveFilter)
      const res = await fetch(`/api/superadmin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setUserPagination(data.pagination)
      }
    } catch (e) { console.error(e) }
    setLoadingUsers(false)
  }, [userSearch, userActiveFilter])

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true)
    try {
      const res = await fetch('/api/superadmin/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans)
        setAllPlans(data.plans.map((p: Plan) => ({ id: p.id, name: p.name })))
      }
    } catch (e) { console.error(e) }
    setLoadingPlans(false)
  }, [])

  const fetchAuditLogs = useCallback(async (page = 1) => {
    setLoadingLogs(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' })
      const res = await fetch(`/api/superadmin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.logs)
        setLogPagination(data.pagination)
      }
    } catch (e) { console.error(e) }
    setLoadingLogs(false)
  }, [])

  const fetchSysModules = useCallback(async () => {
    setLoadingModules(true)
    try {
      const res = await fetch('/api/superadmin/modules')
      if (res.ok) {
        const data = await res.json()
        setSysModules(data.modules)
      }
    } catch (e) { console.error(e) }
    setLoadingModules(false)
  }, [])

  const toggleModuleEnabled = async (id: string, isEnabled: boolean) => {
    const res = await fetch('/api/superadmin/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isEnabled: !isEnabled }),
    })
    if (res.ok) fetchSysModules()
  }

  // Tab change -> fetch data
  useEffect(() => {
    if (status !== 'authenticated' || !(session?.user as any)?.isSuperAdmin) return
    if (activeTab === 'overview') fetchStats()
    if (activeTab === 'organizations') { fetchOrganizations(); fetchPlans() }
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'plans') fetchPlans()
    if (activeTab === 'modules') fetchSysModules()
    if (activeTab === 'audit-logs') fetchAuditLogs()
  }, [activeTab, status, session, fetchStats, fetchOrganizations, fetchUsers, fetchPlans, fetchSysModules, fetchAuditLogs])

  // Actions
  const toggleOrgActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/superadmin/organizations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) fetchOrganizations(orgPagination.page)
  }

  const changeOrgPlan = async (orgId: string, planId: string) => {
    const res = await fetch(`/api/superadmin/organizations/${orgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    if (res.ok) fetchOrganizations(orgPagination.page)
  }

  const toggleUserActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/superadmin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) fetchUsers(userPagination.page)
  }

  const savePlan = async (planData: any) => {
    const isEdit = !!editingPlan
    const url = isEdit ? `/api/superadmin/plans/${editingPlan!.id}` : '/api/superadmin/plans'
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    })
    if (res.ok) {
      setShowPlanModal(false)
      setEditingPlan(null)
      fetchPlans()
    }
  }

  const togglePlanActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/superadmin/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) fetchPlans()
  }

  // Loading guard
  if (status === 'loading' || !(session?.user as any)?.isSuperAdmin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#8B8B9B' }}>
        Carregando...
      </div>
    )
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // ===== TABS =====
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'organizations', label: 'Organizacoes', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'modules', label: 'Modulos', icon: Layers },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch },
  ]

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(to bottom right, #12121A, #0D0D14)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <Shield size={28} style={{ color: '#A855F7' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Painel Superadmin</h1>
        </div>
        <p style={{ color: '#6B6B7B', fontSize: '14px', margin: 0 }}>Gestao global da plataforma TrafficPro</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 500, borderRadius: '8px 8px 0 0',
              backgroundColor: activeTab === tab.id ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
              color: activeTab === tab.id ? '#A855F7' : '#6B6B7B',
              borderBottom: activeTab === tab.id ? '2px solid #A855F7' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} loading={loadingStats} formatCurrency={formatCurrency} />}
      {activeTab === 'organizations' && (
        <OrganizationsTab
          organizations={organizations} pagination={orgPagination} loading={loadingOrgs}
          search={orgSearch} setSearch={setOrgSearch} statusFilter={orgStatusFilter} setStatusFilter={setOrgStatusFilter}
          onSearch={() => fetchOrganizations(1)} onPageChange={fetchOrganizations}
          onToggleActive={toggleOrgActive} onChangePlan={changeOrgPlan}
          allPlans={allPlans} formatDate={formatDate} formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'users' && (
        <UsersTab
          users={users} pagination={userPagination} loading={loadingUsers}
          search={userSearch} setSearch={setUserSearch}
          activeFilter={userActiveFilter} setActiveFilter={setUserActiveFilter}
          onSearch={() => fetchUsers(1)} onPageChange={fetchUsers}
          onToggleActive={toggleUserActive} formatDate={formatDate}
        />
      )}
      {activeTab === 'plans' && (
        <PlansTab
          plans={plans} loading={loadingPlans}
          onEdit={(p: any) => { setEditingPlan(p); setShowPlanModal(true) }}
          onToggleActive={togglePlanActive}
          onCreate={() => { setEditingPlan(null); setShowPlanModal(true) }}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'modules' && (
        <ModulesTab
          modules={sysModules} loading={loadingModules}
          onToggleEnabled={toggleModuleEnabled}
        />
      )}
      {activeTab === 'audit-logs' && (
        <AuditLogsTab
          logs={auditLogs} pagination={logPagination} loading={loadingLogs}
          onPageChange={fetchAuditLogs} formatDate={formatDate}
        />
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <PlanModal
          plan={editingPlan}
          onSave={savePlan}
          onClose={() => { setShowPlanModal(false); setEditingPlan(null) }}
        />
      )}
    </div>
  )
}

// ===== SHARED COMPONENTS =====

function MetricBox({ label, value, icon: Icon, color = '#3B82F6' }: { label: string; value: string | number; icon: any; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p style={{ fontSize: '13px', color: '#6B6B7B', margin: '0 0 8px 0' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{value}</p>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6B7280'
  return (
    <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '9999px', backgroundColor: `${color}20`, color }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '9999px',
      backgroundColor: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#22C55E' : '#EF4444',
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function PaginationBar({ pagination, onPageChange }: { pagination: Pagination; onPageChange: (p: number) => void }) {
  if (pagination.pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
      <span style={{ color: '#6B6B7B', fontSize: '13px' }}>
        {pagination.total} registros | Pagina {pagination.page} de {pagination.pages}
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1} style={{ ...btnSmall, opacity: pagination.page <= 1 ? 0.3 : 1 }}>
          <ChevronLeft size={16} /> Anterior
        </button>
        <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} style={{ ...btnSmall, opacity: pagination.page >= pagination.pages ? 0.3 : 1 }}>
          Proximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

const btnSmall: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
  fontSize: '12px', fontWeight: 500, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'transparent', color: '#8B8B9B', cursor: 'pointer',
}

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: '13px',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', color: '#6B6B7B', fontWeight: 600,
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px', color: '#CACADB', borderBottom: '1px solid rgba(255,255,255,0.03)',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'rgba(255,255,255,0.03)', color: '#FFFFFF', fontSize: '13px',
  outline: 'none', width: '100%',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, width: 'auto', cursor: 'pointer',
}

// ===== TAB: OVERVIEW =====
function OverviewTab({ stats, loading, formatCurrency }: { stats: Stats | null; loading: boolean; formatCurrency: (v: number) => string }) {
  if (loading || !stats) return <div style={{ color: '#6B6B7B', padding: '40px', textAlign: 'center' }}>Carregando metricas...</div>

  const m = stats.metrics
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricBox label="Total Organizacoes" value={m.totalOrganizations} icon={Building2} color="#3B82F6" />
        <MetricBox label="Usuarios Ativos" value={m.activeUsers} icon={Users} color="#22C55E" />
        <MetricBox label="MRR" value={formatCurrency(m.mrr)} icon={TrendingUp} color="#A855F7" />
        <MetricBox label="Total Campanhas" value={m.totalCampaigns} icon={Zap} color="#F59E0B" />
        <MetricBox label="Total Leads" value={m.totalLeads.toLocaleString('pt-BR')} icon={Activity} color="#06B6D4" />
        <MetricBox label="Campanhas Ativas" value={m.activeCampaigns} icon={CheckCircle} color="#10B981" />
      </div>

      {/* Distribution charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, margin: '0 0 20px 0' }}>Distribuicao por Plano</h3>
          {stats.planDistribution.map((item, i) => {
            const total = stats.planDistribution.reduce((s, p) => s + p.count, 0)
            const pct = total > 0 ? (item.count / total) * 100 : 0
            const colors = ['#3B82F6', '#A855F7', '#F59E0B', '#22C55E', '#06B6D4']
            return (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#CACADB', fontSize: '13px' }}>{item.planName}</span>
                  <span style={{ color: '#6B6B7B', fontSize: '13px' }}>{item.count} orgs ({pct.toFixed(0)}%)</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: '4px', width: `${pct}%`, backgroundColor: colors[i % colors.length], transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, margin: '0 0 20px 0' }}>Status de Assinaturas</h3>
          {stats.subscriptionDistribution.map((item, i) => {
            const total = stats.subscriptionDistribution.reduce((s, p) => s + p.count, 0)
            const pct = total > 0 ? (item.count / total) * 100 : 0
            const color = STATUS_COLORS[item.status] || '#6B7280'
            return (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#CACADB', fontSize: '13px' }}>{STATUS_LABELS[item.status] || item.status}</span>
                  <span style={{ color: '#6B6B7B', fontSize: '13px' }}>{item.count} ({pct.toFixed(0)}%)</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: '4px', width: `${pct}%`, backgroundColor: color, transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===== TAB: ORGANIZATIONS =====
function OrganizationsTab({ organizations, pagination, loading, search, setSearch, statusFilter, setStatusFilter, onSearch, onPageChange, onToggleActive, onChangePlan, allPlans, formatDate, formatCurrency }: any) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B7B' }} />
          <input
            placeholder="Buscar organizacao..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            style={{ ...inputStyle, paddingLeft: '36px' }}
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(onSearch, 0) }} style={selectStyle}>
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="TRIALING">Trial</option>
          <option value="CANCELED">Cancelado</option>
          <option value="PAST_DUE">Atrasado</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: '#6B6B7B', padding: '40px', textAlign: 'center' }}>Carregando...</div>
      ) : (
        <>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Organizacao</th>
                  <th style={thStyle}>Plano</th>
                  <th style={thStyle}>Membros</th>
                  <th style={thStyle}>Campanhas</th>
                  <th style={thStyle}>Leads</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Ativo</th>
                  <th style={thStyle}>Criado em</th>
                  <th style={thStyle}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org: Organization) => (
                  <tr key={org.id} style={{ transition: 'background 0.2s' }}>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{org.name}</div>
                        <div style={{ fontSize: '11px', color: '#6B6B7B' }}>{org.slug}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={org.plan.id}
                        onChange={e => onChangePlan(org.id, e.target.value)}
                        style={{ ...selectStyle, padding: '4px 8px', fontSize: '12px' }}
                      >
                        {allPlans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>{org.membersCount}</td>
                    <td style={tdStyle}>{org.campaignsCount}</td>
                    <td style={tdStyle}>{org.leadsCount}</td>
                    <td style={tdStyle}><StatusBadge status={org.subscriptionStatus} /></td>
                    <td style={tdStyle}><ActiveBadge active={org.isActive} /></td>
                    <td style={tdStyle}>{formatDate(org.createdAt)}</td>
                    <td style={tdStyle}>
                      <button onClick={() => onToggleActive(org.id, org.isActive)} style={{ ...btnSmall, fontSize: '11px' }}>
                        {org.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        {org.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar pagination={pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}

// ===== TAB: USERS =====
function UsersTab({ users, pagination, loading, search, setSearch, activeFilter, setActiveFilter, onSearch, onPageChange, onToggleActive, formatDate }: any) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B7B' }} />
          <input
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            style={{ ...inputStyle, paddingLeft: '36px' }}
          />
        </div>
        <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setTimeout(onSearch, 0) }} style={selectStyle}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: '#6B6B7B', padding: '40px', textAlign: 'center' }}>Carregando...</div>
      ) : (
        <>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Ativo</th>
                  <th style={thStyle}>Superadmin</th>
                  <th style={thStyle}>Organizacoes</th>
                  <th style={thStyle}>Ultimo Login</th>
                  <th style={thStyle}>Criado em</th>
                  <th style={thStyle}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id}>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{user.name || '-'}</div>
                        <div style={{ fontSize: '11px', color: '#6B6B7B' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={tdStyle}><ActiveBadge active={user.isActive} /></td>
                    <td style={tdStyle}>
                      {user.isSuperAdmin && <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '9999px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#A855F7' }}>Super</span>}
                    </td>
                    <td style={tdStyle}>
                      {user.memberships.map((m: any, i: number) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          <span style={{ color: '#CACADB' }}>{m.organization.name}</span>
                          <span style={{ color: '#6B6B7B', marginLeft: '6px' }}>({m.role})</span>
                        </div>
                      ))}
                      {user.memberships.length === 0 && <span style={{ color: '#6B6B7B' }}>Nenhuma</span>}
                    </td>
                    <td style={tdStyle}>{formatDate(user.lastLoginAt)}</td>
                    <td style={tdStyle}>{formatDate(user.createdAt)}</td>
                    <td style={tdStyle}>
                      <button onClick={() => onToggleActive(user.id, user.isActive)} style={{ ...btnSmall, fontSize: '11px' }}>
                        {user.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        {user.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar pagination={pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}

// ===== TAB: PLANS =====
function PlansTab({ plans, loading, onEdit, onToggleActive, onCreate, formatCurrency }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#A855F7', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Criar Plano
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#6B6B7B', padding: '40px', textAlign: 'center' }}>Carregando...</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Plano</th>
                <th style={thStyle}>Preco Mensal</th>
                <th style={thStyle}>Preco Anual</th>
                <th style={thStyle}>Orgs</th>
                <th style={thStyle}>Limites</th>
                <th style={thStyle}>Features</th>
                <th style={thStyle}>Ativo</th>
                <th style={thStyle}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan: Plan) => (
                <tr key={plan.id}>
                  <td style={tdStyle}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{plan.name}</div>
                      <div style={{ fontSize: '11px', color: '#6B6B7B' }}>{plan.slug}</div>
                    </div>
                  </td>
                  <td style={tdStyle}>{formatCurrency(plan.priceMonthly)}</td>
                  <td style={tdStyle}>{formatCurrency(plan.priceYearly)}</td>
                  <td style={tdStyle}>{plan.organizationCount}</td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                      {plan.maxUsers} users, {plan.maxCampaigns} camps, {plan.maxLeads} leads
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {plan.hasAiAnalysis && <FeatureTag label="AI" />}
                      {plan.hasAdvancedReports && <FeatureTag label="Reports" />}
                      {plan.hasAutomation && <FeatureTag label="Auto" />}
                      {plan.hasApiAccess && <FeatureTag label="API" />}
                    </div>
                  </td>
                  <td style={tdStyle}><ActiveBadge active={plan.isActive} /></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => onEdit(plan)} style={{ ...btnSmall, fontSize: '11px' }}><Edit3 size={14} /> Editar</button>
                      <button onClick={() => onToggleActive(plan.id, plan.isActive)} style={{ ...btnSmall, fontSize: '11px' }}>
                        {plan.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FeatureTag({ label }: { label: string }) {
  return (
    <span style={{ padding: '2px 6px', fontSize: '10px', fontWeight: 600, borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
      {label}
    </span>
  )
}

// ===== TAB: MODULES =====
function ModulesTab({ modules, loading, onToggleEnabled }: { modules: SystemModule[]; loading: boolean; onToggleEnabled: (id: string, isEnabled: boolean) => void }) {
  const freeModules = modules.filter(m => m.isFree)
  const paidModules = modules.filter(m => !m.isFree)

  if (loading) return <div style={{ color: '#6B6B7B', padding: '40px', textAlign: 'center' }}>Carregando modulos...</div>

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricBox label="Total Modulos" value={modules.length} icon={Layers} color="#3B82F6" />
        <MetricBox label="Modulos Ativos" value={modules.filter(m => m.isEnabled).length} icon={CheckCircle} color="#22C55E" />
        <MetricBox label="Modulos Pagos" value={paidModules.length} icon={Lock} color="#A855F7" />
      </div>

      {/* Free Modules */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Unlock size={18} style={{ color: '#22C55E' }} />
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, margin: 0 }}>Modulos Gratuitos</h3>
          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>({freeModules.length})</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Ordem</th>
                <th style={thStyle}>Modulo</th>
                <th style={thStyle}>Rota</th>
                <th style={thStyle}>Descricao</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Acao</th>
              </tr>
            </thead>
            <tbody>
              {freeModules.map(mod => (
                <tr key={mod.id}>
                  <td style={tdStyle}>
                    <span style={{ color: '#6B6B7B', fontFamily: 'monospace' }}>{mod.sortOrder}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{mod.name}</span>
                      <span style={{ padding: '2px 6px', fontSize: '10px', fontWeight: 600, borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>FREE</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B6B7B' }}>{mod.slug}</div>
                  </td>
                  <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#A0A0B0' }}>{mod.route}</span></td>
                  <td style={tdStyle}><span style={{ color: '#8B8B9B', fontSize: '12px' }}>{mod.description || '-'}</span></td>
                  <td style={tdStyle}><ActiveBadge active={mod.isEnabled} /></td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => onToggleEnabled(mod.id, mod.isEnabled)}
                      style={{
                        ...btnSmall, fontSize: '11px',
                        color: mod.isEnabled ? '#EF4444' : '#22C55E',
                        borderColor: mod.isEnabled ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
                      }}
                    >
                      {mod.isEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {mod.isEnabled ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paid Modules */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Lock size={18} style={{ color: '#A855F7' }} />
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, margin: 0 }}>Modulos Pagos</h3>
          <span style={{ fontSize: '12px', color: '#6B6B7B' }}>({paidModules.length})</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Ordem</th>
                <th style={thStyle}>Modulo</th>
                <th style={thStyle}>Rota</th>
                <th style={thStyle}>Descricao</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Acao</th>
              </tr>
            </thead>
            <tbody>
              {paidModules.map(mod => (
                <tr key={mod.id}>
                  <td style={tdStyle}>
                    <span style={{ color: '#6B6B7B', fontFamily: 'monospace' }}>{mod.sortOrder}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{mod.name}</span>
                      <span style={{ padding: '2px 6px', fontSize: '10px', fontWeight: 600, borderRadius: '4px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#A855F7' }}>PRO</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B6B7B' }}>{mod.slug}</div>
                  </td>
                  <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#A0A0B0' }}>{mod.route}</span></td>
                  <td style={tdStyle}><span style={{ color: '#8B8B9B', fontSize: '12px' }}>{mod.description || '-'}</span></td>
                  <td style={tdStyle}><ActiveBadge active={mod.isEnabled} /></td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => onToggleEnabled(mod.id, mod.isEnabled)}
                      style={{
                        ...btnSmall, fontSize: '11px',
                        color: mod.isEnabled ? '#EF4444' : '#22C55E',
                        borderColor: mod.isEnabled ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
                      }}
                    >
                      {mod.isEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {mod.isEnabled ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {paidModules.length === 0 && (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#6B6B7B', padding: '40px' }}>Nenhum modulo pago cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== TAB: AUDIT LOGS =====
function AuditLogsTab({ logs, pagination, loading, onPageChange, formatDate }: any) {
  return (
    <div>
      {loading ? (
        <div style={{ color: '#6B6B7B', padding: '40px', textAlign: 'center' }}>Carregando...</div>
      ) : (
        <>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Acao</th>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Organizacao</th>
                  <th style={thStyle}>Entidade</th>
                  <th style={thStyle}>ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#6B6B7B', padding: '40px' }}>Nenhum log encontrado</td></tr>
                ) : logs.map((log: AuditLog) => (
                  <tr key={log.id}>
                    <td style={tdStyle}>{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#A855F7' }}>{log.action}</span></td>
                    <td style={tdStyle}>{log.userEmail || '-'}</td>
                    <td style={tdStyle}>{log.organization?.name || '-'}</td>
                    <td style={tdStyle}>{log.entity || '-'}</td>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6B6B7B' }}>{log.entityId?.slice(0, 8) || '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar pagination={pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}

// ===== PLAN MODAL =====
function PlanModal({ plan, onSave, onClose }: { plan: Plan | null; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: plan?.name || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    priceMonthly: plan?.priceMonthly || 0,
    priceYearly: plan?.priceYearly || 0,
    maxUsers: plan?.maxUsers || 1,
    maxCampaigns: plan?.maxCampaigns || 10,
    maxLeads: plan?.maxLeads || 500,
    maxIntegrations: plan?.maxIntegrations || 2,
    maxCreatives: plan?.maxCreatives || 100,
    maxWhatsappNumbers: plan ? (plan as any).maxWhatsappNumbers || 1 : 1,
    hasAiAnalysis: plan?.hasAiAnalysis || false,
    hasAdvancedReports: plan?.hasAdvancedReports || false,
    hasAutomation: plan?.hasAutomation || false,
    hasApiAccess: plan?.hasApiAccess || false,
    hasPrioritySupport: plan?.hasPrioritySupport || false,
    hasWhiteLabel: plan?.hasWhiteLabel || false,
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured || false,
    sortOrder: plan?.sortOrder || 0,
  })

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1A1A24', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, margin: 0 }}>{plan ? 'Editar Plano' : 'Criar Plano'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nome</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} style={inputStyle} disabled={!!plan} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descricao</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Preco Mensal (R$)</label>
            <input type="number" value={form.priceMonthly} onChange={e => set('priceMonthly', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Preco Anual (R$)</label>
            <input type="number" value={form.priceYearly} onChange={e => set('priceYearly', Number(e.target.value))} style={inputStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '8px' }}>
            <p style={{ color: '#6B6B7B', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Limites</p>
          </div>
          <div>
            <label style={labelStyle}>Max Usuarios</label>
            <input type="number" value={form.maxUsers} onChange={e => set('maxUsers', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Campanhas</label>
            <input type="number" value={form.maxCampaigns} onChange={e => set('maxCampaigns', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Leads</label>
            <input type="number" value={form.maxLeads} onChange={e => set('maxLeads', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Integracoes</label>
            <input type="number" value={form.maxIntegrations} onChange={e => set('maxIntegrations', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Criativos</label>
            <input type="number" value={form.maxCreatives} onChange={e => set('maxCreatives', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ordem</label>
            <input type="number" value={form.sortOrder} onChange={e => set('sortOrder', Number(e.target.value))} style={inputStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '8px' }}>
            <p style={{ color: '#6B6B7B', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Features</p>
          </div>
          {[
            { key: 'hasAiAnalysis', label: 'AI Analysis' },
            { key: 'hasAdvancedReports', label: 'Advanced Reports' },
            { key: 'hasAutomation', label: 'Automation' },
            { key: 'hasApiAccess', label: 'API Access' },
            { key: 'hasPrioritySupport', label: 'Priority Support' },
            { key: 'hasWhiteLabel', label: 'White Label' },
            { key: 'isFeatured', label: 'Destaque' },
            { key: 'isActive', label: 'Ativo' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CACADB', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={(form as any)[key]} onChange={e => set(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} style={{ ...btnSmall, padding: '10px 20px' }}>Cancelar</button>
          <button onClick={() => onSave(form)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#A855F7', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Save size={16} /> {plan ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B6B7B', marginBottom: '6px',
}
