'use client'

import { useState } from 'react'
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
  User,
  Building,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          organizationName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    '5 campanhas ativas',
    '100 leads por mês',
    '1 integração',
    'Dashboard completo',
    'Relatórios básicos',
    '14 dias trial Pro',
  ]

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0F',
          padding: '16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check style={{ width: '40px', height: '40px', color: '#22C55E' }} />
          </motion.div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
            Conta criada com sucesso!
          </h2>
          <p style={{ color: '#6B6B7B', marginBottom: '24px' }}>Redirecionando para o login...</p>
          <Loader2
            style={{ width: '24px', height: '24px', color: '#00F5FF', margin: '0 auto' }}
            className="animate-spin"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0A0A0F' }}>
      {/* Left Side - Form */}
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
          <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <Logo size="lg" />
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Crie sua conta
            </h2>
            <p style={{ fontSize: '16px', color: '#6B6B7B' }}>
              Comece grátis e faça upgrade quando precisar
            </p>
          </div>

          {/* Register Form Card */}
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

              {/* Name Field */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#A0A0B0',
                    marginBottom: '10px',
                  }}
                >
                  Seu nome
                </label>
                <div style={{ position: 'relative' }}>
                  <User
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
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 52px',
                      background: '#1A1A24',
                      border: '1px solid #2A2A3A',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00F5FF')}
                    onBlur={(e) => (e.target.style.borderColor = '#2A2A3A')}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div style={{ marginBottom: '18px' }}>
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
                      padding: '14px 16px 14px 52px',
                      background: '#1A1A24',
                      border: '1px solid #2A2A3A',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00F5FF')}
                    onBlur={(e) => (e.target.style.borderColor = '#2A2A3A')}
                  />
                </div>
              </div>

              {/* Organization Field */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#A0A0B0',
                    marginBottom: '10px',
                  }}
                >
                  Nome da empresa
                </label>
                <div style={{ position: 'relative' }}>
                  <Building
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
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Minha Agência"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 52px',
                      background: '#1A1A24',
                      border: '1px solid #2A2A3A',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00F5FF')}
                    onBlur={(e) => (e.target.style.borderColor = '#2A2A3A')}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '18px' }}>
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
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      padding: '14px 52px 14px 52px',
                      background: '#1A1A24',
                      border: '1px solid #2A2A3A',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
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

              {/* Terms */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={termsAccepted && privacyAccepted}
                    readOnly
                    style={{
                      width: '18px',
                      height: '18px',
                      marginTop: '2px',
                      accentColor: '#00F5FF',
                      cursor: 'default',
                      opacity: termsAccepted && privacyAccepted ? 1 : 0.5,
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#6B6B7B', lineHeight: 1.5 }}>
                    Li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: termsAccepted ? '#22C55E' : '#00F5FF',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '13px',
                        textDecoration: termsAccepted ? 'none' : 'underline',
                        textUnderlineOffset: '2px',
                        fontWeight: termsAccepted ? 600 : 400,
                      }}
                    >
                      Termos de Uso {termsAccepted && '✓'}
                    </button>{' '}
                    e a{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: privacyAccepted ? '#22C55E' : '#00F5FF',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '13px',
                        textDecoration: privacyAccepted ? 'none' : 'underline',
                        textUnderlineOffset: '2px',
                        fontWeight: privacyAccepted ? 600 : 400,
                      }}
                    >
                      Política de Privacidade {privacyAccepted && '✓'}
                    </button>
                  </span>
                </div>
                {!(termsAccepted && privacyAccepted) && (
                  <p style={{ fontSize: '12px', color: '#4B4B5B', marginLeft: '30px' }}>
                    Clique nos links acima para ler e aceitar
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !termsAccepted || !privacyAccepted}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: (termsAccepted && privacyAccepted)
                    ? 'linear-gradient(90deg, #00F5FF, #BF00FF, #FF00E5)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: (isLoading || !termsAccepted || !privacyAccepted) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !termsAccepted || !privacyAccepted) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && termsAccepted && privacyAccepted) {
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta gratuita
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '15px', color: '#6B6B7B' }}>
            Já tem uma conta?{' '}
            <Link href="/login" style={{ color: '#00F5FF', textDecoration: 'none', fontWeight: 500 }}>
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
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
            background: 'linear-gradient(to bottom left, #0A0A0F, #12121A, #0A0A0F)',
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
            right: '20%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(191, 0, 255, 0.15)',
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
            left: '20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(0, 245, 255, 0.15)',
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
            initial={{ opacity: 0, x: 30 }}
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
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '24px',
                background: 'linear-gradient(90deg, rgba(0, 245, 255, 0.1), rgba(191, 0, 255, 0.1))',
                border: '1px solid rgba(0, 245, 255, 0.2)',
                marginBottom: '24px',
              }}
            >
              <Sparkles style={{ width: '16px', height: '16px', color: '#00F5FF' }} />
              <span style={{ fontSize: '14px', color: '#00F5FF', fontWeight: 500 }}>
                Plano Starter Gratuito
              </span>
            </div>
            <h1
              style={{ fontSize: '42px', fontWeight: 'bold', color: 'white', lineHeight: 1.2, marginBottom: '24px' }}
            >
              Comece a gerenciar{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00F5FF, #BF00FF, #FF00E5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                suas campanhas hoje
              </span>
            </h1>
            <p style={{ fontSize: '18px', color: '#8B8B9B', maxWidth: '420px', lineHeight: 1.6 }}>
              Crie sua conta gratuita e tenha acesso a todas as funcionalidades básicas para começar.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#6B6B7B',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '20px',
              }}
            >
              Incluso no plano gratuito
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'rgba(0, 245, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check style={{ width: '12px', height: '12px', color: '#00F5FF' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#A0A0B0' }}>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              marginTop: '48px',
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(90deg, rgba(191, 0, 255, 0.1), rgba(0, 245, 255, 0.1))',
              border: '1px solid rgba(191, 0, 255, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #BF00FF, #FF00E5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, color: 'white', fontSize: '16px' }}>Plano Pro</h4>
                <p style={{ fontSize: '13px', color: '#6B6B7B' }}>R$197/mês</p>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#8B8B9B', lineHeight: 1.5 }}>
              Desbloqueie campanhas ilimitadas, análise com IA, automações avançadas e muito mais.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Legal Modals */}
      <LegalModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true)
          setShowTermsModal(false)
        }}
        type="terms"
      />
      <LegalModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setPrivacyAccepted(true)
          setShowPrivacyModal(false)
        }}
        type="privacy"
      />
    </div>
  )
}
