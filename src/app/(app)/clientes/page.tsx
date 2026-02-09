'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout'
import { MetricCard } from '@/components/ui'
import { ClientTasksSection } from '@/components/clientes/ClientTasksSection'
import { useApp } from '@/contexts'
import { formatCurrency, calculateTotalRevenue } from '@/lib/utils/financial'
import {
  Users, UserCheck, FlaskConical, DollarSign, Plus, Trash2, Edit3,
  Loader2, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  contractValue?: number
  monthlyValue?: number
  startDate?: string
  status: string
  notes?: string
}

export default function ClientesPage() {
  const { fetchClientTasks, clientTasks, showToast } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    contractValue: '', monthlyValue: '', startDate: '', status: 'ACTIVE', notes: '',
  })

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
    fetchClientTasks()
  }, [fetchClients, fetchClientTasks])

  const activeClients = clients.filter(c => c.status === 'ACTIVE')
  const testingClients = clients.filter(c => c.status === 'TESTING')
  const totalMonthlyRevenue = clients.reduce((sum, c) => sum + (c.monthlyValue || 0), 0)
  const totalAccumulatedRevenue = clients.reduce((sum, c) => {
    if (c.monthlyValue && c.startDate) {
      return sum + calculateTotalRevenue(c.monthlyValue, c.startDate)
    }
    return sum
  }, 0)

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contractValue: formData.contractValue ? parseFloat(formData.contractValue) : null,
          monthlyValue: formData.monthlyValue ? parseFloat(formData.monthlyValue) : null,
          startDate: formData.startDate || null,
        }),
      })
      if (res.ok) {
        showToast('Cliente criado com sucesso!', 'success')
        setShowAddModal(false)
        setFormData({ name: '', email: '', phone: '', company: '', contractValue: '', monthlyValue: '', startDate: '', status: 'ACTIVE', notes: '' })
        fetchClients()
      }
    } catch (error) {
      showToast('Erro ao criar cliente', 'error')
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== id))
        if (selectedClient?.id === id) setSelectedClient(null)
        showToast('Cliente removido!', 'success')
      }
    } catch (error) {
      showToast('Erro ao remover cliente', 'error')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Clientes" subtitle="Gerencie seus clientes" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Clientes" subtitle="Gerencie seus clientes" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <MetricCard title="Clientes Ativos" value={activeClients.length} format="number" icon={<UserCheck size={20} />} color="green" delay={0} />
          <MetricCard title="Em Teste" value={testingClients.length} format="number" icon={<FlaskConical size={20} />} color="yellow" delay={0.1} />
          <MetricCard title="Receita Mensal" value={totalMonthlyRevenue} format="currency" icon={<DollarSign size={20} />} color="blue" delay={0.2} />
          <MetricCard title="Receita Acumulada" value={totalAccumulatedRevenue} format="currency" icon={<DollarSign size={20} />} color="purple" delay={0.3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1fr 1fr' : '1fr', gap: '24px' }}>
          {/* Client list */}
          <div style={{
            padding: '24px', borderRadius: '16px',
            backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFF' }}>
                Clientes ({clients.length})
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                  borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                  color: '#FFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                <Plus size={16} /> Novo Cliente
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelectedClient(client); fetchClientTasks(client.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                    backgroundColor: selectedClient?.id === client.id ? 'rgba(59,130,246,0.1)' : '#0D0D14',
                    border: `1px solid ${selectedClient?.id === client.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.04)'}`,
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: '#FFF', flexShrink: 0,
                  }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#FFF' }}>{client.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B6B7B' }}>
                      {client.company || client.email || 'Sem detalhes'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                      backgroundColor: client.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' :
                        client.status === 'TESTING' ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.15)',
                      color: client.status === 'ACTIVE' ? '#10B981' :
                        client.status === 'TESTING' ? '#FACC15' : '#EF4444',
                    }}>
                      {client.status === 'ACTIVE' ? 'Ativo' : client.status === 'TESTING' ? 'Teste' : client.status === 'PAUSED' ? 'Pausado' : 'Inativo'}
                    </span>
                    {client.monthlyValue && (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#10B981', marginTop: '4px' }}>
                        {formatCurrency(client.monthlyValue)}/mes
                      </div>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteClient(client.id); }}
                    style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
              {clients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B7B' }}>
                  Nenhum cliente cadastrado
                </div>
              )}
            </div>
          </div>

          {/* Tasks panel */}
          {selectedClient && (
            <ClientTasksSection clientId={selectedClient.id} clientName={selectedClient.name} />
          )}
        </div>
      </main>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '480px', backgroundColor: '#12121A',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '24px',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Novo Cliente</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddClient}>
                {[
                  { label: 'Nome *', key: 'name', type: 'text', required: true },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Telefone', key: 'phone', type: 'text' },
                  { label: 'Empresa', key: 'company', type: 'text' },
                  { label: 'Valor Contrato (R$)', key: 'contractValue', type: 'number' },
                  { label: 'Valor Mensal (R$)', key: 'monthlyValue', type: 'number' },
                  { label: 'Data Inicio', key: 'startDate', type: 'date' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={(formData as any)[field.key]}
                      onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      step={field.type === 'number' ? '0.01' : undefined}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '10px',
                        backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFF', fontSize: '14px', outline: 'none',
                      }}
                    />
                  </div>
                ))}
                {/* Status */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFF', fontSize: '14px', outline: 'none',
                    }}
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="TESTING">Em Teste</option>
                    <option value="PAUSED">Pausado</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
                {/* Notes */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFF', fontSize: '14px', outline: 'none', resize: 'vertical',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                    color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Criar Cliente
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
