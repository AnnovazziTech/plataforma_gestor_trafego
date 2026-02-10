'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Edit3, Check, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/financial'
import { calcularPrevisao30D, calcularFinalizaraEm } from '@/lib/utils/financial'

interface BudgetCampaign {
  id: string
  name: string
  maxMeta: number
  maxGoogle: number
  dailyBudget: number
  startDate: string
  spentMeta: number
  spentGoogle: number
  previousLeadCost?: number
  currentLeadCost?: number
  strategy?: { id: string; name: string; totalBudget: number }
}

interface Props {
  campaigns: BudgetCampaign[]
  onUpdate: (id: string, data: any) => void
  onRemove: (id: string) => void
}

export function BudgetCampaignsTable({ campaigns, onUpdate, onRemove }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  const startEditing = (c: BudgetCampaign) => {
    setEditingId(c.id)
    setEditData({
      spentMeta: c.spentMeta.toString(),
      spentGoogle: c.spentGoogle.toString(),
      currentLeadCost: c.currentLeadCost?.toString() || '',
      previousLeadCost: c.previousLeadCost?.toString() || '',
    })
  }

  const saveEdit = (id: string) => {
    onUpdate(id, {
      spentMeta: parseFloat(editData.spentMeta) || 0,
      spentGoogle: parseFloat(editData.spentGoogle) || 0,
      currentLeadCost: editData.currentLeadCost ? parseFloat(editData.currentLeadCost) : null,
      previousLeadCost: editData.previousLeadCost ? parseFloat(editData.previousLeadCost) : null,
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
    width: '80px', padding: '4px 6px', borderRadius: '6px',
    backgroundColor: '#0A0A0F', border: '1px solid rgba(59,130,246,0.3)',
    color: '#FFF', fontSize: '12px', outline: 'none', textAlign: 'right',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Campanha', 'Meta (Max)', 'Google (Max)', 'Diario', 'Gasto Meta', 'Gasto Google', 'Previsao 30D', 'Custo/Lead', 'Acoes'].map(h => (
              <th key={h} style={{
                padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: '#6B6B7B',
                textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, i) => {
            const totalSpent = c.spentMeta + c.spentGoogle
            const totalMax = c.maxMeta + c.maxGoogle
            const daysLeft = calcularFinalizaraEm(totalMax, totalSpent, c.dailyBudget)
            const isEditing = editingId === c.id

            return (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td style={{ padding: '12px', fontSize: '13px', fontWeight: 500, color: '#FFF' }}>
                  {c.name}
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>Inicio: {formatDate(c.startDate)}</div>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#A0A0B0' }}>{formatCurrency(c.maxMeta)}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#A0A0B0' }}>{formatCurrency(c.maxGoogle)}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}>{formatCurrency(c.dailyBudget)}</td>
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
                <td style={{ padding: '12px', fontSize: '13px', color: '#A0A0B0' }}>
                  {formatCurrency(calcularPrevisao30D(c.dailyBudget))}
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>
                    {daysLeft === Infinity ? '-' : `~${daysLeft} dias restantes`}
                  </div>
                </td>
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
                          {c.currentLeadCost <= c.previousLeadCost ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6B6B7B' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(c.id)}
                          style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: '4px' }}
                          title="Salvar"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(c)}
                          style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px' }}
                          title="Editar gastos"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onRemove(c.id)}
                          style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px' }}
                          title="Remover"
                        >
                          <Trash2 size={14} />
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
