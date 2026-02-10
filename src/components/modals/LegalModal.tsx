'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, FileText } from 'lucide-react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  type: 'terms' | 'privacy'
}

const termsContent = [
  {
    title: '1. Aceitacao dos Termos',
    text: 'Ao acessar e usar o TrafficPro, voce concorda em cumprir e estar vinculado a estes Termos de Uso. Se voce nao concordar com qualquer parte destes termos, nao podera acessar o servico.',
  },
  {
    title: '2. Descricao do Servico',
    text: 'O TrafficPro e uma plataforma de gestao de campanhas de marketing digital que permite aos usuarios gerenciar, analisar e otimizar suas campanhas de trafego pago em diversas plataformas, alem de oferecer ferramentas de gestao financeira, controle de clientes e orcamentos.',
  },
  {
    title: '3. Conta do Usuario',
    text: 'Voce e responsavel por manter a confidencialidade de sua conta e senha, e por restringir o acesso ao seu computador. Voce concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta.',
  },
  {
    title: '4. Uso Aceitavel',
    text: 'Voce concorda em nao usar o servico para qualquer finalidade ilegal ou proibida por estes termos. Voce nao pode usar o servico de qualquer maneira que possa danificar, desabilitar ou sobrecarregar o servico.',
  },
  {
    title: '5. Propriedade Intelectual',
    text: 'Todo o conteudo, funcionalidades e tecnologia do TrafficPro sao protegidos por direitos autorais e propriedade intelectual. E proibida a reproducao, distribuicao ou modificacao sem autorizacao previa.',
  },
  {
    title: '6. Privacidade',
    text: 'Sua privacidade e importante para nos. Nossa Politica de Privacidade explica como coletamos, usamos e protegemos suas informacoes pessoais.',
  },
  {
    title: '7. Limitacao de Responsabilidade',
    text: 'O TrafficPro nao se responsabiliza por perdas financeiras decorrentes de decisoes tomadas com base nos dados exibidos na plataforma. Os dados de campanhas sao obtidos diretamente das APIs das plataformas de anuncio.',
  },
  {
    title: '8. Modificacoes',
    text: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Alteracoes significativas serao notificadas atraves do servico ou por e-mail.',
  },
  {
    title: '9. Contato',
    text: 'Se voce tiver duvidas sobre estes Termos de Uso, entre em contato conosco atraves do suporte da plataforma.',
  },
]

const privacyContent = [
  {
    title: '1. Informacoes que Coletamos',
    text: 'Coletamos informacoes que voce nos fornece diretamente, como nome, e-mail e dados de pagamento. Tambem coletamos dados automaticamente, como informacoes de uso, dados de campanhas conectadas e metricas de desempenho.',
  },
  {
    title: '2. Como Usamos suas Informacoes',
    text: 'Utilizamos suas informacoes para fornecer, manter e melhorar nossos servicos, processar transacoes, enviar comunicacoes relacionadas ao servico e personalizar sua experiencia na plataforma.',
  },
  {
    title: '3. Compartilhamento de Dados',
    text: 'Nao vendemos suas informacoes pessoais. Compartilhamos dados apenas com provedores de servicos que nos ajudam a operar a plataforma, sempre sob acordos de confidencialidade.',
  },
  {
    title: '4. Seguranca dos Dados',
    text: 'Implementamos medidas de seguranca tecnicas e organizacionais para proteger suas informacoes contra acesso nao autorizado, alteracao, divulgacao ou destruicao. Utilizamos criptografia e protocolos seguros.',
  },
  {
    title: '5. Seus Direitos',
    text: 'Voce tem o direito de acessar, corrigir ou excluir seus dados pessoais. Tambem pode solicitar a portabilidade dos dados ou retirar seu consentimento a qualquer momento.',
  },
  {
    title: '6. Cookies e Rastreamento',
    text: 'Utilizamos cookies e tecnologias similares para melhorar sua experiencia, analisar o uso do servico e personalizar conteudo. Voce pode gerenciar suas preferencias de cookies nas configuracoes do navegador.',
  },
  {
    title: '7. Retencao de Dados',
    text: 'Mantemos suas informacoes pelo tempo necessario para fornecer os servicos ou conforme exigido por lei. Apos o encerramento da conta, seus dados serao excluidos em ate 30 dias.',
  },
  {
    title: '8. Contato',
    text: 'Para questoes sobre privacidade, entre em contato conosco atraves do suporte da plataforma.',
  },
]

export function LegalModal({ isOpen, onClose, onAccept, type }: LegalModalProps) {
  const isTerms = type === 'terms'
  const content = isTerms ? termsContent : privacyContent
  const title = isTerms ? 'Termos de Uso' : 'Politica de Privacidade'
  const Icon = isTerms ? FileText : Shield

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#12121A',
              border: '1px solid #1E1E2E',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 28px',
                borderBottom: '1px solid #1E1E2E',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isTerms
                      ? 'rgba(0, 245, 255, 0.1)'
                      : 'rgba(168, 85, 247, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: isTerms ? '#00F5FF' : '#A855F7' }}
                  />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#6B6B7B',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B6B7B'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {content.map((section, i) => (
                <div key={i}>
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    {section.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#A0A0AB',
                      lineHeight: 1.7,
                    }}
                  >
                    {section.text}
                  </p>
                </div>
              ))}

              <p
                style={{
                  fontSize: '12px',
                  color: '#4B4B5B',
                  marginTop: '8px',
                }}
              >
                Ultima atualizacao: Fevereiro de 2025
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '20px 28px',
                borderTop: '1px solid #1E1E2E',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#A0A0B0',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                Fechar
              </button>
              <button
                onClick={onAccept}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: isTerms
                    ? 'linear-gradient(90deg, #00F5FF, #00C4CC)'
                    : 'linear-gradient(90deg, #A855F7, #9333EA)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = isTerms
                    ? '0 4px 20px rgba(0, 245, 255, 0.3)'
                    : '0 4px 20px rgba(168, 85, 247, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Aceitar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
