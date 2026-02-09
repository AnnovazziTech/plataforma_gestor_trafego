'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Trash2, Circle } from 'lucide-react'
import { useApp } from '@/contexts'
import { formatDate } from '@/lib/utils/financial'

interface Props {
  clientId: string
  clientName: string
}

export function ClientTasksSection({ clientId, clientName }: Props) {
  const { clientTasks, addClientTask, toggleClientTask, removeClientTask } = useApp()
  const [newTask, setNewTask] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

  const tasks = clientTasks.filter(t => t.clientId === clientId)
  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  const handleAdd = async () => {
    if (!newTask.trim()) return
    await addClientTask({ clientId, description: newTask, date: newDate })
    setNewTask('')
  }

  return (
    <div style={{
      padding: '20px', borderRadius: '16px',
      backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFF', marginBottom: '16px' }}>
        Tarefas - {clientName}
      </h3>

      {/* Add task */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nova tarefa..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: '10px',
            backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
            color: '#FFF', fontSize: '13px', outline: 'none',
          }}
        />
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '10px',
            backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)',
            color: '#FFF', fontSize: '13px', outline: 'none', width: '140px',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '8px 16px', borderRadius: '10px', border: 'none',
            backgroundColor: '#3B82F6', color: '#FFF', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
          }}
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {/* Pending tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {pending.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
              borderRadius: '10px', backgroundColor: '#0D0D14',
            }}
          >
            <button
              onClick={() => toggleClientTask(task.id)}
              style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: 0 }}
            >
              <Circle size={18} />
            </button>
            <span style={{ flex: 1, fontSize: '13px', color: '#E0E0E0' }}>{task.description}</span>
            <span style={{ fontSize: '11px', color: '#6B6B7B' }}>{formatDate(task.date)}</span>
            <button
              onClick={() => removeClientTask(task.id)}
              style={{ background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer', padding: '2px' }}
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <>
          <div style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '16px', marginBottom: '8px' }}>
            Concluidas ({completed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {completed.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px',
                  borderRadius: '10px', opacity: 0.5,
                }}
              >
                <button
                  onClick={() => toggleClientTask(task.id)}
                  style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 0 }}
                >
                  <Check size={18} />
                </button>
                <span style={{ flex: 1, fontSize: '13px', color: '#8B8B9B', textDecoration: 'line-through' }}>
                  {task.description}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6B6B7B', fontSize: '13px' }}>
          Nenhuma tarefa para este cliente
        </div>
      )}
    </div>
  )
}
