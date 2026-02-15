'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { Header } from '@/components/layout'
import { Button, Badge } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Link,
  Eye,
  EyeOff,
  Upload,
  Mail,
  Save,
  ChevronRight,
  Smartphone,
  Trash2,
  LogOut,
  Camera,
  Loader2,
  Clock,
  Construction,
} from 'lucide-react'

type TabType = 'profile' | 'notifications' | 'connections' | 'security' | 'billing'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { showToast } = useApp()

  // User data from session
  const currentUser = {
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    image: (session?.user as any)?.avatar || (session?.user as any)?.image || null,
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificacoes', icon: Bell },
    { id: 'security', label: 'Seguranca', icon: Shield },
    { id: 'connections', label: 'Conexoes', icon: Link },
    { id: 'billing', label: 'Assinatura', icon: CreditCard },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Configuracoes"
        subtitle="Gerencie suas preferencias e configuracoes"
        showCreateButton={false}
      />

      <main style={{ padding: '24px 32px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Sidebar */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: 'rgba(18, 18, 26, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              {/* User Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {currentUser.image ? (
                  <img
                    src={currentUser.image}
                    alt="Profile"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                  }}>
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>{currentUser.name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{currentUser.email}</p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: activeTab === tab.id ? '#3B82F6' : '#A0A0B0',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                    <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: activeTab === tab.id ? 1 : 0 }} />
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#EF4444',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <LogOut size={18} />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <ProfileSection key="profile" showToast={showToast} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsSection key="notifications" showToast={showToast} />
              )}
              {activeTab === 'security' && (
                <SecuritySection key="security" showToast={showToast} />
              )}
              {activeTab === 'connections' && (
                <ComingSoonSection key="connections" icon={Link} title="Conexoes" description="Conecte suas contas de anuncios" color="#FACC15" />
              )}
              {activeTab === 'billing' && (
                <ComingSoonSection key="billing" icon={CreditCard} title="Assinatura" description="Gerencie seus pacotes e pagamentos" color="#FACC15" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '24px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <LogOut style={{ width: '24px', height: '24px', color: '#EF4444' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  Sair da Conta
                </h3>
                <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                  Tem certeza que deseja sair? Voce precisara fazer login novamente.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
                <button
                  onClick={async () => {
                    setShowLogoutModal(false)
                    showToast('Voce foi desconectado!', 'success')
                    await signOut({ callbackUrl: '/login' })
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// "Em breve" placeholder for Connections and Billing
// ============================================================
function ComingSoonSection({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any
  title: string
  description: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        padding: '32px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: `${color}18`,
          color,
        }}>
          <Icon size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{title}</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>{description}</p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(250, 204, 21, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Construction size={28} style={{ color: '#FACC15' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px' }}>
          Em breve
        </h3>
        <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0, textAlign: 'center', maxWidth: '360px' }}>
          Estamos trabalhando nessa funcionalidade. Em breve voce podera utilizar.
        </p>
      </div>
    </motion.div>
  )
}

// ============================================================
// Profile Section — loads real data, saves to API
// ============================================================
function ProfileSection({
  showToast,
}: {
  showToast: (msg: string, type: any) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [initials, setInitials] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
  })

  // Load profile from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) return
        const data = await res.json()
        setFormData({
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          company: data.currentOrganization?.name || '',
          website: data.currentOrganization?.website || '',
        })
        if (data.user?.avatar) {
          setProfilePhoto(data.user.avatar)
        }
        setInitials(
          (data.user?.name || '')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
        )
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          avatar: profilePhoto,
          organizationName: formData.company,
          organizationWebsite: formData.website || null,
        }),
      })
      if (response.ok) {
        showToast('Perfil atualizado com sucesso!', 'success')
      } else {
        const err = await response.json()
        showToast(err.error || 'Erro ao salvar perfil', 'error')
      }
    } catch {
      showToast('Erro ao salvar perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 256
          let w = img.width
          let h = img.height
          if (w > h) { h = (h / w) * MAX; w = MAX }
          else { w = (w / h) * MAX; h = MAX }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/webp', 0.8))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Maximo 5MB.', 'error')
      return
    }
    if (!file.type.startsWith('image/')) {
      showToast('Arquivo invalido. Use JPG, PNG ou GIF.', 'error')
      return
    }
    const compressed = await compressImage(file)
    setProfilePhoto(compressed)
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '32px',
          borderRadius: '16px',
          backgroundColor: 'rgba(18, 18, 26, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '80px',
          paddingBottom: '80px',
        }}
      >
        <Loader2 size={24} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        padding: '32px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3B82F6',
        }}>
          <User size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Perfil</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Atualize suas informacoes pessoais</p>
        </div>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ position: 'relative' }}>
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(59, 130, 246, 0.3)',
              }}
            />
          ) : (
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 600,
              color: '#FFFFFF',
            }}>
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              border: '3px solid #12121A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Camera size={14} style={{ color: '#FFFFFF' }} />
          </button>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={14} />
                Alterar Foto
              </span>
            </Button>
            {profilePhoto && (
              <button
                onClick={handleRemovePhoto}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={12} />
                Remover
              </button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>JPG, PNG ou GIF. Maximo 5MB.</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#6B6B7B', marginBottom: '8px' }}>
              E-mail (somente leitura)
            </label>
            <input
              type="email"
              value={formData.email}
              readOnly
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+55 11 99999-9999"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
              Empresa
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar Alteracoes'}
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// Notifications Section — persists to DB via notificationPrefs
// ============================================================
function NotificationsSection({ showToast }: { showToast: (msg: string, type: any) => void }) {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    budgetAlerts: true,
    performanceAlerts: false,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) return
        const data = await res.json()
        const prefs = data.user?.notificationPrefs
        if (prefs && typeof prefs === 'object') {
          setSettings(prev => ({ ...prev, ...prefs }))
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleSetting = async (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPrefs: updated }),
      })
      if (res.ok) {
        showToast('Preferencia atualizada!', 'success')
      } else {
        // revert on error
        setSettings(settings)
        showToast('Erro ao salvar preferencia', 'error')
      }
    } catch {
      setSettings(settings)
      showToast('Erro ao salvar preferencia', 'error')
    }
  }

  const options = [
    { key: 'emailAlerts', label: 'Alertas por E-mail', description: 'Receba alertas importantes por e-mail', icon: Mail },
    { key: 'pushNotifications', label: 'Notificacoes Push', description: 'Notificacoes no navegador em tempo real', icon: Bell },
    { key: 'weeklyReports', label: 'Relatorios Semanais', description: 'Resumo semanal de performance', icon: Mail },
    { key: 'budgetAlerts', label: 'Alertas de Budget', description: 'Quando o budget atinge 80%', icon: CreditCard },
    { key: 'performanceAlerts', label: 'Alertas de Performance', description: 'Quando metricas caem abaixo do esperado', icon: Bell },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        padding: '32px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3B82F6',
        }}>
          <Bell size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Notificacoes</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure suas preferencias de notificacao</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 size={24} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((option) => (
            <div
              key={option.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#6B6B7B',
                }}>
                  <option.icon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>{option.label}</h4>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{option.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(option.key as keyof typeof settings)}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: settings[option.key as keyof typeof settings] ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '4px',
                  left: settings[option.key as keyof typeof settings] ? '24px' : '4px',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ============================================================
// Security Section — password change, 2FA "em breve", real sessions
// ============================================================
function SecuritySection({ showToast }: { showToast: (msg: string, type: any) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState<{ id: string; expires: string }[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) return
        const data = await res.json()
        setSessions(data.sessions || [])
      } catch {
        // silently fail
      } finally {
        setSessionsLoading(false)
      }
    }
    load()
  }, [])

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Preencha todos os campos de senha', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('As senhas nao conferem', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('A nova senha deve ter pelo menos 8 caracteres', 'error')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast(data.error || 'Erro ao alterar senha', 'error')
        return
      }

      showToast('Senha alterada com sucesso!', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showToast('Erro ao alterar senha', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        padding: '32px',
        borderRadius: '16px',
        backgroundColor: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
        }}>
          <Shield size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Seguranca</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Proteja sua conta</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Change Password */}
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>Alterar Senha</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B6B7B', marginBottom: '8px' }}>Senha Atual</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B6B7B', marginBottom: '8px' }}>Nova Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B6B7B', marginBottom: '8px' }}>Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" size="sm" onClick={handleChangePassword} disabled={isLoading}>
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </div>
        </div>

        {/* 2FA — Em breve */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#6B6B7B' }}>
              <Smartphone size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>Autenticacao em Duas Etapas</h4>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Adicione uma camada extra de seguranca</p>
            </div>
          </div>
          <Badge variant="warning">Em breve</Badge>
        </div>

        {/* Sessions — real data */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>Sessoes Ativas</h3>
          {sessionsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <Loader2 size={20} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : sessions.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6B6B7B' }}>Nenhuma sessao ativa encontrada.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map((session, i) => (
                <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#6B6B7B' }}>
                      <Clock size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                        Sessao {i + 1}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
                        Expira em {new Date(session.expires).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {i === 0 && <Badge variant="success">Atual</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Shared input style
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  fontSize: '14px',
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
}
