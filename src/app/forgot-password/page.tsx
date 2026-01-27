'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Digite seu e-mail')
      return
    }

    setLoading(true)

    try {
      // TODO: Implementar API de recuperação de senha
      // Por enquanto, apenas mostra mensagem de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSent(true)
    } catch (error) {
      console.error('Erro ao enviar email:', error)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
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

          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '12px',
          }}>
            E-mail enviado!
          </h1>

          <p style={{
            color: '#A0A0AB',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}>
            Se existe uma conta com o e-mail <strong style={{ color: '#FFFFFF' }}>{email}</strong>,
            voce recebera um link para redefinir sua senha.
          </p>

          <Link href="/login">
            <Button variant="primary" style={{ width: '100%' }}>
              Voltar para o login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
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

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '8px',
        }}>
          Esqueceu sua senha?
        </h1>

        <p style={{
          color: '#A0A0AB',
          marginBottom: '32px',
        }}>
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
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
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px 0 44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: error ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {error && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '8px' }}>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', height: '48px' }}
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
          </Button>
        </form>
      </div>
    </div>
  )
}
