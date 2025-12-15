'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Check, ExternalLink, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useApp } from '@/contexts'

const platforms = [
  {
    id: 'facebook_ads' as const,
    name: 'Facebook Ads',
    description: 'Conecte sua conta do Meta Ads Manager',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: '#1877F2',
  },
  {
    id: 'google_ads' as const,
    name: 'Google Ads',
    description: 'Conecte sua conta do Google Ads',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} fill="currentColor">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
      </svg>
    ),
    color: '#4285F4',
  },
  {
    id: 'linkedin_ads' as const,
    name: 'LinkedIn Ads',
    description: 'Conecte sua conta do LinkedIn Campaign Manager',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: '#0A66C2',
  },
  {
    id: 'tiktok_ads' as const,
    name: 'TikTok Ads',
    description: 'Conecte sua conta do TikTok Ads Manager',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    color: '#00F2EA',
  },
  {
    id: 'whatsapp' as const,
    name: 'WhatsApp Business',
    description: 'Conecte sua conta do WhatsApp Business API',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    color: '#25D366',
  },
]

export function ConnectAccountsModal() {
  const {
    isConnectAccountsModalOpen,
    setIsConnectAccountsModalOpen,
    connectedAccounts,
    connectAccount,
    disconnectAccount,
    syncCampaigns,
    integrationsLoading,
    fetchIntegrations,
  } = useApp()

  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const isConnected = (platformId: string) => {
    return connectedAccounts.some(acc => acc.platform === platformId && acc.connected)
  }

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(acc => acc.platform === platformId && acc.connected)
  }

  const handleConnect = async (platformId: typeof platforms[number]['id']) => {
    if (isConnected(platformId)) {
      // Se ja conectado, desconecta
      const account = getConnectedAccount(platformId)
      if (account) {
        setLoadingPlatform(platformId)
        await disconnectAccount(account.id)
        setLoadingPlatform(null)
      }
    } else {
      // Conectar - redireciona para OAuth
      setLoadingPlatform(platformId)
      const authUrl = await connectAccount(platformId)

      if (authUrl) {
        // Redirecionar para autenticacao OAuth
        window.location.href = authUrl
      }
      setLoadingPlatform(null)
    }
  }

  const handleSync = async (accountId: string) => {
    setSyncingId(accountId)
    await syncCampaigns(accountId)
    setSyncingId(null)
  }

  const handleRefresh = async () => {
    await fetchIntegrations()
  }

  return (
    <AnimatePresence>
      {isConnectAccountsModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsConnectAccountsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
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
              maxWidth: '672px',
              maxHeight: '90vh',
              background: 'linear-gradient(to bottom right, #12121A, #0D0D14)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  }}
                >
                  <Link2 style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Conectar Contas</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Conecte suas plataformas de anuncios para importar dados</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleRefresh}
                  disabled={integrationsLoading}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: integrationsLoading ? 'not-allowed' : 'pointer',
                  }}
                  title="Atualizar"
                >
                  <RefreshCw size={18} style={{ animation: integrationsLoading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
                <button
                  onClick={() => setIsConnectAccountsModalOpen(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#6B6B7B',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '60vh',
                overflowY: 'auto',
              }}
            >
              {platforms.map((platform) => {
                const connected = isConnected(platform.id)
                const account = getConnectedAccount(platform.id)
                const isLoadingThis = loadingPlatform === platform.id
                const isSyncingThis = syncingId === account?.id

                return (
                  <motion.div
                    key={platform.id}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      border: connected
                        ? `1px solid ${platform.color}50`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: connected
                        ? `${platform.color}10`
                        : 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: `${platform.color}20`,
                          color: platform.color,
                        }}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>{platform.name}</h3>
                          {connected && (
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                fontSize: '12px',
                                fontWeight: 500,
                                borderRadius: '9999px',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#34D399',
                              }}
                            >
                              <Check size={12} />
                              Conectado
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                          {connected && account ? account.name : platform.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {connected && account && platform.id !== 'whatsapp' && (
                        <button
                          onClick={() => handleSync(account.id)}
                          disabled={isSyncingThis}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#3B82F6',
                            cursor: isSyncingThis ? 'not-allowed' : 'pointer',
                          }}
                          title="Sincronizar campanhas"
                        >
                          <RefreshCw size={16} style={{ animation: isSyncingThis ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                      )}
                      {connected && (
                        <button
                          onClick={() => {
                            if (account) disconnectAccount(account.id)
                          }}
                          disabled={isLoadingThis}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#F87171',
                            cursor: isLoadingThis ? 'not-allowed' : 'pointer',
                          }}
                          title="Desconectar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <Button
                        variant={connected ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isLoadingThis}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}
                      >
                        {isLoadingThis ? (
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : connected ? (
                          <>
                            <ExternalLink size={14} />
                            Gerenciar
                          </>
                        ) : (
                          <>
                            <Link2 size={14} />
                            Conectar
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                {connectedAccounts.filter(a => a.connected).length} de {platforms.length} plataformas conectadas
              </p>
              <Button variant="primary" onClick={() => setIsConnectAccountsModalOpen(false)}>
                Concluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
