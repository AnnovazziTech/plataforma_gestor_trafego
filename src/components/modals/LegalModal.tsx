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
    title: '1. Aceitação dos Termos',
    text: 'Ao acessar e usar o TrafficPro, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.',
  },
  {
    title: '2. Descrição do Serviço',
    text: 'O TrafficPro é uma plataforma de gestão de campanhas de marketing digital que permite aos usuários gerenciar, analisar e otimizar suas campanhas de tráfego pago em diversas plataformas, além de oferecer ferramentas de gestão financeira, controle de clientes e orçamentos.',
  },
  {
    title: '3. Conta do Usuário',
    text: 'Você é responsável por manter a confidencialidade de sua conta e senha, e por restringir o acesso ao seu computador. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta.',
  },
  {
    title: '4. Uso Aceitável',
    text: 'Você concorda em não usar o serviço para qualquer finalidade ilegal ou proibida por estes termos. Você não pode usar o serviço de qualquer maneira que possa danificar, desabilitar ou sobrecarregar o serviço.',
  },
  {
    title: '5. Propriedade Intelectual',
    text: 'Todo o conteúdo, funcionalidades e tecnologia do TrafficPro são protegidos por direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou modificação sem autorização prévia.',
  },
  {
    title: '6. Privacidade',
    text: 'Sua privacidade é importante para nós. Nossa Política de Privacidade explica como coletamos, usamos e protegemos suas informações pessoais.',
  },
  {
    title: '7. Limitação de Responsabilidade',
    text: 'O TrafficPro não se responsabiliza por perdas financeiras decorrentes de decisões tomadas com base nos dados exibidos na plataforma. Os dados de campanhas são obtidos diretamente das APIs das plataformas de anúncio.',
  },
  {
    title: '8. Modificações',
    text: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas através do serviço ou por e-mail.',
  },
  {
    title: '9. Contato',
    text: 'Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do suporte da plataforma.',
  },
]

const privacyContent = [
  {
    title: '1. Informações que Coletamos',
    text: 'Coletamos informações que você nos fornece diretamente, como nome, e-mail e dados de pagamento. Também coletamos dados automaticamente, como informações de uso, dados de campanhas conectadas e métricas de desempenho.',
  },
  {
    title: '2. Como Usamos suas Informações',
    text: 'Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações, enviar comunicações relacionadas ao serviço e personalizar sua experiência na plataforma.',
  },
  {
    title: '3. Compartilhamento de Dados',
    text: 'Não vendemos suas informações pessoais. Compartilhamos dados apenas com provedores de serviços que nos ajudam a operar a plataforma, sempre sob acordos de confidencialidade.',
  },
  {
    title: '4. Segurança dos Dados',
    text: 'Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia e protocolos seguros.',
  },
  {
    title: '5. Seus Direitos',
    text: 'Você tem o direito de acessar, corrigir ou excluir seus dados pessoais. Também pode solicitar a portabilidade dos dados ou retirar seu consentimento a qualquer momento.',
  },
  {
    title: '6. Cookies e Rastreamento',
    text: 'Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do navegador.',
  },
  {
    title: '7. Retenção de Dados',
    text: 'Mantemos suas informações pelo tempo necessário para fornecer os serviços ou conforme exigido por lei. Após o encerramento da conta, seus dados serão excluídos em até 30 dias.',
  },
  {
    title: '8. Contato',
    text: 'Para questões sobre privacidade, entre em contato conosco através do suporte da plataforma.',
  },
]

export function LegalModal({ isOpen, onClose, onAccept, type }: LegalModalProps) {
  const isTerms = type === 'terms'
  const content = isTerms ? termsContent : privacyContent
  const title = isTerms ? 'Termos de Uso' : 'Política de Privacidade'
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
                Última atualização: Fevereiro de 2025
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
