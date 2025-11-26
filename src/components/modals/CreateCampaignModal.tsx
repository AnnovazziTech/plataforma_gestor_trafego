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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5FF] to-[#BF00FF] flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Nova Campanha</h2>
                  <p className="text-xs text-[#6B6B7B]">Configure sua nova campanha</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 text-[#6B6B7B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Black Friday 2024"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#00F5FF]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Plataforma
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`p-3 rounded-xl border transition-all ${
                        platform === p
                          ? 'border-[#00F5FF] bg-[#00F5FF]/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <PlatformIcon platform={p} size={24} className="mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Objetivo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {objectives.map((obj) => (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => setObjective(obj)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        objective === obj
                          ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF]'
                          : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {objectiveLabels[obj]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Orcamento Diario (R$)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#6B6B7B] focus:outline-none focus:border-[#00F5FF]/50 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Criar Campanha
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
