'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: Log to monitoring service (Sentry, etc.) in production
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0A0A0F',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#0A0A0F',
            color: '#ffffff',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '32px',
              }}
            >
              !
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                margin: '0 0 12px',
                color: '#ffffff',
              }}
            >
              Algo deu errado
            </h1>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '0 0 32px',
              }}
            >
              Ocorreu um erro inesperado. Tente novamente ou volte para o
              início.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  margin: '0 0 24px',
                  fontFamily: 'monospace',
                }}
              >
                Erro: {error.digest}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#8B5CF6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  width: '100%',
                  maxWidth: '280px',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#7C3AED')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = '#8B5CF6')
                }
              >
                Tentar novamente
              </button>
              <a
                href="/dashboard"
                style={{
                  color: '#8B5CF6',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '8px 16px',
                }}
              >
                Voltar ao início
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
