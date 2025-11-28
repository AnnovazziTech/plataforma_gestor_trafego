'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Megaphone } from 'lucide-react'
import { Button, PlatformIcon } from '@/components/ui'
import { useApp } from '@/contexts'
import { Platform, CampaignStatus, CampaignObjective } from '@/types'

const platforms: Platform[] = ['meta', 'google', 'tiktok', 'linkedin', 'twitter', 'pinterest']
const objectives: CampaignObjective[] = ['awareness', 'traffic', 'engagement', 'leads', 'sales', 'app_installs']

const objectiveLabels: Record<CampaignObjective, string> = {
  awareness: 'Reconhecimento',
  traffic: 'Trafego',
  engagement: 'Engajamento',
  leads: 'Geracao de Leads',
  app_installs: 'Instalacoes de App',
  sales: 'Vendas',
}

export function CreateCampaignModal() {
  const { isCreateCampaignModalOpen, setIsCreateCampaignModalOpen, addCampaign, showToast } = useApp()

  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<Platform>('meta')
  const [objective, setObjective] = useState<CampaignObjective>('sales')
  const [budget, setBudget] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('Por favor, informe o nome da campanha', 'error')
      return
    }

    if (!budget || parseFloat(budget) <= 0) {
      showToast('Por favor, informe um orcamento valido', 'error')
      return
    }

    const now = new Date().toISOString()
    const newCampaign = {
      id: Math.random().toString(36).substring(7),
      name: name.trim(),
      platform,
      status: 'draft' as CampaignStatus,
      objective,
      budget: parseFloat(budget),
      spent: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      metrics: {
        impressions: 0,
        reach: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        conversions: 0,
        conversionRate: 0,
        costPerConversion: 0,
        roas: 0,
        frequency: 0,
        engagement: 0,
      },
      adSets: [],
      createdAt: now,
      updatedAt: now,
    }

    addCampaign(newCampaign)
    setIsCreateCampaignModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setPlatform('meta')
    setObjective('sales')
    setBudget('')
  }

  const handleClose = () => {
    setIsCreateCampaignModalOpen(false)
    resetForm()
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
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#6B6B7B',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Black Friday 2024"
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
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: platform === p ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: platform === p ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: objective === obj ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: objective === obj ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: objective === obj ? '#3B82F6' : '#FFFFFF',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {objectiveLabels[obj]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#A0A0B0', marginBottom: '8px' }}>
                  Orcamento Diario (R$)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
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
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={handleClose} style={{ flex: 1 }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" style={{ flex: 1 }}>
                  Criar Campanha
                </Button>
              </div>
            </form>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  )
}
