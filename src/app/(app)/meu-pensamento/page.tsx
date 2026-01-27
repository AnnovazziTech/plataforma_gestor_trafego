'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Plus,
  Search,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  Calendar,
  Tag,
  Star,
  StarOff,
  Trash2,
  Edit,
  MoreVertical,
  Filter,
  Clock,
  CheckCircle,
  Circle,
  X,
  Save,
  Bookmark,
} from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isFavorite: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

interface Idea {
  id: string
  content: string
  category: string
  status: 'new' | 'testing' | 'validated' | 'discarded'
  createdAt: string
}

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  progress: number
  isCompleted: boolean
}

// Dados serao carregados do banco de dados via API

const categories = ['Todas', 'Estrategia', 'Copywriting', 'Processos', 'Criativos', 'Publicos', 'Metricas']

const statusConfig = {
  new: { label: 'Nova', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  testing: { label: 'Testando', color: '#FACC15', bg: 'rgba(250, 204, 21, 0.1)' },
  validated: { label: 'Validada', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  discarded: { label: 'Descartada', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

export default function MeuPensamentoPage() {
  const { showToast } = useApp()
  const [activeTab, setActiveTab] = useState<'notes' | 'ideas' | 'goals'>('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'Estrategia', tags: '' })
  const [newIdea, setNewIdea] = useState({ content: '', category: 'Estrategia' })

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todas' || n.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const handleSaveNote = () => {
    if (!newNote.title.trim()) {
      showToast('Informe o titulo da nota', 'error')
      return
    }

    const note: Note = {
      id: editingNote?.id || Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t),
      isFavorite: editingNote?.isFavorite || false,
      isPinned: editingNote?.isPinned || false,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? note : n))
      showToast('Nota atualizada!', 'success')
    } else {
      setNotes(prev => [note, ...prev])
      showToast('Nota criada!', 'success')
    }

    setShowNoteModal(false)
    setEditingNote(null)
    setNewNote({ title: '', content: '', category: 'Estrategia', tags: '' })
  }

  const handleSaveIdea = () => {
    if (!newIdea.content.trim()) {
      showToast('Escreva sua ideia', 'error')
      return
    }

    const idea: Idea = {
      id: Date.now().toString(),
      content: newIdea.content,
      category: newIdea.category,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
    }

    setIdeas(prev => [idea, ...prev])
    setShowIdeaModal(false)
    setNewIdea({ content: '', category: 'Estrategia' })
    showToast('Ideia salva!', 'success')
  }

  const toggleFavorite = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
  }

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n))
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    showToast('Nota removida!', 'info')
  }

  const updateIdeaStatus = (id: string, status: Idea['status']) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    showToast('Status atualizado!', 'success')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Meu Pensamento"
        subtitle="Anote suas ideias, estrategias e metas"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          {[
            { id: 'notes', label: 'Notas', icon: BookOpen },
            { id: 'ideas', label: 'Ideias', icon: Lightbulb },
            { id: 'goals', label: 'Metas', icon: Target },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#3B82F6' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === tab.id ? '#FFFFFF' : '#A0A0B0',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B6B7B' }} />
                  <input
                    type="text"
                    placeholder="Buscar notas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      paddingLeft: '48px',
                      paddingRight: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#12121A' }}>{cat}</option>
                  ))}
                </select>
              </div>
              <Button variant="primary" onClick={() => setShowNoteModal(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                Nova Nota
              </Button>
            </div>

            {/* Notes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(18, 18, 26, 0.8)',
                    border: note.isPinned ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setEditingNote(note)
                    setNewNote({
                      title: note.title,
                      content: note.content,
                      category: note.category,
                      tags: note.tags.join(', '),
                    })
                    setShowNoteModal(true)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {note.isPinned && <Bookmark size={14} style={{ color: '#FACC15' }} />}
                      <Badge variant="default" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                        {note.category}
                      </Badge>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(note.id)
                      }}
                      style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {note.isFavorite ? (
                        <Star size={16} style={{ color: '#FACC15', fill: '#FACC15' }} />
                      ) : (
                        <StarOff size={16} style={{ color: '#6B6B7B' }} />
                      )}
                    </button>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px' }}>
                    {note.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6B6B7B', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content}
                  </p>

                  {note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', fontSize: '11px', color: '#6B6B7B' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#4B4B5B' }}>
                      Atualizado em {formatDate(note.updatedAt)}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => togglePin(note.id)}
                        style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: note.isPinned ? '#FACC15' : '#6B6B7B', cursor: 'pointer' }}
                      >
                        <Bookmark size={14} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <Button variant="primary" onClick={() => setShowIdeaModal(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                Nova Ideia
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: config.color }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{config.label}</span>
                    <Badge variant="default" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#6B6B7B' }}>
                      {ideas.filter(i => i.status === status).length}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ideas.filter(i => i.status === status).map((idea) => (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(18, 18, 26, 0.8)',
                          border: `1px solid ${config.color}30`,
                        }}
                      >
                        <p style={{ fontSize: '14px', color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.5 }}>
                          {idea.content}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Badge variant="default" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#6B6B7B' }}>
                            {idea.category}
                          </Badge>
                          <select
                            value={idea.status}
                            onChange={(e) => updateIdeaStatus(idea.id, e.target.value as Idea['status'])}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: 'none',
                              color: '#6B6B7B',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            {Object.entries(statusConfig).map(([s, c]) => (
                              <option key={s} value={s} style={{ backgroundColor: '#12121A' }}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(18, 18, 26, 0.8)',
                  border: goal.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      {goal.isCompleted ? (
                        <CheckCircle size={24} style={{ color: '#10B981' }} />
                      ) : (
                        <Circle size={24} style={{ color: '#6B6B7B' }} />
                      )}
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: goal.isCompleted ? '#10B981' : '#FFFFFF', margin: 0, textDecoration: goal.isCompleted ? 'line-through' : 'none' }}>
                        {goal.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6B6B7B', margin: '0 0 16px', marginLeft: '36px' }}>
                      {goal.description}
                    </p>

                    <div style={{ marginLeft: '36px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Progresso</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: goal.progress === 100 ? '#10B981' : '#3B82F6' }}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <div
                          style={{
                            width: `${goal.progress}%`,
                            height: '100%',
                            borderRadius: '4px',
                            background: goal.progress === 100 ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px' }}>
                    <Calendar size={14} style={{ color: '#6B6B7B' }} />
                    <span style={{ fontSize: '13px', color: '#6B6B7B' }}>
                      {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Nova Nota */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowNoteModal(false); setEditingNote(null); setNewNote({ title: '', content: '', category: 'Estrategia', tags: '' }) }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  {editingNote ? 'Editar Nota' : 'Nova Nota'}
                </h2>
                <button onClick={() => { setShowNoteModal(false); setEditingNote(null); }} style={{ padding: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Titulo</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titulo da nota"
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Conteudo</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Escreva sua nota..."
                    rows={8}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Categoria</label>
                    <select
                      value={newNote.category}
                      onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                      style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat} style={{ backgroundColor: '#12121A' }}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Tags (separadas por virgula)</label>
                    <input
                      type="text"
                      value={newNote.tags}
                      onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="ex: facebook, escala"
                      style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button variant="ghost" onClick={() => { setShowNoteModal(false); setEditingNote(null); }} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleSaveNote} style={{ flex: 1 }}>
                    <Save size={16} style={{ marginRight: '6px' }} />
                    {editingNote ? 'Salvar Alteracoes' : 'Criar Nota'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nova Ideia */}
      <AnimatePresence>
        {showIdeaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIdeaModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '450px',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Nova Ideia</h2>
                <button onClick={() => setShowIdeaModal(false)} style={{ padding: '8px', background: 'none', border: 'none', color: '#6B6B7B', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Sua ideia</label>
                  <textarea
                    value={newIdea.content}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Descreva sua ideia..."
                    rows={4}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#A0A0B0', marginBottom: '8px' }}>Categoria</label>
                  <select
                    value={newIdea.category}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat} style={{ backgroundColor: '#12121A' }}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button variant="ghost" onClick={() => setShowIdeaModal(false)} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleSaveIdea} style={{ flex: 1 }}>
                    <Lightbulb size={16} style={{ marginRight: '6px' }} />
                    Salvar Ideia
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
