'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Header } from '@/components/layout'
import { useApp } from '@/contexts'
import { formatDate } from '@/lib/utils/financial'
import {
  Loader2, Plus, Check, Circle, Trash2, CalendarDays, Tag, Clock,
  ChevronDown, ChevronRight, X, Filter,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TAGS = [
  { label: 'Urgente', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  { label: 'Follow-up', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { label: 'Reuniao', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  { label: 'Entrega', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { label: 'Revisao', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  { label: 'Briefing', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
]

interface Client {
  id: string
  name: string
}

interface TaskItem {
  id: string
  clientId: string
  description: string
  date: string
  completed: boolean
  client?: { id: string; name: string }
  createdAt: string
}

export default function AgendaPage() {
  const { clientTasks, clientTasksLoading, fetchClientTasks, addClientTask, toggleClientTask, showToast } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [showModal, setShowModal] = useState(false)
  const [tab, setTab] = useState<'pending' | 'completed'>('pending')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({ clientId: '', description: '', date: '', time: '' })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      }
    } catch (error) {
    }
  }, [])

  useEffect(() => {
    fetchClients()
    fetchClientTasks()
  }, [fetchClients, fetchClientTasks])

  // Parse tag from description: "[Tag1][Tag2] actual description"
  const parseTask = (task: TaskItem) => {
    const tagRegex = /\[([^\]]+)\]/g
    const tags: string[] = []
    let match
    while ((match = tagRegex.exec(task.description)) !== null) {
      tags.push(match[1])
    }
    const cleanDesc = task.description.replace(/\[[^\]]+\]\s*/g, '').trim()
    return { ...task, tags, cleanDesc }
  }

  const parsedTasks = useMemo(() => clientTasks.map(parseTask), [clientTasks])

  const filteredTasks = useMemo(() => {
    let tasks = parsedTasks.filter(t => tab === 'pending' ? !t.completed : t.completed)
    if (filterTag) {
      tasks = tasks.filter(t => t.tags.includes(filterTag))
    }
    return tasks
  }, [parsedTasks, tab, filterTag])

  // Group by date
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filteredTasks>()
    for (const task of filteredTasks) {
      const dateKey = new Date(task.date).toISOString().split('T')[0]
      if (!groups.has(dateKey)) groups.set(dateKey, [])
      groups.get(dateKey)!.push(task)
    }
    // Sort dates descending
    const sorted = Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    return sorted
  }, [filteredTasks])

  const toggleDate = (date: string) => {
    setCollapsedDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientId || !formData.description || !formData.date) {
      showToast('Preencha todos os campos obrigatorios', 'error')
      return
    }
    setSaving(true)
    try {
      // Build description with tags
      const tagPrefix = selectedTags.map(t => `[${t}]`).join('')
      const fullDesc = tagPrefix ? `${tagPrefix} ${formData.description}` : formData.description
      const dateStr = formData.time ? `${formData.date}T${formData.time}:00` : `${formData.date}T12:00:00`

      await addClientTask({
        clientId: formData.clientId,
        description: fullDesc,
        date: dateStr,
      })
      showToast('Tarefa criada!', 'success')
      setShowModal(false)
      setFormData({ clientId: '', description: '', date: '', time: '' })
      setSelectedTags([])
      fetchClientTasks()
    } catch {
      showToast('Erro ao criar tarefa', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    await toggleClientTask(id)
    fetchClientTasks()
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/client-tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Tarefa removida!', 'success')
        fetchClientTasks()
      }
    } catch {
      showToast('Erro ao remover tarefa', 'error')
    }
  }

  const pendingCount = parsedTasks.filter(t => !t.completed).length
  const completedCount = parsedTasks.filter(t => t.completed).length

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) return 'Hoje'
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Amanha'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ontem'

    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  }

  const getTaskTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const h = d.getHours()
    const m = d.getMinutes()
    if (h === 12 && m === 0) return null // default time = no time
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  if (clientTasksLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header title="Agenda" subtitle="Tarefas e compromissos" variant="simple" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Agenda" subtitle="Tarefas e compromissos" variant="simple" />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <TabButton active={tab === 'pending'} onClick={() => setTab('pending')} label={`Pendentes (${pendingCount})`} />
            <TabButton active={tab === 'completed'} onClick={() => setTab('completed')} label={`Concluidas (${completedCount})`} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Tag filter */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {filterTag && (
                <button
                  onClick={() => setFilterTag(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                    borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 500,
                    backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', cursor: 'pointer',
                  }}
                >
                  <X size={12} /> Limpar filtro
                </button>
              )}
              {TAGS.map(tag => (
                <button
                  key={tag.label}
                  onClick={() => setFilterTag(filterTag === tag.label ? null : tag.label)}
                  style={{
                    padding: '4px 10px', borderRadius: '8px', border: 'none',
                    fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                    backgroundColor: filterTag === tag.label ? tag.bg : 'transparent',
                    color: filterTag === tag.label ? tag.color : '#6B6B7B',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '10px', border: 'none',
                background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                color: '#FFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Nova Tarefa
            </button>
          </div>
        </div>

        {/* Tasks grouped by date */}
        {grouped.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#6B6B7B',
            backgroundColor: '#12121A', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <CalendarDays size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 500 }}>
              {tab === 'pending' ? 'Nenhuma tarefa pendente' : 'Nenhuma tarefa concluida'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {grouped.map(([dateKey, tasks]) => (
              <div key={dateKey} style={{
                backgroundColor: '#12121A', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                {/* Date header */}
                <button
                  onClick={() => toggleDate(dateKey)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', border: 'none', backgroundColor: 'transparent',
                    cursor: 'pointer', color: '#FFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {collapsedDates.has(dateKey) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <CalendarDays size={16} style={{ color: '#3B82F6' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{formatDateLabel(dateKey)}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B6B7B', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '6px' }}>
                    {tasks.length}
                  </span>
                </button>

                {/* Task items */}
                {!collapsedDates.has(dateKey) && (
                  <div style={{ padding: '0 20px 14px' }}>
                    {tasks.map(task => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(task.id)}
                          style={{
                            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                            marginTop: '2px', border: `2px solid ${task.completed ? '#10B981' : 'rgba(255,255,255,0.2)'}`,
                            backgroundColor: task.completed ? '#10B981' : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {task.completed && <Check size={14} color="#FFF" />}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Tags + description */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            {task.tags.map(tagLabel => {
                              const tagDef = TAGS.find(t => t.label === tagLabel)
                              return (
                                <span key={tagLabel} style={{
                                  padding: '1px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                  backgroundColor: tagDef?.bg || 'rgba(255,255,255,0.1)',
                                  color: tagDef?.color || '#A0A0B0',
                                }}>
                                  {tagLabel}
                                </span>
                              )
                            })}
                          </div>
                          <div style={{
                            fontSize: '14px', color: task.completed ? '#6B6B7B' : '#FFF',
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}>
                            {task.cleanDesc}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#6B6B7B' }}>
                              {task.client?.name || 'Cliente'}
                            </span>
                            {getTaskTime(task.date) && (
                              <span style={{ fontSize: '11px', color: '#6B6B7B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={10} /> {getTaskTime(task.date)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(task.id)}
                          style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
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
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Nova Tarefa</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Client */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Cliente *</label>
                  <select
                    value={formData.clientId}
                    onChange={e => setFormData(p => ({ ...p, clientId: e.target.value }))}
                    required
                    style={inputStyle}
                  >
                    <option value="">Selecione o cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Descricao *</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    required
                    rows={3}
                    placeholder="Descreva a tarefa..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                {/* Date + Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Data *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '6px', display: 'block' }}>Horario (opcional)</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: '#A0A0B0', marginBottom: '8px', display: 'block' }}>Etiquetas</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {TAGS.map(tag => {
                      const isSelected = selectedTags.includes(tag.label)
                      return (
                        <button
                          key={tag.label}
                          type="button"
                          onClick={() => {
                            setSelectedTags(prev =>
                              isSelected ? prev.filter(t => t !== tag.label) : [...prev, tag.label]
                            )
                          }}
                          style={{
                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                            border: `1px solid ${isSelected ? tag.color : 'rgba(255,255,255,0.1)'}`,
                            backgroundColor: isSelected ? tag.bg : 'transparent',
                            color: isSelected ? tag.color : '#6B6B7B',
                            cursor: 'pointer',
                          }}
                        >
                          <Tag size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          {tag.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                    color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Salvando...' : 'Criar Tarefa'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
  color: '#FFF', fontSize: '14px', outline: 'none',
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: '10px', border: 'none',
        fontSize: '13px', fontWeight: 500, cursor: 'pointer',
        backgroundColor: active ? 'rgba(59,130,246,0.15)' : 'transparent',
        color: active ? '#3B82F6' : '#6B6B7B',
      }}
    >
      {label}
    </button>
  )
}
