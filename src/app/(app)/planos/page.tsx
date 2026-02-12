'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronDown,
  Lock,
  Flame,
  Gift,
  X,
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

const packageThemes: Record<string, { icon: any; gradient: string; glow: string; color: string; bgIcon: string; lightBg: string }> = {
  starter: {
    icon: Shield,
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    glow: 'rgba(34, 197, 94, 0.15)',
    color: '#22C55E',
    bgIcon: 'rgba(34, 197, 94, 0.1)',
    lightBg: 'rgba(34, 197, 94, 0.04)',
  },
  'ads-pro': {
    icon: Megaphone,
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    glow: 'rgba(59, 130, 246, 0.2)',
    color: '#3B82F6',
    bgIcon: 'rgba(59, 130, 246, 0.1)',
    lightBg: 'rgba(59, 130, 246, 0.04)',
  },
  comercial: {
    icon: Users,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    glow: 'rgba(139, 92, 246, 0.2)',
    color: '#8B5CF6',
    bgIcon: 'rgba(139, 92, 246, 0.1)',
    lightBg: 'rgba(139, 92, 246, 0.04)',
  },
  'social-conteudo': {
    icon: Share2,
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
    glow: 'rgba(236, 72, 153, 0.2)',
    color: '#EC4899',
    bgIcon: 'rgba(236, 72, 153, 0.1)',
    lightBg: 'rgba(236, 72, 153, 0.04)',
  },
  conhecimento: {
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    glow: 'rgba(245, 158, 11, 0.2)',
    color: '#F59E0B',
    bgIcon: 'rgba(245, 158, 11, 0.1)',
    lightBg: 'rgba(245, 158, 11, 0.04)',
  },
  completo: {
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FACC15, #F59E0B, #EF4444)',
    glow: 'rgba(250, 204, 21, 0.25)',
    color: '#FACC15',
    bgIcon: 'rgba(250, 204, 21, 0.15)',
    lightBg: 'rgba(250, 204, 21, 0.04)',
  },
}

const packageDescriptions: Record<string, string> = {
  starter: 'Tudo que você precisa para começar a gerenciar seus clientes e finanças.',
  'ads-pro': 'Domine suas campanhas com analytics avançado, relatórios detalhados e automações inteligentes.',
  comercial: 'Prospecte novos clientes e gerencie conversas em um só lugar.',
  'social-conteudo': 'Publique, agende e venda através das redes sociais e seu próprio marketplace.',
  conhecimento: 'Crie e venda cursos online. Organize suas ideias e pensamentos.',
  completo: 'Acesso total a todos os módulos. O pacote definitivo para agências e gestores de tráfego.',
}

const packageHighlights: Record<string, string[]> = {
  'ads-pro': ['Campanhas ilimitadas', 'Analytics em tempo real', 'Relatórios PDF automáticos', 'Automações de escala'],
  comercial: ['CRM completo', 'Prospecção inteligente', 'Chat centralizado', 'Pipeline de vendas'],
  'social-conteudo': ['Agendamento multi-rede', 'Marketplace próprio', 'Link na bio', 'Gestão de conteúdo'],
  conhecimento: ['Plataforma de cursos', 'Área de membros', 'Certificados', 'Organização de ideias'],
}

const moduleInfo: Record<string, { name: string; icon: any }> = {
  financeiro: { name: 'Dashboard Financeiro', icon: TrendingUp },
  clientes: { name: 'Gestão de Clientes', icon: Users },
  'controle-ads': { name: 'Controle de ADS', icon: Target },
  'criativos-free': { name: 'Criativos', icon: Palette },
  noticias: { name: 'Feed de Notícias', icon: BookOpen },
  resumo: { name: 'Resumo Geral', icon: BarChart3 },
  agenda: { name: 'Agenda', icon: Star },
  orcamento: { name: 'Orçamento', icon: BadgePercent },
  campanhas: { name: 'Gestão de Campanhas', icon: Megaphone },
  analytics: { name: 'Analytics Avançado', icon: BarChart3 },
  relatorios: { name: 'Relatórios Profissionais', icon: TrendingUp },
  automacao: { name: 'Automações Inteligentes', icon: Zap },
  prospeccao: { name: 'Prospecção de Clientes', icon: Target },
  mensagens: { name: 'Central de Mensagens', icon: MessageSquare },
  social: { name: 'Redes Sociais', icon: Share2 },
  'meu-link': { name: 'Meu Link (Bio)', icon: Link2 },
  marketplace: { name: 'Marketplace', icon: ShoppingBag },
  cursos: { name: 'Plataforma de Cursos', icon: GraduationCap },
  'meu-pensamento': { name: 'Meu Pensamento', icon: Brain },
}

const starterModules = ['financeiro', 'clientes', 'controle-ads', 'criativos-free', 'noticias', 'resumo', 'agenda', 'orcamento']

function formatPrice(value: number): { integer: string; decimal: string } {
  const formatted = value.toFixed(2).replace('.', ',')
  const [integer, decimal] = formatted.split(',')
  return { integer, decimal }
}

function AnimatedPrice({ value, color = '#FFFFFF', size = 'large' }: { value: number; color?: string; size?: 'large' | 'medium' }) {
  const price = formatPrice(value)
  const fontSize = size === 'large' ? '56px' : '40px'
  const smallFont = size === 'large' ? '18px' : '15px'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}>
      <span style={{ fontSize: smallFont, color: '#6B6B7B', fontWeight: 600, marginTop: size === 'large' ? '10px' : '6px' }}>R$</span>
      <span style={{ fontSize, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-2px' }}>
        {price.integer}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: size === 'large' ? '6px' : '3px' }}>
        <span style={{ fontSize: smallFont, color, fontWeight: 700, lineHeight: 1 }}>,{price.decimal}</span>
        <span style={{ fontSize: '12px', color: '#6B6B7B', fontWeight: 500 }}>/mês</span>
      </div>
    </div>
  )
}

// CSS keyframes injection
const styles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes gradient-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .plan-card:hover {
    border-color: rgba(255, 255, 255, 0.12) !important;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4) !important;
    transform: translateY(-6px) !important;
  }
  .plan-card:hover .card-cta {
    transform: scale(1.02);
  }
  .bundle-cta:hover {
    transform: scale(1.03) !important;
    box-shadow: 0 8px 40px rgba(250, 204, 21, 0.4) !important;
  }
  .starter-module-chip:hover {
    background-color: rgba(34, 197, 94, 0.08) !important;
    border-color: rgba(34, 197, 94, 0.2) !important;
  }
`

export default function PlanosPage() {
  const { showToast } = useApp()
  const searchParams = useSearchParams()

  const [packages, setPackages] = useState<PackageData[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

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

  const bundlePackage = packages.find(p => p.isBundle)
  const starterPackage = packages.find(p => p.isFree)
  const paidPackages = packages.filter(p => !p.isBundle && !p.isFree)

  const totalIndividual = paidPackages.reduce((sum, p) => sum + p.priceMonthly, 0)
  const bundlePrice = bundlePackage?.priceMonthly || 0
  const savingsPercent = totalIndividual > 0 ? Math.round((1 - bundlePrice / totalIndividual) * 100) : 0
  const savingsValue = totalIndividual - bundlePrice

  const allPaidModules = Object.entries(moduleInfo).filter(([slug]) => !starterModules.includes(slug))
  const totalModules = allPaidModules.length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F' }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Header title="Planos e Pacotes" subtitle="Desbloqueie todo o potencial da plataforma" />

      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: '16px' }}>
            <Loader2 size={36} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px', color: '#6B6B7B' }}>Carregando planos...</span>
          </div>
        ) : (
          <>
            {/* ========== HERO ========== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                marginBottom: '56px',
                padding: '48px 24px',
                borderRadius: '28px',
                background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 50%, rgba(250, 204, 21, 0.03) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated glow orbs */}
              <div style={{
                position: 'absolute', top: '-100px', left: '10%', width: '300px', height: '300px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)', pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', top: '-60px', right: '15%', width: '250px', height: '250px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none', animation: 'pulse-glow 5s ease-in-out infinite 1s',
              }} />
              <div style={{
                position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(250, 204, 21, 0.06) 0%, transparent 70%)',
                filter: 'blur(60px)', pointerEvents: 'none', animation: 'pulse-glow 6s ease-in-out infinite 2s',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 18px', borderRadius: '9999px', marginBottom: '24px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                    color: '#A78BFA', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} />
                  Planos modulares — pague só o que usar
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#FFFFFF',
                    margin: '0 0 16px 0', lineHeight: 1.2,
                  }}
                >
                  Potencialize sua agência com{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #FACC15)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 3s linear infinite',
                  }}>
                    ferramentas profissionais
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: '17px', color: '#8B8B9B', margin: '0 auto', maxWidth: '640px', lineHeight: 1.7,
                  }}
                >
                  Escolha os pacotes que fazem sentido para o seu negócio ou assine o{' '}
                  <strong style={{ color: '#FACC15' }}>Pacote Completo</strong>{' '}
                  e economize até{' '}
                  <strong style={{ color: '#22C55E' }}>R$ {savingsValue.toFixed(2).replace('.', ',')}/mês</strong>.
                </motion.p>

                {/* Stats bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '32px',
                    flexWrap: 'wrap',
                  }}
                >
                  {[
                    { value: `${totalModules}+`, label: 'Módulos disponíveis', color: '#3B82F6' },
                    { value: `${paidPackages.length}`, label: 'Pacotes individuais', color: '#8B5CF6' },
                    { value: `${savingsPercent}%`, label: 'Economia no Completo', color: '#FACC15' },
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '4px', fontWeight: 500 }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* ========== BUNDLE COMPLETO ========== */}
            {bundlePackage && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ marginBottom: '56px', position: 'relative' }}
              >
                {/* Outer glow */}
                <div style={{
                  position: 'absolute', inset: '-2px', borderRadius: '26px',
                  background: 'linear-gradient(135deg, #FACC15, #F59E0B, #EF4444, #F59E0B, #FACC15)',
                  backgroundSize: '300% 300%',
                  animation: 'shimmer 4s linear infinite',
                  opacity: 0.6,
                }} />

                <div style={{
                  position: 'relative',
                  padding: '44px 48px',
                  borderRadius: '24px',
                  backgroundColor: '#0D0D14',
                  overflow: 'hidden',
                }}>
                  {/* Background effects */}
                  <div style={{
                    position: 'absolute', top: '-100px', right: '-50px', width: '400px', height: '400px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(250, 204, 21, 0.06) 0%, transparent 60%)',
                    filter: 'blur(80px)', pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '-80px', left: '-30px', width: '300px', height: '300px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.04) 0%, transparent 60%)',
                    filter: 'blur(60px)', pointerEvents: 'none',
                  }} />
                  {/* Subtle grid pattern */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.02,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px', pointerEvents: 'none',
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '7px 16px', borderRadius: '9999px',
                          background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                          color: '#000', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          <Flame size={14} />
                          Mais popular
                        </div>
                        {savingsValue > 0 && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '9999px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22C55E', fontSize: '12px', fontWeight: 600,
                          }}>
                            <Gift size={13} />
                            Economize {savingsPercent}%
                          </div>
                        )}
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
                          onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
                          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                        >
                          {portalLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ExternalLink size={14} />}
                          Gerenciar assinaturas
                        </button>
                      )}
                    </div>

                    {/* Main content */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.2fr) auto minmax(0, 1fr)',
                      gap: '48px',
                      alignItems: 'center',
                    }}>
                      {/* Left: identity */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <div style={{
                            padding: '14px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(245, 158, 11, 0.1))',
                            animation: 'float 3s ease-in-out infinite',
                          }}>
                            <Crown size={32} style={{ color: '#FACC15' }} />
                          </div>
                          <div>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                              {bundlePackage.name}
                            </h2>
                            <p style={{ fontSize: '14px', color: '#8B8B9B', margin: '4px 0 0 0' }}>
                              Acesso total a todos os {totalModules} módulos premium
                            </p>
                          </div>
                        </div>
                        <p style={{ fontSize: '15px', color: '#6B6B7B', margin: '0 0 24px 0', lineHeight: 1.7, maxWidth: '440px' }}>
                          {packageDescriptions['completo']}
                        </p>

                        {/* Key benefits */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            'Todos os módulos desbloqueados',
                            'Atualizações prioritárias',
                            'Suporte preferencial',
                            'Sem limites de uso',
                          ].map((benefit, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(245, 158, 11, 0.1))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <Check size={11} style={{ color: '#FACC15' }} />
                              </div>
                              <span style={{ fontSize: '14px', color: '#A0A0B0', fontWeight: 500 }}>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{
                        width: '1px', height: '200px',
                        background: 'linear-gradient(180deg, transparent, rgba(250, 204, 21, 0.15), transparent)',
                      }} />

                      {/* Right: pricing */}
                      <div style={{ textAlign: 'center' }}>
                        {/* Original price */}
                        {totalIndividual > 0 && (
                          <div style={{
                            fontSize: '15px', color: '#4B4B5B', marginBottom: '8px',
                            textDecoration: 'line-through', textDecorationColor: '#EF4444',
                          }}>
                            de R$ {totalIndividual.toFixed(2).replace('.', ',')}
                          </div>
                        )}

                        {/* Price label */}
                        <div style={{ fontSize: '13px', color: '#8B8B9B', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          por apenas
                        </div>

                        {/* Main price */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                          <AnimatedPrice value={bundlePrice} color="#FFFFFF" size="large" />
                        </div>

                        {/* Price per day */}
                        <div style={{
                          fontSize: '13px', color: '#6B6B7B', marginBottom: '24px',
                        }}>
                          Apenas <span style={{ color: '#22C55E', fontWeight: 600 }}>
                            R$ {(bundlePrice / 30).toFixed(2).replace('.', ',')}
                          </span> por dia
                        </div>

                        {/* CTA */}
                        {(() => {
                          const isActive = activeSubscriptionSlugs.includes(bundlePackage.slug)
                          const isDisabled = isActive || checkoutLoading !== null
                          return (
                            <button
                              onClick={() => handleCheckout(bundlePackage.slug)}
                              disabled={isDisabled}
                              className={!isActive ? 'bundle-cta' : ''}
                              style={{
                                width: '100%', maxWidth: '300px', padding: '18px 36px', borderRadius: '16px',
                                border: 'none', fontSize: '17px', fontWeight: 700,
                                cursor: isDisabled ? 'default' : 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                opacity: isDisabled ? 0.6 : 1,
                                transition: 'all 0.3s ease',
                                ...(isActive
                                  ? { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }
                                  : {
                                      background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                                      color: '#000',
                                      boxShadow: '0 4px 30px rgba(250, 204, 21, 0.3)',
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
                                  Quero o Completo
                                  <ArrowRight size={16} />
                                </>
                              )}
                            </button>
                          )
                        })()}

                        {/* Guarantee */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          marginTop: '16px',
                        }}>
                          <Shield size={12} style={{ color: '#4B4B5B' }} />
                          <span style={{ fontSize: '12px', color: '#4B4B5B' }}>Cancele a qualquer momento</span>
                        </div>
                      </div>
                    </div>

                    {/* Module chips */}
                    <div style={{
                      marginTop: '36px', paddingTop: '28px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                      <p style={{
                        fontSize: '12px', fontWeight: 600, color: '#4B4B5B',
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px',
                      }}>
                        <Crown size={11} style={{ color: '#FACC15', verticalAlign: 'middle', marginRight: '6px' }} />
                        Todos os {totalModules} módulos premium inclusos
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {allPaidModules.map(([slug, info]) => {
                          const Icon = info.icon
                          return (
                            <div
                              key={slug}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '10px',
                                backgroundColor: 'rgba(250, 204, 21, 0.05)',
                                border: '1px solid rgba(250, 204, 21, 0.08)',
                                color: '#A0A0B0', fontSize: '12px', fontWeight: 500,
                                transition: 'all 0.2s',
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
              display: 'flex', alignItems: 'center', gap: '20px',
              marginBottom: '40px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent)' }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <Sparkles size={14} style={{ color: '#6B6B7B' }} />
                <span style={{ fontSize: '13px', color: '#6B6B7B', fontWeight: 600 }}>
                  ou escolha módulos individuais
                </span>
              </div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent)' }} />
            </div>

            {/* ========== INDIVIDUAL PACKAGES ========== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '48px',
            }}>
              {paidPackages.map((pkg, index) => {
                const isActive = activeSubscriptionSlugs.includes(pkg.slug)
                const isDisabled = isActive || hasBundleActive || checkoutLoading !== null
                const theme = packageThemes[pkg.slug] || packageThemes['ads-pro']
                const ThemeIcon = theme.icon
                const highlights = packageHighlights[pkg.slug] || []
                const isExpanded = expandedCard === pkg.slug
                const paidModules = pkg.modulesSlugs.filter(s => !starterModules.includes(s))

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="plan-card"
                    style={{
                      borderRadius: '20px',
                      backgroundColor: 'rgba(18, 18, 26, 0.9)',
                      border: isActive
                        ? `1px solid ${theme.color}50`
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'default',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? `0 0 30px ${theme.glow}` : 'none',
                    }}
                  >
                    {/* Top accent */}
                    <div style={{
                      height: '3px', width: '100%',
                      background: theme.gradient,
                      opacity: isActive ? 1 : 0.7,
                    }} />

                    <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Status badges */}
                      {isActive && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '5px 12px', borderRadius: '8px', marginBottom: '16px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          color: '#22C55E', fontSize: '11px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          alignSelf: 'flex-start',
                        }}>
                          <Check size={11} />
                          Ativo
                        </div>
                      )}
                      {hasBundleActive && !isActive && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '5px 12px', borderRadius: '8px', marginBottom: '16px',
                          backgroundColor: 'rgba(250, 204, 21, 0.08)',
                          border: '1px solid rgba(250, 204, 21, 0.15)',
                          color: '#FACC15', fontSize: '11px', fontWeight: 600,
                          alignSelf: 'flex-start',
                        }}>
                          <Crown size={11} />
                          Incluso no Completo
                        </div>
                      )}

                      {/* Icon + name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                        <div style={{
                          padding: '12px', borderRadius: '14px',
                          backgroundColor: theme.bgIcon,
                          transition: 'transform 0.3s',
                        }}>
                          <ThemeIcon size={24} style={{ color: theme.color }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                            {pkg.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: '14px', color: '#6B6B7B', margin: '0 0 24px 0',
                        lineHeight: 1.6,
                      }}>
                        {packageDescriptions[pkg.slug] || pkg.description}
                      </p>

                      {/* Price section */}
                      <div style={{
                        padding: '20px',
                        borderRadius: '16px',
                        backgroundColor: theme.lightBg,
                        border: `1px solid ${theme.color}15`,
                        marginBottom: '24px',
                      }}>
                        <AnimatedPrice value={pkg.priceMonthly} color={theme.color} size="medium" />
                        <div style={{ fontSize: '12px', color: '#6B6B7B', marginTop: '6px' }}>
                          {(pkg.priceMonthly / 30).toFixed(2).replace('.', ',')} por dia
                        </div>
                      </div>

                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <div style={{ flex: 1, marginBottom: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {highlights.map((text, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '22px', height: '22px', borderRadius: '7px',
                                  backgroundColor: theme.bgIcon,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0,
                                }}>
                                  <Check size={12} style={{ color: theme.color }} />
                                </div>
                                <span style={{ fontSize: '14px', color: '#A0A0B0', fontWeight: 500 }}>
                                  {text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expandable modules */}
                      {paidModules.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                          <button
                            onClick={() => setExpandedCard(isExpanded ? null : pkg.slug)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                              padding: '8px 0', border: 'none', backgroundColor: 'transparent',
                              color: '#6B6B7B', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              transition: 'color 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.color = theme.color }}
                            onMouseOut={e => { e.currentTarget.style.color = '#6B6B7B' }}
                          >
                            <ChevronDown
                              size={14}
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                            {paidModules.length} módulos inclusos
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                                  {paidModules.map(slug => {
                                    const info = moduleInfo[slug]
                                    const ModIcon = info?.icon || Check
                                    return (
                                      <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                          width: '22px', height: '22px', borderRadius: '7px',
                                          backgroundColor: theme.bgIcon,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          flexShrink: 0,
                                        }}>
                                          <ModIcon size={12} style={{ color: theme.color }} />
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#8B8B9B', fontWeight: 500 }}>
                                          {info?.name || slug}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Spacer to push CTA to bottom */}
                      <div style={{ flex: 1 }} />

                      {/* CTA */}
                      <button
                        onClick={() => !isDisabled && handleCheckout(pkg.slug)}
                        disabled={isDisabled}
                        className="card-cta"
                        style={{
                          width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
                          fontSize: '15px', fontWeight: 700,
                          cursor: isDisabled ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          transition: 'all 0.3s ease',
                          ...(isActive
                            ? { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }
                            : hasBundleActive
                              ? { backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#4B4B5B', border: '1px solid rgba(255, 255, 255, 0.05)' }
                              : { background: theme.gradient, color: '#FFFFFF', boxShadow: `0 4px 24px ${theme.glow}` }
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
                          <>
                            <Crown size={14} />
                            Incluso no Completo
                          </>
                        ) : (
                          <>
                            Assinar por R$ {pkg.priceMonthly.toFixed(2).replace('.', ',')}/mês
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
                  padding: '32px 36px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(18, 18, 26, 0.5)',
                  border: '1px solid rgba(34, 197, 94, 0.08)',
                  marginBottom: '40px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle glow */}
                <div style={{
                  position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
                  borderRadius: '50%', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.04) 0%, transparent 70%)',
                  filter: 'blur(40px)', pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        padding: '12px', borderRadius: '14px',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                      }}>
                        <Shield size={24} style={{ color: '#22C55E' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                            Starter
                          </h3>
                          <span style={{
                            padding: '3px 10px', borderRadius: '8px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.15)',
                            color: '#22C55E', fontSize: '12px', fontWeight: 700,
                          }}>
                            Gratuito
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#6B6B7B', margin: 0 }}>
                          {packageDescriptions['starter']}
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#22C55E' }}>
                      R$ 0<span style={{ fontSize: '14px', color: '#6B6B7B', fontWeight: 500 }}>/mês</span>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '24px', paddingTop: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex', flexWrap: 'wrap', gap: '8px',
                  }}>
                    {starterPackage.modulesSlugs.map(slug => {
                      const info = moduleInfo[slug]
                      const Icon = info?.icon || Check
                      return (
                        <div
                          key={slug}
                          className="starter-module-chip"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            color: '#8B8B9B', fontSize: '13px', fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                        >
                          <Icon size={12} style={{ color: '#22C55E' }} />
                          {info?.name || slug}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========== COMPARISON HINT ========== */}
            {bundlePackage && paidPackages.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                style={{
                  padding: '24px 32px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.04), rgba(245, 158, 11, 0.02))',
                  border: '1px solid rgba(250, 204, 21, 0.08)',
                  marginBottom: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} style={{ color: '#FACC15' }} />
                  <span style={{ fontSize: '15px', color: '#A0A0B0' }}>
                    <strong style={{ color: '#FFFFFF' }}>Dica:</strong>{' '}
                    Assinando {paidPackages.length > 2 ? '3 ou mais pacotes' : 'todos os pacotes'} avulsos, o total seria{' '}
                    <strong style={{ color: '#EF4444', textDecoration: 'line-through' }}>
                      R$ {totalIndividual.toFixed(2).replace('.', ',')}
                    </strong>
                    . Com o Completo você paga{' '}
                    <strong style={{ color: '#22C55E' }}>
                      R$ {bundlePrice.toFixed(2).replace('.', ',')}
                    </strong>
                    {' '} — economia de R$ {savingsValue.toFixed(2).replace('.', ',')}/mês!
                  </span>
                </div>
              </motion.div>
            )}

            {/* ========== TRUST SIGNALS ========== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap',
                padding: '24px 0 16px 0',
              }}
            >
              {[
                { icon: Shield, text: 'Pagamento seguro via Stripe' },
                { icon: Zap, text: 'Ativação instantânea' },
                { icon: Star, text: 'Cancele quando quiser' },
                { icon: Lock, text: 'Dados protegidos' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <item.icon size={14} style={{ color: '#3B3B4B' }} />
                  <span style={{ fontSize: '13px', color: '#3B3B4B' }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
