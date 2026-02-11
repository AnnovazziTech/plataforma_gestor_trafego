'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui'
import { LegalModal } from '@/components/modals/LegalModal'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: BarChart3, text: 'Analytics em tempo real' },
    { icon: Target, text: 'Gestão de campanhas' },
    { icon: TrendingUp, text: 'Otimização de ROAS' },
    { icon: Users, text: 'CRM integrado' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0A0A0F' }}>
      {/* Left Side - Branding */}
      <div
        style={{
          display: 'none',
          width: '50%',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="lg:flex"
      >
        {/* Gradient Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom right, #0A0A0F, #12121A, #0A0A0F)',
          }}
        />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(0, 245, 255, 0.15)',
            filter: 'blur(120px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(191, 0, 255, 0.15)',
            filter: 'blur(120px)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 64px',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px' }}
          >
            <Logo size="lg" />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ marginBottom: '48px' }}
          >
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', lineHeight: 1.2, marginBottom: '24px' }}>
              Gerencie suas campanhas{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00F5FF, #BF00FF, #FF00E5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                em um só lugar
              </span>
            </h1>
            <p style={{ fontSize: '18px', color: '#8B8B9B', maxWidth: '420px', lineHeight: 1.6 }}>
              Meta Ads, Google Ads, TikTok Ads e mais. Todas as suas plataformas integradas em um único dashboard.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(191, 0, 255, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <feature.icon style={{ width: '20px', height: '20px', color: '#00F5FF' }} />
                </div>
                <span style={{ fontSize: '14px', color: '#A0A0B0', fontWeight: 500 }}>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ marginTop: '64px', display: 'flex', gap: '48px' }}
          >
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>10k+</div>
              <div style={{ fontSize: '14px', color: '#6B6B7B' }}>Campanhas gerenciadas</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>R$50M+</div>
              <div style={{ fontSize: '14px', color: '#6B6B7B' }}>Em investimentos</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>500+</div>
              <div style={{ fontSize: '14px', color: '#6B6B7B' }}>Agências ativas</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
        }}
        className="lg:w-1/2"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Logo size="lg" />
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: '16px', color: '#6B6B7B' }}>Entre com suas credenciais para acessar</p>
          </div>

          {/* Login Form Card */}
          <div
            style={{
              background: 'rgba(18, 18, 26, 0.9)',
              border: '1px solid #1E1E2E',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <form onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    color: '#F87171',
                    fontSize: '14px',
                    marginBottom: '24px',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#A0A0B0',
                    marginBottom: '10px',
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      color: '#6B6B7B',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 52px',
                      background: '#1A1A24',
                      border: '1px solid #2A2A3A',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00F5FF')}
                    onBlur={(e) => (e.target.style.borderColor = '#2A2A3A')}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#A0A0B0',
                    marginBottom: '10px',
                  }}
                >
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      color: '#6B6B7B',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 52px 16px 52px',
                      background: '#1A1A24',
                      border: '1px solid #2A2A3A',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00F5FF')}
                    onBlur={(e) => (e.target.style.borderColor = '#2A2A3A')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6B6B7B',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#00F5FF',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#6B6B7B' }}>Lembrar-me</span>
                </label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '14px', color: '#00F5FF', textDecoration: 'none' }}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: 'linear-gradient(90deg, #00F5FF, #BF00FF, #FF00E5)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(191, 0, 255, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Register Link */}
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '15px', color: '#6B6B7B' }}>
            Não tem uma conta?{' '}
            <Link
              href="/register"
              style={{ color: '#00F5FF', textDecoration: 'none', fontWeight: 500 }}
            >
              Criar conta gratuita
            </Link>
          </p>

          {/* Footer */}
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#4A4A5A' }}>
            Ao entrar, você concorda com nossos{' '}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              style={{ background: 'none', border: 'none', color: '#6B6B7B', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px' }}
            >
              Termos
            </button>{' '}
            e{' '}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              style={{ background: 'none', border: 'none', color: '#6B6B7B', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px' }}
            >
              Privacidade
            </button>
          </p>
        </motion.div>
      </div>

      {/* Legal Modals */}
      <LegalModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setShowTermsModal(false)}
        type="terms"
      />
      <LegalModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setShowPrivacyModal(false)}
        type="privacy"
      />
    </div>
  )
}
