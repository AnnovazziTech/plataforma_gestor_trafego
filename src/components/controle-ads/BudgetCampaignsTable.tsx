'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Edit3, Check, X, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/financial'

interface BudgetCampaign {
  id: string
  strategyId: string
  name: string
  maxMeta: number
  maxGoogle: number
  dailyBudget: number
  startDate: string
  spentMeta: number
  spentGoogle: number
  previousLeadCost?: number
  currentLeadCost?: number
  previousDate?: string
  currentDate?: string
  strategy?: { id: string; name: string; totalBudget: number }
}

interface Props {
  campaigns: BudgetCampaign[]
  allCampaigns: BudgetCampaign[]
  onUpdate: (id: string, data: any) => void
  onRemove: (id: string) => void
}

function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export function BudgetCampaignsTable({ campaigns, allCampaigns, onUpdate, onRemove }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  // Calcula totais por estrategia usando TODAS as campanhas (nao apenas as filtradas)
  const strategyTotals = (() => {
    const map = new Map<string, { totalSpent: number; totalDaily: number; budget: number }>()
    allCampaigns.forEach(c => {
      const existing = map.get(c.strategyId) || { totalSpent: 0, totalDaily: 0, budget: c.strategy?.totalBudget || 0 }
      existing.totalSpent += (c.spentMeta || 0) + (c.spentGoogle || 0)
      existing.totalDaily += c.dailyBudget || 0
      if (c.strategy?.totalBudget) existing.budget = c.strategy.totalBudget
      map.set(c.strategyId, existing)
    })
    return map
  })()

  const startEditing = (c: BudgetCampaign) => {
    setEditingId(c.id)
    setEditData({
      name: c.name,
      maxMeta: c.maxMeta.toString(),
      maxGoogle: c.maxGoogle.toString(),
      dailyBudget: c.dailyBudget.toString(),
      startDate: toDateInputValue(c.startDate),
      spentMeta: c.spentMeta.toString(),
      spentGoogle: c.spentGoogle.toString(),
      currentLeadCost: c.currentLeadCost?.toString() || '',
      previousLeadCost: c.previousLeadCost?.toString() || '',
      currentDate: toDateInputValue(c.currentDate),
      previousDate: toDateInputValue(c.previousDate),
    })
  }

  const saveEdit = (id: string) => {
    onUpdate(id, {
      name: editData.name,
      maxMeta: parseFloat(editData.maxMeta) || 0,
      maxGoogle: parseFloat(editData.maxGoogle) || 0,
      dailyBudget: parseFloat(editData.dailyBudget) || 0,
      startDate: editData.startDate || undefined,
      spentMeta: parseFloat(editData.spentMeta) || 0,
      spentGoogle: parseFloat(editData.spentGoogle) || 0,
      currentLeadCost: editData.currentLeadCost ? parseFloat(editData.currentLeadCost) : null,
      previousLeadCost: editData.previousLeadCost ? parseFloat(editData.previousLeadCost) : null,
      currentDate: editData.currentDate || null,
      previousDate: editData.previousDate || null,
    })
    setEditingId(null)
  }

  if (campaigns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B7B' }}>
        Nenhuma campanha de orcamento encontrada
      </div>
    )
  }

  const editInputStyle: React.CSSProperties = {
    width: '90px', padding: '5px 7px', borderRadius: '8px',
    backgroundColor: 'rgba(10,10,15,0.8)', border: '1px solid rgba(59,130,246,0.3)',
    color: '#FFF', fontSize: '12px', outline: 'none', textAlign: 'right',
    transition: 'border-color 0.2s',
  }

  const editDateInputStyle: React.CSSProperties = {
    ...editInputStyle,
    width: '130px',
    textAlign: 'left',
    colorScheme: 'dark',
  }

  const editNameInputStyle: React.CSSProperties = {
    ...editInputStyle,
    width: '140px',
    textAlign: 'left',
  }

  const headers = ['Campanha', 'Meta (Max)', 'Google (Max)', 'Diario', 'Gasto Meta', 'Gasto Google', 'Gasto Total', 'Saldo / Dias', 'Custo/Lead', 'Otimizacao', 'Acoes']

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#6B6B7B',
                textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, i) => {
            const totalSpent = c.spentMeta + c.spentGoogle
            const stTotals = strategyTotals.get(c.strategyId)
            const strategyBudget = stTotals?.budget || c.strategy?.totalBudget || 0
            const totalStrategySpent = stTotals?.totalSpent || totalSpent
            const saldoRestante = strategyBudget - totalStrategySpent
            const totalDaily = stTotals?.totalDaily || c.dailyBudget
            const daysLeft = totalDaily > 0 ? Math.max(0, Math.ceil(saldoRestante / totalDaily)) : Infinity
            const isEditing = editingId === c.id

            return (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  backgroundColor: isEditing ? 'rgba(59,130,246,0.03)' : 'transparent',
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Campanha */}
                <td style={{ padding: '12px', fontSize: '13px', fontWeight: 500, color: '#FFF' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="text" value={editData.name}
                        onChange={e => setEditData((p: any) => ({ ...p, name: e.target.value }))}
                        style={editNameInputStyle}
                        placeholder="Nome"
                      />
                      <input
                        type="date" value={editData.startDate}
                        onChange={e => setEditData((p: any) => ({ ...p, startDate: e.target.value }))}
                        style={{ ...editDateInputStyle, width: '140px', fontSize: '11px' }}
                      />
                    </div>
                  ) : (
                    <>
                      {c.name}
                      <div style={{ fontSize: '11px', color: '#6B6B7B' }}>Inicio: {formatDate(c.startDate)}</div>
                    </>
                  )}
                </td>
                {/* Meta (Max) */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <input
                      type="number" step="0.01" value={editData.maxMeta}
                      onChange={e => setEditData((p: any) => ({ ...p, maxMeta: e.target.value }))}
                      style={editInputStyle}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#A0A0B0' }}>{formatCurrency(c.maxMeta)}</span>
                  )}
                </td>
                {/* Google (Max) */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <input
                      type="number" step="0.01" value={editData.maxGoogle}
                      onChange={e => setEditData((p: any) => ({ ...p, maxGoogle: e.target.value }))}
                      style={editInputStyle}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#A0A0B0' }}>{formatCurrency(c.maxGoogle)}</span>
                  )}
                </td>
                {/* Diario */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <input
                      type="number" step="0.01" value={editData.dailyBudget}
                      onChange={e => setEditData((p: any) => ({ ...p, dailyBudget: e.target.value }))}
                      style={editInputStyle}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}>{formatCurrency(c.dailyBudget)}</span>
                  )}
                </td>
                {/* Gasto Meta */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <input
                      type="number" step="0.01" value={editData.spentMeta}
                      onChange={e => setEditData((p: any) => ({ ...p, spentMeta: e.target.value }))}
                      style={editInputStyle}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: c.spentMeta > c.maxMeta ? '#EF4444' : '#10B981' }}>
                      {formatCurrency(c.spentMeta)}
                    </span>
                  )}
                </td>
                {/* Gasto Google */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <input
                      type="number" step="0.01" value={editData.spentGoogle}
                      onChange={e => setEditData((p: any) => ({ ...p, spentGoogle: e.target.value }))}
                      style={editInputStyle}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: c.spentGoogle > c.maxGoogle ? '#EF4444' : '#10B981' }}>
                      {formatCurrency(c.spentGoogle)}
                    </span>
                  )}
                </td>
                {/* Gasto Total (Meta + Google) */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 600,
                    color: totalSpent > strategyBudget ? '#EF4444' : '#FFF',
                  }}>
                    {formatCurrency(totalSpent)}
                  </span>
                </td>
                {/* Saldo Restante / Dias */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 500,
                    color: saldoRestante >= 0 ? '#10B981' : '#EF4444',
                  }}>
                    {formatCurrency(saldoRestante)}
                  </span>
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>
                    {daysLeft === Infinity ? '-' : `~${daysLeft} dias restantes`}
                  </div>
                </td>
                {/* Custo/Lead */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="number" step="0.01" placeholder="Atual"
                        value={editData.currentLeadCost}
                        onChange={e => setEditData((p: any) => ({ ...p, currentLeadCost: e.target.value }))}
                        style={editInputStyle}
                      />
                      <input
                        type="number" step="0.01" placeholder="Anterior"
                        value={editData.previousLeadCost}
                        onChange={e => setEditData((p: any) => ({ ...p, previousLeadCost: e.target.value }))}
                        style={editInputStyle}
                      />
                    </div>
                  ) : c.currentLeadCost != null ? (
                    <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 500 }}>
                      {formatCurrency(c.currentLeadCost)}
                      {c.previousLeadCost != null && (
                        <span style={{
                          fontSize: '11px', marginLeft: '4px',
                          color: c.currentLeadCost <= c.previousLeadCost ? '#10B981' : '#EF4444',
                        }}>
                          {c.currentLeadCost <= c.previousLeadCost ? '\u2193' : '\u2191'}
                        </span>
                      )}
                      {c.previousLeadCost != null && (
                        <div style={{ fontSize: '11px', color: '#6B6B7B' }}>
                          Ant: {formatCurrency(c.previousLeadCost)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6B6B7B' }}>-</span>
                  )}
                </td>
                {/* Otimizacao (datas) */}
                <td style={{ padding: '12px' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#6B6B7B', minWidth: '28px' }}>Atual</span>
                        <input
                          type="date" value={editData.currentDate}
                          onChange={e => setEditData((p: any) => ({ ...p, currentDate: e.target.value }))}
                          style={editDateInputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#6B6B7B', minWidth: '28px' }}>Ant.</span>
                        <input
                          type="date" value={editData.previousDate}
                          onChange={e => setEditData((p: any) => ({ ...p, previousDate: e.target.value }))}
                          style={editDateInputStyle}
                        />
                      </div>
                    </div>
                  ) : (c.currentDate || c.previousDate) ? (
                    <div style={{ fontSize: '12px' }}>
                      {c.currentDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A0A0B0' }}>
                          <Calendar size={11} style={{ color: '#3B82F6' }} />
                          <span>{formatDate(c.currentDate)}</span>
                        </div>
                      )}
                      {c.previousDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B6B7B', marginTop: '2px' }}>
                          <Calendar size={11} style={{ color: '#6B6B7B' }} />
                          <span style={{ fontSize: '11px' }}>{formatDate(c.previousDate)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6B6B7B' }}>-</span>
                  )}
                </td>
                {/* Acoes */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(c.id)}
                          style={{
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '6px', color: '#10B981', cursor: 'pointer', padding: '4px 8px',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
                          }}
                          title="Salvar"
                        >
                          <Check size={13} /> Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '6px', color: '#EF4444', cursor: 'pointer', padding: '4px 8px',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
                          }}
                          title="Cancelar"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(c)}
                          style={{
                            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
                            borderRadius: '6px', color: '#3B82F6', cursor: 'pointer', padding: '4px 8px',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
                            transition: 'all 0.2s',
                          }}
                          title="Editar campanha"
                        >
                          <Edit3 size={13} /> Editar
                        </button>
                        <button
                          onClick={() => onRemove(c.id)}
                          style={{
                            background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px', color: '#6B6B7B', cursor: 'pointer', padding: '4px 6px',
                            transition: 'all 0.2s',
                          }}
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
