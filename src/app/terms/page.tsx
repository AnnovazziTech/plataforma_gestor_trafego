'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0B',
      color: '#FFFFFF',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
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
          Voltar
        </Link>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '32px',
        }}>
          Termos de Uso
        </h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          color: '#A0A0AB',
          lineHeight: 1.7,
        }}>
          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar e usar a Plataforma Gestor de Tráfego, você concorda em cumprir
              e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer
              parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              2. Descrição do Serviço
            </h2>
            <p>
              A Plataforma Gestor de Tráfego é uma ferramenta de gestão de campanhas
              de marketing digital que permite aos usuários gerenciar, analisar e
              otimizar suas campanhas de tráfego pago em diversas plataformas.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              3. Conta do Usuário
            </h2>
            <p>
              Você é responsável por manter a confidencialidade de sua conta e senha,
              e por restringir o acesso ao seu computador. Você concorda em aceitar
              a responsabilidade por todas as atividades que ocorram sob sua conta.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              4. Uso Aceitável
            </h2>
            <p>
              Você concorda em não usar o serviço para qualquer finalidade ilegal ou
              proibida por estes termos. Você não pode usar o serviço de qualquer
              maneira que possa danificar, desabilitar ou sobrecarregar o serviço.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              5. Privacidade
            </h2>
            <p>
              Sua privacidade é importante para nós. Nossa Política de Privacidade
              explica como coletamos, usamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              6. Modificações
            </h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento.
              Alterações significativas serão notificadas através do serviço ou por
              e-mail.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              7. Contato
            </h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato
              conosco através do suporte da plataforma.
            </p>
          </section>
        </div>

        <p style={{
          marginTop: '48px',
          color: '#6B6B7B',
          fontSize: '14px',
        }}>
          Última atualização: Dezembro de 2024
        </p>
      </div>
    </div>
  )
}
