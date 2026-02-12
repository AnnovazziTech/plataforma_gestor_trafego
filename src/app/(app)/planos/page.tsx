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
  Loader2,
  Zap,
  BarChart3,
  MessageSquare,
  Share2,
  GraduationCap,
  ArrowRight,
  Shield,
  TrendingUp,
  Target,
  Megaphone,
  Users,
  Palette,
  BookOpen,
  Link2,
  ShoppingBag,
  Brain,
  Star,
  Rocket,
  BadgePercent,
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

// Icone e cor por pacote
const packageThemes: Record<string, { icon: any; gradient: string; glow: string; color: string; bgIcon: string }> = {
  starter: {
    icon: Shield,
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    glow: 'rgba(34, 197, 94, 0.15)',
    color: '#22C55E',
    bgIcon: 'rgba(34, 197, 94, 0.1)',
  },
  'ads-pro': {
    icon: Megaphone,
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    glow: 'rgba(59, 130, 246, 0.15)',
    color: '#3B82F6',
    bgIcon: 'rgba(59, 130, 246, 0.1)',
  },
  comercial: {
    icon: Users,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    glow: 'rgba(139, 92, 246, 0.15)',
    color: '#8B5CF6',
    bgIcon: 'rgba(139, 92, 246, 0.1)',
  },
  'social-conteudo': {
    icon: Share2,
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
    glow: 'rgba(236, 72, 153, 0.15)',
    color: '#EC4899',
    bgIcon: 'rgba(236, 72, 153, 0.1)',
  },
  conhecimento: {
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    glow: 'rgba(245, 158, 11, 0.15)',
    color: '#F59E0B',
    bgIcon: 'rgba(245, 158, 11, 0.1)',
  },
  completo: {
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FACC15, #F59E0B, #EF4444)',
    glow: 'rgba(250, 204, 21, 0.2)',
    color: '#FACC15',
    bgIcon: 'rgba(250, 204, 21, 0.15)',
  },
}

// Descricoes impactantes por pacote
const packageDescriptions: Record<string, string> = {
  starter: 'Tudo que voce precisa para comecar a gerenciar seus clientes e financas.',
  'ads-pro': 'Domine suas campanhas com analytics avancado, relatorios detalhados e automacoes inteligentes.',
  comercial: 'Prospecte novos clientes e gerencie conversas em um so lugar.',
  'social-conteudo': 'Publique, agende e venda atraves das redes sociais e seu proprio marketplace.',
  conhecimento: 'Crie e venda cursos online. Organize suas ideias e pensamentos.',
  completo: 'Acesso total a todos os modulos. O pacote definitivo para agencias e gestores de trafego.',
}

// Descricao dos modulos com icone
const moduleInfo: Record<string, { name: string; icon: any }> = {
  financeiro: { name: 'Dashboard Financeiro', icon: TrendingUp },
  clientes: { name: 'Gestao de Clientes', icon: Users },
  'controle-ads': { name: 'Controle de ADS', icon: Target },
  'criativos-free': { name: 'Criativos', icon: Palette },
  noticias: { name: 'Feed de Noticias', icon: BookOpen },
  resumo: { name: 'Resumo Geral', icon: BarChart3 },
  agenda: { name: 'Agenda', icon: Star },
  orcamento: { name: 'Orcamento', icon: BadgePercent },
  campanhas: { name: 'Gestao de Campanhas', icon: Megaphone },
  analytics: { name: 'Analytics Avancado', icon: BarChart3 },
  relatorios: { name: 'Relatorios Profissionais', icon: TrendingUp },
  automacao: { name: 'Automacoes Inteligentes', icon: Zap },
  prospeccao: { name: 'Prospeccao de Clientes', icon: Target },
  mensagens: { name: 'Central de Mensagens', icon: MessageSquare },
  social: { name: 'Redes Sociais', icon: Share2 },
  'meu-link': { name: 'Meu Link (Bio)', icon: Link2 },
  marketplace: { name: 'Marketplace', icon: ShoppingBag },
  cursos: { name: 'Plataforma de Cursos', icon: GraduationCap },
  'meu-pensamento': { name: 'Meu Pensamento', icon: Brain },
}

const starterModules = ['financeiro', 'clientes', 'controle-ads', 'criativos-free', 'noticias', 'resumo', 'agenda', 'orcamento']

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

  // Separar pacotes
  const bundlePackage = packages.find(p => p.isBundle)
  const starterPackage = packages.find(p => p.isFree)
  const paidPackages = packages.filter(p => !p.isBundle && !p.isFree)

  // Calcular economia do Completo
  const totalIndividual = paidPackages.reduce((sum, p) => sum + p.priceMonthly, 0)
  const bundlePrice = bundlePackage?.priceMonthly || 0
  const savingsPercent = totalIndividual > 0 ? Math.round((1 - bundlePrice / totalIndividual) * 100) : 0
  const savingsValue = totalIndividual - bundlePrice

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F' }}>
      <Header title="Planos e Pacotes" subtitle="Escolha os modulos ideais para o seu negocio" />

      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
            <Loader2 size={36} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* ========== HERO SECTION ========== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                marginBottom: '48px',
                padding: '40px 24px',
                borderRadius: '24px',
                background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(250, 204, 21, 0.04) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow orbs */}
              <div style={{
                position: 'absolute', top: '-60px', left: '20%', width: '200px', height: '200px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', top: '-40px', right: '20%', width: '160px', height: '160px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#60A5FA', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  <Rocket size={14} />
                  Monte seu plano ideal
                </motion.div>

                <h1 style={{
                  fontSize: '32px', fontWeight: 800, color: '#FFFFFF',
                  margin: '0 0 12px 0', lineHeight: 1.3,
                }}>
                  Escolha os modulos que fazem sentido{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #3B82F6, #FACC15)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    para voce
                  </span>
                </h1>

                <p style={{
                  fontSize: '16px', color: '#6B6B7B', margin: 0, maxWidth: '600px',
                  marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6,
                }}>
                  Pague apenas pelos recursos que usa. Combine pacotes ou assine o Completo
                  para desbloquear tudo com{' '}
                  <span style={{ color: '#FACC15', fontWeight: 600 }}>
                    {savingsPercent}% de desconto
                  </span>.
                </p>
              </div>
            </motion.div>

            {/* ========== COMPLETO (BUNDLE) - DESTAQUE ========== */}
            {bundlePackage && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  marginBottom: '48px',
                  padding: '2px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.5), rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.2))',
                }}
              >
                <div style={{
                  padding: '36px 40px',
                  borderRadius: '22px',
                  backgroundColor: '#0D0D14',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Background glow */}
                  <div style={{
                    position: 'absolute', top: '-80px', right: '-40px', width: '300px', height: '300px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(250, 204, 21, 0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)', pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '-60px', left: '-20px', width: '200px', height: '200px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none',
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Top row: badge + portal */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '6px 14px', borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                        color: '#000', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        <Crown size={14} />
                        Mais popular
                      </div>
                      {hasAnyPaidPackage && (
                        <button
                          onClick={handlePortal}
                          disabled={portalLoading}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#6B6B7B', fontSize: '13px', cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                          Gerenciar assinaturas
                        </button>
                      )}
                    </div>

                    {/* Main content row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      gap: '40px',
                      alignItems: 'center',
                    }}>
                      {/* Left: Name + description */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                          <div style={{
                            padding: '12px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(245, 158, 11, 0.1))',
                          }}>
                            <Crown size={28} style={{ color: '#FACC15' }} />
                          </div>
                          <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                              {bundlePackage.name}
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6B6B7B', margin: '4px 0 0 0' }}>
                              Acesso total a plataforma
                            </p>
                          </div>
                        </div>
                        <p style={{ fontSize: '15px', color: '#A0A0B0', margin: 0, lineHeight: 1.6 }}>
                          {packageDescriptions['completo']}
                        </p>
                      </div>

                      {/* Center divider */}
                      <div style={{
                        width: '1px', height: '120px',
                        background: 'linear-gradient(180deg, transparent, rgba(250, 204, 21, 0.2), transparent)',
                      }} />

                      {/* Right: Pricing + CTA */}
                      <div style={{ textAlign: 'center' }}>
                        {/* Savings badge */}
                        {savingsValue > 0 && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 12px', borderRadius: '8px', marginBottom: '12px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22C55E', fontSize: '12px', fontWeight: 600,
                          }}>
                            <BadgePercent size={14} />
                            Economize R${savingsValue}/mes ({savingsPercent}% off)
                          </div>
                        )}

                        {/* Price */}
                        <div style={{ marginBottom: '8px' }}>
                          {totalIndividual > 0 && (
                            <div style={{
                              fontSize: '14px', color: '#6B6B7B', marginBottom: '4px',
                              textDecoration: 'line-through',
                            }}>
                              R$ {totalIndividual}/mes
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '16px', color: '#A0A0B0', fontWeight: 500 }}>R$</span>
                            <span style={{ fontSize: '48px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                              {bundlePrice}
                            </span>
                            <span style={{ fontSize: '16px', color: '#6B6B7B' }}>/mes</span>
                          </div>
                        </div>

                        {/* CTA */}
                        {(() => {
                          const isActive = activeSubscriptionSlugs.includes(bundlePackage.slug)
                          const isDisabled = isActive || checkoutLoading !== null
                          return (
                            <button
                              onClick={() => handleCheckout(bundlePackage.slug)}
                              disabled={isDisabled}
                              style={{
                                width: '100%', maxWidth: '280px', padding: '16px 32px', borderRadius: '14px',
                                border: 'none', fontSize: '16px', fontWeight: 700,
                                cursor: isDisabled ? 'default' : 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                opacity: isDisabled ? 0.6 : 1,
                                transition: 'all 0.3s ease',
                                ...(isActive
                                  ? { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }
                                  : {
                                      background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                                      color: '#000',
                                      boxShadow: '0 4px 24px rgba(250, 204, 21, 0.3)',
                                    }
                                ),
                              }}
                            >
                              {checkoutLoading === bundlePackage.slug ? (
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : isActive ? (
                                <>
                                  <Check size={18} />
                                  Plano ativo
                                </>
                              ) : (
                                <>
                                  <Crown size={18} />
                                  Assinar Completo
                                  <ArrowRight size={16} />
                                </>
                              )}
                            </button>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Module chips */}
                    <div style={{
                      marginTop: '28px', paddingTop: '24px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                      <p style={{
                        fontSize: '12px', fontWeight: 600, color: '#4B4B5B',
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px',
                      }}>
                        Todos os modulos inclusos
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Object.entries(moduleInfo)
                          .filter(([slug]) => !starterModules.includes(slug))
                          .map(([slug, info]) => {
                            const Icon = info.icon
                            return (
                              <div
                                key={slug}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '6px 12px', borderRadius: '8px',
                                  backgroundColor: 'rgba(250, 204, 21, 0.06)',
                                  border: '1px solid rgba(250, 204, 21, 0.1)',
                                  color: '#A0A0B0', fontSize: '12px', fontWeight: 500,
                                }}
                              >
                                <Icon size={12} style={{ color: '#FACC15' }} />
                                {info.name}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========== SEPARATOR ========== */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginBottom: '36px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent)' }} />
              <span style={{ fontSize: '13px', color: '#4B4B5B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                ou escolha modulos individuais
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent)' }} />
            </div>

            {/* ========== PACOTES INDIVIDUAIS ========== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '36px',
            }}>
              {paidPackages.map((pkg, index) => {
                const isActive = activeSubscriptionSlugs.includes(pkg.slug)
                const isDisabled = isActive || hasBundleActive || checkoutLoading !== null
                const theme = packageThemes[pkg.slug] || packageThemes['ads-pro']
                const ThemeIcon = theme.icon

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    whileHover={!isDisabled ? { y: -4, transition: { duration: 0.2 } } : {}}
                    style={{
                      borderRadius: '20px',
                      backgroundColor: 'rgba(18, 18, 26, 0.9)',
                      border: isActive
                        ? `1px solid ${theme.color}40`
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: isDisabled ? 'default' : 'pointer',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    {/* Top accent line */}
                    <div style={{
                      height: '3px', width: '100%',
                      background: theme.gradient,
                      opacity: isActive ? 1 : 0.6,
                    }} />

                    <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Active badge */}
                      {isActive && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '6px', marginBottom: '16px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          color: '#22C55E', fontSize: '11px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          alignSelf: 'flex-start',
                        }}>
                          <Check size={10} />
                          Ativo
                        </div>
                      )}

                      {hasBundleActive && !isActive && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '6px', marginBottom: '16px',
                          backgroundColor: 'rgba(250, 204, 21, 0.08)',
                          border: '1px solid rgba(250, 204, 21, 0.15)',
                          color: '#FACC15', fontSize: '11px', fontWeight: 600,
                          alignSelf: 'flex-start',
                        }}>
                          <Crown size={10} />
                          Incluso no Completo
                        </div>
                      )}

                      {/* Icon + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          padding: '10px', borderRadius: '12px',
                          backgroundColor: theme.bgIcon,
                        }}>
                          <ThemeIcon size={22} style={{ color: theme.color }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                          {pkg.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: '13px', color: '#6B6B7B', margin: '0 0 20px 0',
                        lineHeight: 1.5,
                      }}>
                        {packageDescriptions[pkg.slug] || pkg.description}
                      </p>

                      {/* Price */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                          <span style={{ fontSize: '14px', color: '#6B6B7B', fontWeight: 500 }}>R$</span>
                          <span style={{ fontSize: '36px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                            {pkg.priceMonthly}
                          </span>
                          <span style={{ fontSize: '14px', color: '#6B6B7B', marginLeft: '4px' }}>/mes</span>
                        </div>
                      </div>

                      {/* Modules list */}
                      <div style={{ flex: 1, marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {pkg.modulesSlugs
                            .filter(s => !starterModules.includes(s))
                            .map(slug => {
                              const info = moduleInfo[slug]
                              const ModIcon = info?.icon || Check
                              return (
                                <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '22px', height: '22px', borderRadius: '6px',
                                    backgroundColor: theme.bgIcon,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                  }}>
                                    <ModIcon size={12} style={{ color: theme.color }} />
                                  </div>
                                  <span style={{ fontSize: '14px', color: '#A0A0B0', fontWeight: 500 }}>
                                    {info?.name || slug}
                                  </span>
                                </div>
                              )
                            })}
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => !isDisabled && handleCheckout(pkg.slug)}
                        disabled={isDisabled}
                        style={{
                          width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                          fontSize: '14px', fontWeight: 700,
                          cursor: isDisabled ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          transition: 'all 0.3s ease',
                          ...(isActive
                            ? { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }
                            : hasBundleActive
                              ? { backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#4B4B5B', border: '1px solid rgba(255, 255, 255, 0.05)' }
                              : { background: theme.gradient, color: '#FFFFFF', boxShadow: `0 4px 20px ${theme.glow}` }
                          ),
                          opacity: isDisabled && !isActive ? 0.5 : 1,
                        }}
                      >
                        {checkoutLoading === pkg.slug ? (
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : isActive ? (
                          <>
                            <Check size={16} />
                            Assinatura ativa
                          </>
                        ) : hasBundleActive ? (
                          'Incluso no Completo'
                        ) : (
                          <>
                            Assinar {pkg.name}
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* ========== STARTER (FREE) ========== */}
            {starterPackage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  padding: '28px 32px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(18, 18, 26, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  marginBottom: '32px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      padding: '10px', borderRadius: '12px',
                      backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    }}>
                      <Shield size={22} style={{ color: '#22C55E' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                          Starter
                        </h3>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22C55E', fontSize: '11px', fontWeight: 600,
                        }}>
                          Gratuito
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B6B7B', margin: '4px 0 0 0' }}>
                        {packageDescriptions['starter']}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {starterPackage.modulesSlugs.map(slug => {
                      const info = moduleInfo[slug]
                      return (
                        <div
                          key={slug}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            color: '#6B6B7B', fontSize: '12px',
                          }}
                        >
                          <Check size={10} style={{ color: '#22C55E' }} />
                          {info?.name || slug}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========== FOOTER: TRUST SIGNALS ========== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap',
                padding: '24px 0 16px 0',
              }}
            >
              {[
                { icon: Shield, text: 'Pagamento seguro via Stripe' },
                { icon: Zap, text: 'Ativacao instantanea' },
                { icon: ArrowRight, text: 'Cancele quando quiser' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <item.icon size={14} style={{ color: '#4B4B5B' }} />
                  <span style={{ fontSize: '13px', color: '#4B4B5B' }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
