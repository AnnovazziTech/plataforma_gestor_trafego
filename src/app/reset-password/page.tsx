'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token || !email) {
    return (
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <AlertCircle size={32} style={{ color: '#EF4444' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
          Link invalido
        </h1>
        <p style={{ color: '#A0A0AB', marginBottom: '32px', lineHeight: 1.6 }}>
          Este link de recuperacao de senha e invalido ou esta incompleto.
        </p>
        <Link href="/forgot-password">
          <Button variant="primary" style={{ width: '100%' }}>
            Solicitar novo link
          </Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Digite a nova senha')
      return
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Erro de conexao. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <CheckCircle size={32} style={{ color: '#22C55E' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
          Senha redefinida!
        </h1>
        <p style={{ color: '#A0A0AB', marginBottom: '32px', lineHeight: 1.6 }}>
          Sua senha foi alterada com sucesso. Voce sera redirecionado para o login...
        </p>
        <Link href="/login">
          <Button variant="primary" style={{ width: '100%' }}>
            Ir para o login
          </Button>
        </Link>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '0 44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '14px',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <Link
        href="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6B6B7B',
          textDecoration: 'none',
          marginBottom: '32px',
          fontSize: '14px',
        }}
      >
        <ArrowLeft size={16} />
        Voltar para o login
      </Link>

      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
        Redefinir senha
      </h1>
      <p style={{ color: '#A0A0AB', marginBottom: '32px' }}>
        Digite sua nova senha abaixo.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#FFFFFF',
            marginBottom: '8px',
          }}>
            Nova senha
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B6B7B',
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B6B7B',
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#FFFFFF',
            marginBottom: '8px',
          }}>
            Confirmar senha
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B6B7B',
              }}
            />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B6B7B',
                padding: 0,
              }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          style={{ width: '100%', height: '48px' }}
        >
          {loading ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Suspense fallback={
        <div style={{ color: '#A0A0AB', fontSize: '14px' }}>Carregando...</div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
