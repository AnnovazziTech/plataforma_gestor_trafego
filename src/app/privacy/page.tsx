'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          Politica de Privacidade
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
              1. Informacoes que Coletamos
            </h2>
            <p>
              Coletamos informacoes que voce nos fornece diretamente, como nome, e-mail,
              e dados de pagamento. Tambem coletamos dados automaticamente, como informacoes
              de uso e dados de campanhas conectadas.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              2. Como Usamos suas Informacoes
            </h2>
            <p>
              Utilizamos suas informacoes para fornecer, manter e melhorar nossos servicos,
              processar transacoes, enviar comunicacoes relacionadas ao servico e personalizar
              sua experiencia na plataforma.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              3. Compartilhamento de Dados
            </h2>
            <p>
              Nao vendemos suas informacoes pessoais. Compartilhamos dados apenas com
              provedores de servicos que nos ajudam a operar a plataforma, sempre sob
              acordos de confidencialidade.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              4. Seguranca dos Dados
            </h2>
            <p>
              Implementamos medidas de seguranca tecnicas e organizacionais para proteger
              suas informacoes contra acesso nao autorizado, alteracao, divulgacao ou
              destruicao.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              5. Seus Direitos
            </h2>
            <p>
              Voce tem o direito de acessar, corrigir ou excluir seus dados pessoais.
              Tambem pode solicitar a portabilidade dos dados ou retirar seu consentimento
              a qualquer momento.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              6. Cookies
            </h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiencia,
              analisar o uso do servico e personalizar conteudo. Voce pode gerenciar suas
              preferencias de cookies nas configuracoes do navegador.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              7. Retencao de Dados
            </h2>
            <p>
              Mantemos suas informacoes pelo tempo necessario para fornecer os servicos
              ou conforme exigido por lei. Apos o encerramento da conta, seus dados serao
              excluidos em ate 30 dias.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              8. Contato
            </h2>
            <p>
              Para questoes sobre privacidade, entre em contato conosco atraves do
              suporte da plataforma.
            </p>
          </section>
        </div>

        <p style={{
          marginTop: '48px',
          color: '#6B6B7B',
          fontSize: '14px',
        }}>
          Ultima atualizacao: Dezembro de 2024
        </p>
      </div>
    </div>
  )
}
