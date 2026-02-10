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
          Política de Privacidade
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
              1. Informações que Coletamos
            </h2>
            <p>
              Coletamos informações que você nos fornece diretamente, como nome, e-mail,
              e dados de pagamento. Também coletamos dados automaticamente, como informações
              de uso e dados de campanhas conectadas.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              2. Como Usamos suas Informações
            </h2>
            <p>
              Utilizamos suas informações para fornecer, manter e melhorar nossos serviços,
              processar transações, enviar comunicações relacionadas ao serviço e personalizar
              sua experiência na plataforma.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              3. Compartilhamento de Dados
            </h2>
            <p>
              Não vendemos suas informações pessoais. Compartilhamos dados apenas com
              provedores de serviços que nos ajudam a operar a plataforma, sempre sob
              acordos de confidencialidade.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              4. Segurança dos Dados
            </h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger
              suas informações contra acesso não autorizado, alteração, divulgação ou
              destruição.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              5. Seus Direitos
            </h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir seus dados pessoais.
              Também pode solicitar a portabilidade dos dados ou retirar seu consentimento
              a qualquer momento.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              6. Cookies
            </h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência,
              analisar o uso do serviço e personalizar conteúdo. Você pode gerenciar suas
              preferências de cookies nas configurações do navegador.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              7. Retenção de Dados
            </h2>
            <p>
              Mantemos suas informações pelo tempo necessário para fornecer os serviços
              ou conforme exigido por lei. Após o encerramento da conta, seus dados serão
              excluídos em até 30 dias.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginBottom: '12px' }}>
              8. Contato
            </h2>
            <p>
              Para questões sobre privacidade, entre em contato conosco através do
              suporte da plataforma.
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
