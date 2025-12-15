'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { Header } from '@/components/layout'
import { Button, Badge, PlatformIcon } from '@/components/ui'
import { useApp } from '@/contexts'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Link,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Moon,
  Sun,
  Globe,
  Mail,
  Save,
  ChevronRight,
  Smartphone,
  Trash2,
  Plus,
  LogOut,
  Settings,
  Palette,
  RefreshCw,
  Camera,
} from 'lucide-react'
import { Platform } from '@/types'

type TabType = 'profile' | 'notifications' | 'connections' | 'security' | 'billing' | 'preferences'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { showToast, connectedAccounts, connectAccount, disconnectAccount } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // User data from session with fallback
  const currentUser = {
    name: session?.user?.name || 'Usuário',
    email: session?.user?.email || 'usuario@email.com',
    image: (session?.user as any)?.avatar || (session?.user as any)?.image || null,
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'connections', label: 'Conexões', icon: Link },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'billing', label: 'Assinatura', icon: CreditCard },
    { id: 'preferences', label: 'Preferências', icon: Palette },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        title="Configurações"
        subtitle="Gerencie suas preferências e configurações"
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
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
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
                <ProfileSection
                  key="profile"
                  showToast={showToast}
                  profilePhoto={profilePhoto}
                  setProfilePhoto={setProfilePhoto}
                  currentUser={currentUser}
                />
              )}
              {activeTab === 'connections' && (
                <ConnectionsSection
                  key="connections"
                  showToast={showToast}
                  connectedAccounts={connectedAccounts}
                  connectAccount={connectAccount}
                  disconnectAccount={disconnectAccount}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationsSection key="notifications" showToast={showToast} />
              )}
              {activeTab === 'security' && (
                <SecuritySection key="security" showToast={showToast} />
              )}
              {activeTab === 'billing' && (
                <BillingSection key="billing" showToast={showToast} />
              )}
              {activeTab === 'preferences' && (
                <PreferencesSection key="preferences" showToast={showToast} />
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
                  Tem certeza que deseja sair? Você precisará fazer login novamente.
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
                    showToast('Você foi desconectado!', 'success')
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

function ProfileSection({
  showToast,
  profilePhoto,
  setProfilePhoto,
  currentUser,
}: {
  showToast: (msg: string, type: any) => void
  profilePhoto: string | null
  setProfilePhoto: (photo: string | null) => void
  currentUser: { name: string; email: string; image: string | null }
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: '+55 11 99999-9999',
    company: 'Agência Digital',
    website: 'https://agencia.com.br',
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        showToast('Perfil atualizado com sucesso!', 'success')
      } else {
        showToast('Erro ao salvar perfil', 'error')
      }
    } catch (error) {
      showToast('Erro ao salvar perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Arquivo muito grande. Máximo 5MB.', 'error')
        return
      }
      // Verificar tipo
      if (!file.type.startsWith('image/')) {
        showToast('Arquivo inválido. Use JPG, PNG ou GIF.', 'error')
        return
      }
      // Criar URL para preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string)
        showToast('Foto atualizada com sucesso!', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    showToast('Foto removida!', 'info')
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
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Atualize suas informações pessoais</p>
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
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          {/* Camera overlay */}
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
          {/* Hidden file input */}
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
          <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>JPG, PNG ou GIF. Máximo 5MB.</p>
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
              style={{
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
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              style={{
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
              }}
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
              style={{
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
              }}
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
              style={{
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
              }}
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
            style={{
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
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} style={{ animation: saving ? 'spin 1s linear infinite' : 'none' }} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

type AccountPlatform = 'facebook_ads' | 'google_ads' | 'linkedin_ads' | 'tiktok_ads' | 'whatsapp'

function ConnectionsSection({
  showToast,
  connectedAccounts,
  connectAccount,
  disconnectAccount
}: {
  showToast: (msg: string, type: any) => void
  connectedAccounts: any[]
  connectAccount: (platform: AccountPlatform) => void
  disconnectAccount: (id: string) => void
}) {
  const [syncing, setSyncing] = useState<string | null>(null)

  const availablePlatforms = [
    { id: 'facebook_ads', name: 'Facebook Ads', description: 'Meta Business Suite' },
    { id: 'google_ads', name: 'Google Ads', description: 'Google Ads Manager' },
    { id: 'linkedin_ads', name: 'LinkedIn Ads', description: 'LinkedIn Campaign Manager' },
    { id: 'tiktok_ads', name: 'TikTok Ads', description: 'TikTok for Business' },
    { id: 'whatsapp', name: 'WhatsApp Business', description: 'WhatsApp Business API' },
  ]

  const handleSync = (id: string) => {
    setSyncing(id)
    setTimeout(() => {
      setSyncing(null)
      showToast('Conta sincronizada com sucesso!', 'success')
    }, 1500)
  }

  // Verificar quais plataformas já estão conectadas
  const connectedPlatformIds = connectedAccounts
    .filter(a => a.connected)
    .map(a => a.platform)

  const unconnectedPlatforms = availablePlatforms.filter(
    p => !connectedPlatformIds.includes(p.id)
  )

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
          backgroundColor: 'rgba(250, 204, 21, 0.1)',
          color: '#FACC15',
        }}>
          <Link size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Conexões</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Conecte suas contas de anúncios</p>
        </div>
      </div>

      {/* Connected Accounts */}
      {connectedAccounts.filter(a => a.connected).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Contas Conectadas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {connectedAccounts.filter(a => a.connected).map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    padding: '10px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}>
                    <PlatformIcon platform={account.platform as Platform} size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>{account.name}</h4>
                    <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
                      {account.email || `Conectado em ${account.connectedAt}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Badge variant="success">Conectado</Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleSync(account.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#6B6B7B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RefreshCw
                        size={14}
                        style={{
                          animation: syncing === account.id ? 'spin 1s linear infinite' : 'none',
                        }}
                      />
                    </button>
                    <button
                      onClick={() => disconnectAccount(account.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Platforms to Connect */}
      {unconnectedPlatforms.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Adicionar Nova Conexão
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {unconnectedPlatforms.map((platform) => (
              <motion.button
                key={platform.id}
                onClick={() => connectAccount(platform.id as AccountPlatform)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}>
                  <PlatformIcon platform={platform.id as Platform} size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                    {platform.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>
                    {platform.description}
                  </p>
                </div>
                <Plus size={18} style={{ color: '#3B82F6' }} />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* All connected message */}
      {unconnectedPlatforms.length === 0 && (
        <div style={{
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          textAlign: 'center',
        }}>
          <Check size={24} style={{ color: '#10B981', marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', color: '#10B981', margin: 0 }}>
            Todas as plataformas estão conectadas!
          </p>
        </div>
      )}
    </motion.div>
  )
}

function NotificationsSection({ showToast }: { showToast: (msg: string, type: any) => void }) {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    budgetAlerts: true,
    performanceAlerts: false,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    showToast('Preferência atualizada!', 'success')
  }

  const options = [
    { key: 'emailAlerts', label: 'Alertas por E-mail', description: 'Receba alertas importantes por e-mail', icon: Mail },
    { key: 'pushNotifications', label: 'Notificações Push', description: 'Notificações no navegador em tempo real', icon: Bell },
    { key: 'weeklyReports', label: 'Relatórios Semanais', description: 'Resumo semanal de performance', icon: Mail },
    { key: 'budgetAlerts', label: 'Alertas de Budget', description: 'Quando o budget atinge 80%', icon: CreditCard },
    { key: 'performanceAlerts', label: 'Alertas de Performance', description: 'Quando métricas caem abaixo do esperado', icon: Bell },
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
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Notificações</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure suas preferências de notificação</p>
        </div>
      </div>

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
    </motion.div>
  )
}

function SecuritySection({ showToast }: { showToast: (msg: string, type: any) => void }) {
  const [showPassword, setShowPassword] = useState(false)

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
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Segurança</h2>
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
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 48px 0 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
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
                  style={{
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
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B6B7B', marginBottom: '8px' }}>Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{
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
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" size="sm" onClick={() => showToast('Senha alterada com sucesso!', 'success')}>
                Alterar Senha
              </Button>
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#6B6B7B' }}>
              <Smartphone size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>Autenticação em Duas Etapas</h4>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Adicione uma camada extra de segurança</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => showToast('2FA configurado!', 'success')}>
            Ativar
          </Button>
        </div>

        {/* Sessions */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>Sessões Ativas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { device: 'Chrome - Windows', location: 'São Paulo, BR', current: true },
              { device: 'Safari - iPhone', location: 'São Paulo, BR', current: false },
            ].map((session, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>{session.device}</p>
                  <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>{session.location}</p>
                </div>
                {session.current ? (
                  <Badge variant="success">Atual</Badge>
                ) : (
                  <button style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function BillingSection({ showToast }: { showToast: (msg: string, type: any) => void }) {
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
          backgroundColor: 'rgba(250, 204, 21, 0.1)',
          color: '#FACC15',
        }}>
          <CreditCard size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Assinatura</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Gerencie seu plano e pagamentos</p>
        </div>
      </div>

      {/* Current Plan */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Badge variant="info">Plano Pro</Badge>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: '12px 0 4px' }}>R$ 197/mês</h3>
            <p style={{ fontSize: '14px', color: '#A0A0B0', margin: 0 }}>Renovação em 15/03/2024</p>
          </div>
          <Button variant="secondary">
            Fazer Upgrade
          </Button>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>Recursos do Plano</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            'Contas de anúncios ilimitadas',
            'Relatórios automatizados',
            'Automações avançadas',
            'Suporte prioritário',
            'API Access',
            'White Label',
          ].map((feature) => (
            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} style={{ color: '#10B981' }} />
              <span style={{ fontSize: '14px', color: '#A0A0B0' }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>Método de Pagamento</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <CreditCard size={20} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>•••• •••• •••• 4242</p>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: 0 }}>Expira 12/26</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Alterar</Button>
        </div>
      </div>
    </motion.div>
  )
}

function PreferencesSection({ showToast }: { showToast: (msg: string, type: any) => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [language, setLanguage] = useState('pt-BR')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [currency, setCurrency] = useState('BRL')

  const savePreference = async (key: string, value: string) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
    } catch (error) {
      console.error('Erro ao salvar preferência:', error)
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
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          color: '#8B5CF6',
        }}>
          <Palette size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Preferências</h2>
          <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Personalize sua experiência</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Theme */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
            Tema
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <button
              onClick={() => { setTheme('dark'); showToast('Tema alterado!', 'success'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: theme === 'dark' ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <Moon size={20} style={{ color: theme === 'dark' ? '#3B82F6' : '#6B6B7B' }} />
              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>Escuro</span>
            </button>
            <button
              onClick={() => { setTheme('light'); showToast('Tema alterado!', 'success'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: theme === 'light' ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
              }}
            >
              <Sun size={20} style={{ color: theme === 'light' ? '#3B82F6' : '#6B6B7B' }} />
              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>Claro</span>
            </button>
          </div>
        </div>

        {/* Language */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
            Idioma
          </label>
          <div style={{ position: 'relative' }}>
            <Globe style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6B6B7B' }} />
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); showToast('Idioma alterado!', 'success'); }}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '48px',
                paddingRight: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14px',
                color: '#FFFFFF',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="pt-BR" style={{ backgroundColor: '#12121A' }}>Português (Brasil)</option>
              <option value="en-US" style={{ backgroundColor: '#12121A' }}>English (US)</option>
              <option value="es-ES" style={{ backgroundColor: '#12121A' }}>Español</option>
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
            Fuso Horário
          </label>
          <select
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value)
              savePreference('timezone', e.target.value)
              showToast('Fuso horário alterado!', 'success')
            }}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              color: '#FFFFFF',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="America/Sao_Paulo" style={{ backgroundColor: '#12121A' }}>América/São Paulo (GMT-3)</option>
            <option value="America/New_York" style={{ backgroundColor: '#12121A' }}>América/Nova York (GMT-5)</option>
            <option value="Europe/London" style={{ backgroundColor: '#12121A' }}>Europa/Londres (GMT)</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
            Moeda Padrão
          </label>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value)
              savePreference('currency', e.target.value)
              showToast('Moeda alterada!', 'success')
            }}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              color: '#FFFFFF',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="BRL" style={{ backgroundColor: '#12121A' }}>Real Brasileiro (R$)</option>
            <option value="USD" style={{ backgroundColor: '#12121A' }}>Dólar Americano ($)</option>
            <option value="EUR" style={{ backgroundColor: '#12121A' }}>Euro (€)</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}
