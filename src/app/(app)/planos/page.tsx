'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout'
import { useApp } from '@/contexts'
import {
  Check,
  Crown,
  Sparkles,
  ExternalLink,
  Package as PackageIcon,
  Loader2,
} from 'lucide-react'

interface PackageData {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  currency: string
  modulesSlugs: string[]
  isBundle: boolean
  isFree: boolean
  sortOrder: number
}

interface SubscriptionData {
  id: string
  packageSlug: string
  status: string
  isFree: boolean
}

export default function PlanosPage() {
  const { showToast } = useApp()
  const searchParams = useSearchParams()

  const [packages, setPackages] = useState<PackageData[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pkgRes, subRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/stripe/subscriptions'),
      ])
      const pkgData = await pkgRes.json()
      const subData = await subRes.json()
      setPackages(pkgData.packages || [])
      setSubscriptions(subData.subscriptions || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      const pkg = searchParams.get('package')
      showToast(`Pacote ${pkg || ''} assinado com sucesso!`, 'success')
      fetchData()
    }
    if (searchParams.get('canceled') === 'true') {
      showToast('Checkout cancelado', 'info')
    }
  }, [searchParams, showToast, fetchData])

  const activeSubscriptionSlugs = subscriptions
    .filter(s => s.status === 'ACTIVE' || s.status === 'TRIALING')
    .map(s => s.packageSlug)

  const hasBundleActive = subscriptions.some(
    s => (s.status === 'ACTIVE' || s.status === 'TRIALING') && packages.find(p => p.slug === s.packageSlug)?.isBundle
  )

  const hasAnyPaidPackage = subscriptions.some(
    s => (s.status === 'ACTIVE' || s.status === 'TRIALING') && !s.isFree
  )

  const handleCheckout = async (slug: string) => {
    setCheckoutLoading(slug)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageSlug: slug }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Erro ao iniciar checkout', 'error')
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      showToast('Erro ao iniciar checkout', 'error')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Erro ao abrir portal', 'error')
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      showToast('Erro ao abrir portal', 'error')
    } finally {
      setPortalLoading(false)
    }
  }

  // Module slug to display name map
  const moduleNames: Record<string, string> = {
    financeiro: 'Dashboard Financeiro',
    clientes: 'Clientes',
    'controle-ads': 'Controle ADS',
    'criativos-free': 'Criativos',
    noticias: 'Noticias',
    resumo: 'Resumo',
    agenda: 'Agenda',
    orcamento: 'Orcamento',
    campanhas: 'Campanhas',
    analytics: 'Analytics',
    relatorios: 'Relatorios',
    automacao: 'Automacao',
    prospeccao: 'Prospeccao',
    mensagens: 'Mensagens',
    social: 'Redes Sociais',
    'meu-link': 'Meu Link',
    marketplace: 'Marketplace',
    cursos: 'Cursos',
    'meu-pensamento': 'Meu Pensamento',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F' }}>
      <Header title="Planos e Pacotes" subtitle="Escolha os pacotes ideais para o seu negocio" />

      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Portal link */}
        {hasAnyPaidPackage && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#A0A0B0', fontSize: '14px', cursor: 'pointer',
              }}
            >
              {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
              Gerenciar assinaturas no Stripe
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={32} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {packages.map((pkg, index) => {
              const isActive = activeSubscriptionSlugs.includes(pkg.slug)
              const isCompleto = pkg.isBundle
              const isDisabled = isActive || (hasBundleActive && !pkg.isFree && !pkg.isBundle) || checkoutLoading !== null

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '28px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(18, 18, 26, 0.8)',
                    border: isCompleto
                      ? '2px solid rgba(250, 204, 21, 0.3)'
                      : isActive
                        ? '2px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Badges */}
                  {isCompleto && (
                    <div style={{
                      position: 'absolute', top: '-12px', right: '16px',
                      padding: '4px 12px', borderRadius: '9999px',
                      background: 'linear-gradient(to right, #FACC15, #F59E0B)',
                      color: '#000', fontSize: '11px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Crown size={12} />
                      Melhor valor
                    </div>
                  )}

                  {isActive && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '16px',
                      padding: '4px 12px', borderRadius: '9999px',
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#22C55E', fontSize: '11px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Check size={12} />
                      Ativo
                    </div>
                  )}

                  {/* Header */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        padding: '8px', borderRadius: '10px',
                        backgroundColor: isCompleto ? 'rgba(250, 204, 21, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      }}>
                        {isCompleto
                          ? <Sparkles size={20} style={{ color: '#FACC15' }} />
                          : <PackageIcon size={20} style={{ color: '#3B82F6' }} />
                        }
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                        {pkg.name}
                      </h3>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B6B7B', margin: 0 }}>{pkg.description}</p>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '20px' }}>
                    {pkg.isFree ? (
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#22C55E' }}>Gratuito</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#6B6B7B' }}>R$</span>
                        <span style={{ fontSize: '36px', fontWeight: 800, color: '#FFFFFF' }}>{pkg.priceMonthly}</span>
                        <span style={{ fontSize: '14px', color: '#6B6B7B' }}>/mes</span>
                      </div>
                    )}
                  </div>

                  {/* Modules list */}
                  <div style={{ flex: 1, marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#4B4B5B', textTransform: 'uppercase', marginBottom: '12px' }}>
                      {pkg.isBundle ? 'Todos os modulos pagos' : 'Modulos inclusos'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pkg.modulesSlugs.filter(s => !['financeiro', 'clientes', 'controle-ads', 'criativos-free', 'noticias', 'resumo', 'agenda', 'orcamento'].includes(s) || pkg.isFree).map(slug => (
                        <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
                          <span style={{ fontSize: '14px', color: '#A0A0B0' }}>{moduleNames[slug] || slug}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  {pkg.isFree ? (
                    <div style={{
                      padding: '12px', borderRadius: '12px', textAlign: 'center',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E',
                      fontSize: '14px', fontWeight: 600,
                    }}>
                      Incluso na sua conta
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckout(pkg.slug)}
                      disabled={isDisabled}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                        fontSize: '14px', fontWeight: 700, cursor: isDisabled ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: isDisabled ? 0.5 : 1,
                        ...(isActive
                          ? { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }
                          : isCompleto
                            ? { background: 'linear-gradient(to right, #FACC15, #F59E0B)', color: '#000' }
                            : { background: 'linear-gradient(to right, #3B82F6, #2563EB)', color: '#FFFFFF' }
                        ),
                      }}
                    >
                      {checkoutLoading === pkg.slug ? (
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : isActive ? (
                        <>
                          <Check size={16} />
                          Ativo
                        </>
                      ) : hasBundleActive ? (
                        'Incluso no Completo'
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Assinar {pkg.name}
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
