'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout'
import { Button, Badge } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  Search,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  Lock,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar: string
  category: string
  level: 'iniciante' | 'intermediario' | 'avancado'
  duration: string
  lessons: number
  students: number
  rating: number
  reviews: number
  thumbnail: string
  progress: number
  isLocked: boolean
  isFeatured: boolean
}

interface Lesson {
  id: string
  title: string
  duration: string
  isCompleted: boolean
  isLocked: boolean
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Facebook Ads do Zero ao Avancado',
    description: 'Aprenda a criar campanhas de alta performance no Facebook e Instagram Ads',
    instructor: 'Pedro Sobral',
    instructorAvatar: 'PS',
    category: 'Facebook Ads',
    level: 'iniciante',
    duration: '12h 30min',
    lessons: 45,
    students: 3420,
    rating: 4.9,
    reviews: 892,
    thumbnail: 'gradient-blue',
    progress: 65,
    isLocked: false,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Google Ads para Gestores de Trafego',
    description: 'Domine o Google Ads e aumente seus resultados com clientes',
    instructor: 'Ana Cardoso',
    instructorAvatar: 'AC',
    category: 'Google Ads',
    level: 'intermediario',
    duration: '10h 15min',
    lessons: 38,
    students: 2150,
    rating: 4.8,
    reviews: 567,
    thumbnail: 'gradient-green',
    progress: 30,
    isLocked: false,
    isFeatured: true,
  },
  {
    id: '3',
    title: 'TikTok Ads: A Nova Fronteira',
    description: 'Aproveite o potencial do TikTok Ads para seus clientes',
    instructor: 'Lucas Mendes',
    instructorAvatar: 'LM',
    category: 'TikTok Ads',
    level: 'iniciante',
    duration: '6h 45min',
    lessons: 24,
    students: 1890,
    rating: 4.7,
    reviews: 423,
    thumbnail: 'gradient-pink',
    progress: 0,
    isLocked: false,
    isFeatured: false,
  },
  {
    id: '4',
    title: 'Copywriting para Anuncios',
    description: 'Escreva copys que convertem e aumentam o ROI das campanhas',
    instructor: 'Julia Santos',
    instructorAvatar: 'JS',
    category: 'Copywriting',
    level: 'intermediario',
    duration: '8h 20min',
    lessons: 32,
    students: 2780,
    rating: 4.9,
    reviews: 712,
    thumbnail: 'gradient-purple',
    progress: 100,
    isLocked: false,
    isFeatured: true,
  },
  {
    id: '5',
    title: 'Analise de Dados e Metricas',
    description: 'Interprete dados e tome decisoes baseadas em metricas reais',
    instructor: 'Rafael Costa',
    instructorAvatar: 'RC',
    category: 'Analytics',
    level: 'avancado',
    duration: '9h 10min',
    lessons: 28,
    students: 1560,
    rating: 4.8,
    reviews: 389,
    thumbnail: 'gradient-orange',
    progress: 0,
    isLocked: true,
    isFeatured: false,
  },
  {
    id: '6',
    title: 'Vendas e Prospeccao de Clientes',
    description: 'Aprenda a vender seus servicos e conquistar mais clientes',
    instructor: 'Marcos Silva',
    instructorAvatar: 'MS',
    category: 'Vendas',
    level: 'iniciante',
    duration: '7h 30min',
    lessons: 26,
    students: 3120,
    rating: 4.9,
    reviews: 834,
    thumbnail: 'gradient-teal',
    progress: 15,
    isLocked: false,
    isFeatured: false,
  },
]

const categories = ['Todos', 'Facebook Ads', 'Google Ads', 'TikTok Ads', 'Copywriting', 'Analytics', 'Vendas']

const levelConfig = {
  iniciante: { label: 'Iniciante', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  intermediario: { label: 'Intermediario', color: '#FACC15', bg: 'rgba(250, 204, 21, 0.1)' },
  avancado: { label: 'Avancado', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

const thumbnailGradients: Record<string, string> = {
  'gradient-blue': 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  'gradient-green': 'linear-gradient(135deg, #10B981, #059669)',
  'gradient-pink': 'linear-gradient(135deg, #EC4899, #BE185D)',
  'gradient-purple': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'gradient-orange': 'linear-gradient(135deg, #F97316, #EA580C)',
  'gradient-teal': 'linear-gradient(135deg, #14B8A6, #0D9488)',
}

export default function CursosPage() {
  const { showToast } = useApp()
  const [courses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100)
  const completedCourses = courses.filter(c => c.progress === 100)

  const handleStartCourse = (course: Course) => {
    if (course.isLocked) {
      showToast('Este curso requer upgrade do plano', 'warning')
      return
    }
    setSelectedCourse(course)
    showToast(`Iniciando ${course.title}...`, 'info')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Cursos"
        subtitle="Aprimore suas habilidades como gestor de trafego"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(18, 18, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <BookOpen size={20} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Cursos Disponiveis</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{courses.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(18, 18, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
                <Play size={20} style={{ color: '#FACC15' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Em Andamento</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{inProgressCourses.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(18, 18, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Award size={20} style={{ color: '#10B981' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Concluidos</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{completedCourses.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(18, 18, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <Trophy size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Certificados</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{completedCourses.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Continue Learning */}
        {inProgressCourses.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Continuar Aprendendo
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {inProgressCourses.slice(0, 2).map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleStartCourse(course)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(18, 18, 26, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      background: thumbnailGradients[course.thumbnail],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PlayCircle size={32} style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px' }}>
                      {course.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{course.instructor}</span>
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>•</span>
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{course.progress}% concluido</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <div
                        style={{
                          width: `${course.progress}%`,
                          height: '100%',
                          borderRadius: '2px',
                          background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                        }}
                      />
                    </div>
                  </div>
                  <ChevronRight size={20} style={{ color: '#6B6B7B' }} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6B6B7B' }} />
              <input
                type="text"
                placeholder="Buscar cursos..."
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

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: selectedCategory === cat ? '#3B82F6' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === cat ? '#FFFFFF' : '#A0A0B0',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 18, 26, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => handleStartCourse(course)}
            >
              {course.isLocked && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }}>
                  <Lock size={16} style={{ color: '#FACC15' }} />
                </div>
              )}

              {/* Thumbnail */}
              <div
                style={{
                  height: '140px',
                  background: thumbnailGradients[course.thumbnail],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <PlayCircle size={48} style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                {course.isFeatured && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(250, 204, 21, 0.9)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#000',
                  }}>
                    Destaque
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Badge variant="default" style={{ backgroundColor: levelConfig[course.level].bg, color: levelConfig[course.level].color }}>
                    {levelConfig[course.level].label}
                  </Badge>
                  <span style={{ fontSize: '12px', color: '#6B6B7B' }}>{course.category}</span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B6B7B', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {course.description}
                </p>

                {/* Instructor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                  }}>
                    {course.instructorAvatar}
                  </div>
                  <span style={{ fontSize: '13px', color: '#A0A0B0' }}>{course.instructor}</span>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                      <Clock size={14} />
                      {course.duration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B6B7B' }}>
                      <BookOpen size={14} />
                      {course.lessons} aulas
                    </span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#FACC15' }}>
                    <Star size={14} fill="#FACC15" />
                    {course.rating}
                  </span>
                </div>

                {/* Progress */}
                {course.progress > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#6B6B7B' }}>Progresso</span>
                      <span style={{ fontSize: '12px', color: course.progress === 100 ? '#10B981' : '#3B82F6' }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <div
                        style={{
                          width: `${course.progress}%`,
                          height: '100%',
                          borderRadius: '2px',
                          background: course.progress === 100 ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <BookOpen size={48} style={{ color: '#6B6B7B', marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', color: '#6B6B7B' }}>Nenhum curso encontrado</p>
            <p style={{ fontSize: '14px', color: '#4B4B5B' }}>Tente ajustar os filtros de busca</p>
          </div>
        )}
      </main>
    </div>
  )
}
