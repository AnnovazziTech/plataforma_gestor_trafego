'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Megaphone, Loader2 } from 'lucide-react'
import { Button, PlatformIcon } from '@/components/ui'
import { useApp } from '@/contexts'

type Platform = 'meta' | 'google' | 'tiktok' | 'linkedin' | 'twitter' | 'pinterest'
type Objective = 'awareness' | 'traffic' | 'engagement' | 'leads' | 'sales' | 'app_installs'

const platforms: Platform[] = ['meta', 'google', 'tiktok', 'linkedin', 'twitter', 'pinterest']
const objectives: Objective[] = ['awareness', 'traffic', 'engagement', 'leads', 'sales', 'app_installs']

const platformToApi: Record<Platform, string> = {
  meta: 'META',
  google: 'GOOGLE',
  tiktok: 'TIKTOK',
  linkedin: 'LINKEDIN',
  twitter: 'TWITTER',
  pinterest: 'TWITTER', // Pinterest usa mesma API por enquanto
}

const objectiveToApi: Record<Objective, string> = {
  awareness: 'AWARENESS',
  traffic: 'TRAFFIC',
  engagement: 'ENGAGEMENT',
  leads: 'LEADS',
  sales: 'SALES',
  app_installs: 'APP_INSTALLS',
}

const objectiveLabels: Record<Objective, string> = {
  awareness: 'Reconhecimento',
  traffic: 'Trafego',
  engagement: 'Engajamento',
  leads: 'Geracao de Leads',
  app_installs: 'Instalacoes de App',
  sales: 'Vendas',
}

export function CreateCampaignModal() {
  const { isCreateCampaignModalOpen, setIsCreateCampaignModalOpen, addCampaign, showToast, connectedAccounts } = useApp()

  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<Platform>('meta')
  const [objective, setObjective] = useState<Objective>('sales')
  const [budget, setBudget] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('Por favor, informe o nome da campanha', 'error')
      return
    }

    if (!budget || parseFloat(budget) <= 0) {
      showToast('Por favor, informe um orcamento valido', 'error')
      return
    }

    setIsLoading(true)

    try {
      // Preparar dados para a API
      const campaignData = {
        name: name.trim(),
        platform: platformToApi[platform],
        objective: objectiveToApi[objective],
        budget: parseFloat(budget),
        budgetType: 'DAILY',
      }

      // Chamar API via contexto
      const result = await addCampaign(campaignData)

      if (result) {
        setIsCreateCampaignModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setPlatform('meta')
    setObjective('sales')
    setBudget('')
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsCreateCampaignModalOpen(false)
      resetForm()
    }
  }

  return (
    <AnimatePresence>
      {isCreateCampaignModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
              maxWidth: '512px',
              maxHeight: 'calc(100vh - 40px)',
              overflow: 'auto',
              backgroundColor: '#12121A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Megaphone style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Nova Campanha</h2>
                  <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>Configure sua nova campanha</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#6B6B7B',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Black Friday 2024"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                  Plataforma
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                  {platforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      disabled={isLoading}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: platform === p ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: platform === p ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      <PlatformIcon platform={p} size={24} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                  Objetivo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {objectives.map((obj) => (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => setObjective(obj)}
                      disabled={isLoading}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: objective === obj ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: objective === obj ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: objective === obj ? '#3B82F6' : '#FFFFFF',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      {objectiveLabels[obj]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                  Orcamento Diario (R$) *
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={handleClose} style={{ flex: 1 }} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={isLoading}>
                  {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      Criando...
                    </span>
                  ) : (
                    'Criar Campanha'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  )
}
