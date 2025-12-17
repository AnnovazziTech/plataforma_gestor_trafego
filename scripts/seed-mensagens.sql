-- =============================================
-- SEED SQL PARA PAGINA DE MENSAGENS
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. CRIAR INTEGRACAO WHATSAPP (necessario para conversas)
INSERT INTO integrations (
  id, "organizationId", platform, name, "accessToken",
  "whatsappPhoneNumber", "whatsappPhoneId", status, "isActive",
  "lastSyncAt", "createdAt", "updatedAt"
)
VALUES (
  'int_whatsapp_demo',
  'org_demo',
  'WHATSAPP'::"IntegrationPlatform",
  'WhatsApp Business - Loja Principal',
  'demo_access_token_whatsapp',
  '+55 11 99999-1234',
  'phone_id_demo',
  'CONNECTED'::"IntegrationStatus",
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2. CRIAR LEADS PARA O FUNIL
INSERT INTO leads (
  id, "organizationId", "campaignId", name, email, phone,
  source, status, value, notes, "createdAt", "updatedAt"
)
VALUES
  -- Leads NOVOS
  ('lead_msg_1', 'org_demo', 'camp_1', 'Lucas Ferreira', 'lucas.ferreira@email.com', '(11) 99999-0001', 'META_ADS'::"LeadSource", 'NEW'::"LeadStatus", 500, NULL, NOW() - INTERVAL '2 hours', NOW()),
  ('lead_msg_2', 'org_demo', 'camp_2', 'Juliana Lima', 'juliana.lima@email.com', '(11) 99999-0002', 'GOOGLE_ADS'::"LeadSource", 'NEW'::"LeadStatus", 1200, NULL, NOW() - INTERVAL '4 hours', NOW()),
  ('lead_msg_3', 'org_demo', NULL, 'Thiago Mendes', NULL, '(11) 99999-0003', 'WHATSAPP'::"LeadSource", 'NEW'::"LeadStatus", 350, NULL, NOW() - INTERVAL '6 hours', NOW()),

  -- Leads EM ANDAMENTO (CONTACTED/QUALIFIED)
  ('lead_msg_4', 'org_demo', 'camp_1', 'Roberto Alves', 'roberto.alves@email.com', '(11) 99999-0004', 'META_ADS'::"LeadSource", 'CONTACTED'::"LeadStatus", 800, 'Demonstrou interesse no produto premium', NOW() - INTERVAL '1 day', NOW()),
  ('lead_msg_5', 'org_demo', 'camp_3', 'Fernanda Costa', 'fernanda.costa@email.com', '(11) 99999-0005', 'TIKTOK_ADS'::"LeadSource", 'QUALIFIED'::"LeadStatus", 1500, 'Pediu proposta comercial', NOW() - INTERVAL '2 days', NOW()),
  ('lead_msg_6', 'org_demo', 'camp_2', 'Amanda Ribeiro', NULL, '(11) 99999-0006', 'GOOGLE_ADS'::"LeadSource", 'PROPOSAL'::"LeadStatus", 2200, 'Aguardando aprovacao do orcamento', NOW() - INTERVAL '3 days', NOW()),
  ('lead_msg_7', 'org_demo', 'camp_1', 'Ricardo Santos', 'ricardo.santos@email.com', '(11) 99999-0007', 'META_ADS'::"LeadSource", 'NEGOTIATION'::"LeadStatus", 3000, 'Negociando prazo de pagamento', NOW() - INTERVAL '4 days', NOW()),

  -- Leads CONCLUIDOS (WON)
  ('lead_msg_8', 'org_demo', 'camp_1', 'Marcelo Santos', 'marcelo.santos@email.com', '(11) 99999-0008', 'META_ADS'::"LeadSource", 'WON'::"LeadStatus", 2500, 'Comprou pacote completo', NOW() - INTERVAL '5 days', NOW()),
  ('lead_msg_9', 'org_demo', 'camp_3', 'Patricia Souza', 'patricia.souza@email.com', '(11) 99999-0009', 'ORGANIC'::"LeadSource", 'WON'::"LeadStatus", 450, 'Indicacao de cliente', NOW() - INTERVAL '7 days', NOW()),
  ('lead_msg_10', 'org_demo', 'camp_2', 'Bruno Oliveira', NULL, '(11) 99999-0010', 'GOOGLE_ADS'::"LeadSource", 'WON'::"LeadStatus", 1800, 'Fechou contrato anual', NOW() - INTERVAL '8 days', NOW()),
  ('lead_msg_11', 'org_demo', 'camp_1', 'Carolina Dias', 'carolina.dias@email.com', '(11) 99999-0011', 'META_ADS'::"LeadSource", 'WON'::"LeadStatus", 899, 'Curso online', NOW() - INTERVAL '10 days', NOW()),

  -- Leads PERDIDOS (LOST)
  ('lead_msg_12', 'org_demo', 'camp_2', 'Andre Oliveira', NULL, '(11) 99999-0012', 'GOOGLE_ADS'::"LeadSource", 'LOST'::"LeadStatus", NULL, 'Sem interesse no momento - falta de orcamento', NOW() - INTERVAL '12 days', NOW()),
  ('lead_msg_13', 'org_demo', 'camp_1', 'Mariana Silva', 'mariana.silva@email.com', '(11) 99999-0013', 'META_ADS'::"LeadSource", 'LOST'::"LeadStatus", 600, 'Escolheu concorrente', NOW() - INTERVAL '14 days', NOW()),

  -- Leads REMARKETING
  ('lead_msg_14', 'org_demo', 'camp_3', 'Camila Ribeiro', 'camila.ribeiro@email.com', '(11) 99999-0014', 'TIKTOK_ADS'::"LeadSource", 'REMARKETING'::"LeadStatus", 750, 'Voltou a demonstrar interesse apos campanha de remarketing', NOW() - INTERVAL '20 days', NOW()),
  ('lead_msg_15', 'org_demo', 'camp_1', 'Felipe Gomes', 'felipe.gomes@email.com', '(11) 99999-0015', 'META_ADS'::"LeadSource", 'REMARKETING'::"LeadStatus", 1100, 'Reengajado via email marketing', NOW() - INTERVAL '25 days', NOW())
ON CONFLICT DO NOTHING;

-- 3. CRIAR HISTORICO DE LEADS
INSERT INTO lead_history (id, "leadId", "fromStatus", "toStatus", note, "createdAt")
VALUES
  -- Historico do lead Lucas (novo)
  ('hist_1', 'lead_msg_1', NULL, 'NEW'::"LeadStatus", 'Lead captado via Meta Ads', NOW() - INTERVAL '2 hours'),

  -- Historico do lead Roberto (em andamento)
  ('hist_2', 'lead_msg_4', NULL, 'NEW'::"LeadStatus", 'Lead captado via Meta Ads', NOW() - INTERVAL '1 day'),
  ('hist_3', 'lead_msg_4', 'NEW'::"LeadStatus", 'CONTACTED'::"LeadStatus", 'Primeiro contato realizado', NOW() - INTERVAL '20 hours'),

  -- Historico do lead Fernanda (qualificado)
  ('hist_4', 'lead_msg_5', NULL, 'NEW'::"LeadStatus", 'Lead captado via TikTok Ads', NOW() - INTERVAL '2 days'),
  ('hist_5', 'lead_msg_5', 'NEW'::"LeadStatus", 'CONTACTED'::"LeadStatus", 'Primeiro contato realizado', NOW() - INTERVAL '1 day 18 hours'),
  ('hist_6', 'lead_msg_5', 'CONTACTED'::"LeadStatus", 'QUALIFIED'::"LeadStatus", 'Lead qualificado - alto potencial', NOW() - INTERVAL '1 day'),

  -- Historico do lead Marcelo (ganho)
  ('hist_7', 'lead_msg_8', NULL, 'NEW'::"LeadStatus", 'Lead captado via Meta Ads', NOW() - INTERVAL '5 days'),
  ('hist_8', 'lead_msg_8', 'NEW'::"LeadStatus", 'CONTACTED'::"LeadStatus", 'Primeiro contato realizado', NOW() - INTERVAL '4 days 12 hours'),
  ('hist_9', 'lead_msg_8', 'CONTACTED'::"LeadStatus", 'QUALIFIED'::"LeadStatus", 'Lead qualificado', NOW() - INTERVAL '4 days'),
  ('hist_10', 'lead_msg_8', 'QUALIFIED'::"LeadStatus", 'PROPOSAL'::"LeadStatus", 'Proposta enviada', NOW() - INTERVAL '3 days'),
  ('hist_11', 'lead_msg_8', 'PROPOSAL'::"LeadStatus", 'WON'::"LeadStatus", 'Venda fechada!', NOW() - INTERVAL '2 days'),

  -- Historico do lead Andre (perdido)
  ('hist_12', 'lead_msg_12', NULL, 'NEW'::"LeadStatus", 'Lead captado via Google Ads', NOW() - INTERVAL '12 days'),
  ('hist_13', 'lead_msg_12', 'NEW'::"LeadStatus", 'CONTACTED'::"LeadStatus", 'Primeiro contato realizado', NOW() - INTERVAL '11 days'),
  ('hist_14', 'lead_msg_12', 'CONTACTED'::"LeadStatus", 'LOST'::"LeadStatus", 'Lead sem interesse - falta de orcamento', NOW() - INTERVAL '10 days'),

  -- Historico do lead Camila (remarketing)
  ('hist_15', 'lead_msg_14', NULL, 'NEW'::"LeadStatus", 'Lead captado via TikTok Ads', NOW() - INTERVAL '20 days'),
  ('hist_16', 'lead_msg_14', 'NEW'::"LeadStatus", 'CONTACTED'::"LeadStatus", 'Primeiro contato realizado', NOW() - INTERVAL '19 days'),
  ('hist_17', 'lead_msg_14', 'CONTACTED'::"LeadStatus", 'LOST'::"LeadStatus", 'Lead esfriou', NOW() - INTERVAL '15 days'),
  ('hist_18', 'lead_msg_14', 'LOST'::"LeadStatus", 'REMARKETING'::"LeadStatus", 'Lead reengajado via campanha de remarketing', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- 4. CRIAR CONVERSAS
INSERT INTO conversations (
  id, "organizationId", "integrationId", "leadId",
  "contactName", "contactPhone", status, "unreadCount",
  "lastMessageAt", "lastMessagePreview", "isActive", "createdAt", "updatedAt"
)
VALUES
  -- Conversas ativas com mensagens nao lidas
  ('conv_1', 'org_demo', 'int_whatsapp_demo', 'lead_msg_1', 'Lucas Ferreira', '(11) 99999-0001', 'OPEN'::"ConversationStatus", 2, NOW() - INTERVAL '30 minutes', 'Ola, gostaria de saber mais sobre o produto', true, NOW() - INTERVAL '2 hours', NOW()),
  ('conv_2', 'org_demo', 'int_whatsapp_demo', 'lead_msg_3', 'Thiago Mendes', '(11) 99999-0003', 'OPEN'::"ConversationStatus", 1, NOW() - INTERVAL '1 hour', 'Qual o prazo de entrega?', true, NOW() - INTERVAL '6 hours', NOW()),
  ('conv_3', 'org_demo', 'int_whatsapp_demo', 'lead_msg_4', 'Roberto Alves', '(11) 99999-0004', 'OPEN'::"ConversationStatus", 3, NOW() - INTERVAL '2 hours', 'Posso parcelar em quantas vezes?', true, NOW() - INTERVAL '1 day', NOW()),

  -- Conversas ativas sem mensagens nao lidas
  ('conv_4', 'org_demo', 'int_whatsapp_demo', 'lead_msg_5', 'Fernanda Costa', '(11) 99999-0005', 'OPEN'::"ConversationStatus", 0, NOW() - INTERVAL '3 hours', 'Obrigada pelo atendimento!', true, NOW() - INTERVAL '2 days', NOW()),
  ('conv_5', 'org_demo', 'int_whatsapp_demo', 'lead_msg_7', 'Ricardo Santos', '(11) 99999-0007', 'OPEN'::"ConversationStatus", 0, NOW() - INTERVAL '5 hours', 'Vou pensar e te retorno amanha', true, NOW() - INTERVAL '4 days', NOW()),

  -- Conversas pendentes
  ('conv_6', 'org_demo', 'int_whatsapp_demo', 'lead_msg_6', 'Amanda Ribeiro', '(11) 99999-0006', 'PENDING'::"ConversationStatus", 0, NOW() - INTERVAL '1 day', 'Aguardando aprovacao do gerente', true, NOW() - INTERVAL '3 days', NOW()),

  -- Conversas resolvidas (vendas concluidas)
  ('conv_7', 'org_demo', 'int_whatsapp_demo', 'lead_msg_8', 'Marcelo Santos', '(11) 99999-0008', 'RESOLVED'::"ConversationStatus", 0, NOW() - INTERVAL '2 days', 'Fechado! Pode enviar o link de pagamento', true, NOW() - INTERVAL '5 days', NOW()),
  ('conv_8', 'org_demo', 'int_whatsapp_demo', 'lead_msg_9', 'Patricia Souza', '(11) 99999-0009', 'RESOLVED'::"ConversationStatus", 0, NOW() - INTERVAL '3 days', 'Compra realizada com sucesso!', true, NOW() - INTERVAL '7 days', NOW()),
  ('conv_9', 'org_demo', 'int_whatsapp_demo', 'lead_msg_11', 'Carolina Dias', '(11) 99999-0011', 'RESOLVED'::"ConversationStatus", 0, NOW() - INTERVAL '5 days', 'Acesso liberado, muito obrigada!', true, NOW() - INTERVAL '10 days', NOW()),

  -- Conversas arquivadas
  ('conv_10', 'org_demo', 'int_whatsapp_demo', 'lead_msg_12', 'Andre Oliveira', '(11) 99999-0012', 'ARCHIVED'::"ConversationStatus", 0, NOW() - INTERVAL '10 days', 'No momento nao tenho interesse', true, NOW() - INTERVAL '12 days', NOW())
ON CONFLICT DO NOTHING;

-- 5. CRIAR MENSAGENS DAS CONVERSAS
INSERT INTO messages (
  id, "conversationId", content, type, direction, status, "senderName", "createdAt"
)
VALUES
  -- Conversa 1: Lucas Ferreira (2 mensagens nao lidas)
  ('msg_1_1', 'conv_1', 'Ola! Vi seu anuncio no Instagram e gostaria de saber mais sobre o produto', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Lucas Ferreira', NOW() - INTERVAL '2 hours'),
  ('msg_1_2', 'conv_1', 'Ola Lucas! Claro, fico feliz em ajudar. Qual produto voce viu?', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '1 hour 50 minutes'),
  ('msg_1_3', 'conv_1', 'O curso de marketing digital', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Lucas Ferreira', NOW() - INTERVAL '1 hour 45 minutes'),
  ('msg_1_4', 'conv_1', 'Excelente escolha! O curso tem 40 horas de conteudo, certificado e acesso vitalicio. O valor e R$ 299 a vista ou 12x de R$ 29,90', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '1 hour 40 minutes'),
  ('msg_1_5', 'conv_1', 'Qual a forma de pagamento?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Lucas Ferreira', NOW() - INTERVAL '1 hour'),
  ('msg_1_6', 'conv_1', 'Voces aceitam PIX?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Lucas Ferreira', NOW() - INTERVAL '30 minutes'),

  -- Conversa 2: Thiago Mendes
  ('msg_2_1', 'conv_2', 'Boa tarde! Vi no site que voces entregam para todo Brasil, correto?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Thiago Mendes', NOW() - INTERVAL '6 hours'),
  ('msg_2_2', 'conv_2', 'Ola Thiago! Sim, entregamos para todo o Brasil. O frete e calculado pelo CEP', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '5 hours 50 minutes'),
  ('msg_2_3', 'conv_2', 'Qual o prazo de entrega?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Thiago Mendes', NOW() - INTERVAL '1 hour'),

  -- Conversa 3: Roberto Alves (3 mensagens nao lidas)
  ('msg_3_1', 'conv_3', 'Oi, tenho interesse no produto premium', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Roberto Alves', NOW() - INTERVAL '1 day'),
  ('msg_3_2', 'conv_3', 'Ola Roberto! O produto premium inclui suporte prioritario e atualizacoes gratuitas por 1 ano', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '23 hours'),
  ('msg_3_3', 'conv_3', 'Qual o valor?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Roberto Alves', NOW() - INTERVAL '22 hours'),
  ('msg_3_4', 'conv_3', 'O valor e R$ 800. Mas estamos com promocao de lancamento: R$ 640 a vista!', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '21 hours'),
  ('msg_3_5', 'conv_3', 'Interessante! Posso parcelar?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Roberto Alves', NOW() - INTERVAL '4 hours'),
  ('msg_3_6', 'conv_3', 'Posso parcelar em quantas vezes?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Roberto Alves', NOW() - INTERVAL '3 hours'),
  ('msg_3_7', 'conv_3', 'Voces aceitam cartao de credito?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'DELIVERED'::"MessageStatus", 'Roberto Alves', NOW() - INTERVAL '2 hours'),

  -- Conversa 4: Fernanda Costa (sem mensagens nao lidas)
  ('msg_4_1', 'conv_4', 'Ola! Gostaria de uma proposta comercial para minha empresa', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Fernanda Costa', NOW() - INTERVAL '2 days'),
  ('msg_4_2', 'conv_4', 'Ola Fernanda! Claro, qual e o porte da sua empresa e quantos funcionarios utilizariam a plataforma?', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '1 day 23 hours'),
  ('msg_4_3', 'conv_4', 'Somos uma agencia com 15 funcionarios', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Fernanda Costa', NOW() - INTERVAL '1 day 20 hours'),
  ('msg_4_4', 'conv_4', 'Perfeito! Preparei uma proposta especial para voces. Estou enviando por email.', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '1 day 18 hours'),
  ('msg_4_5', 'conv_4', 'Recebi! Muito obrigada pelo atendimento!', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Fernanda Costa', NOW() - INTERVAL '3 hours'),
  ('msg_4_6', 'conv_4', 'Disponha! Qualquer duvida estou a disposicao. Bom dia!', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '3 hours'),

  -- Conversa 7: Marcelo Santos (venda concluida)
  ('msg_7_1', 'conv_7', 'Ola! Estou interessado no pacote completo', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Marcelo Santos', NOW() - INTERVAL '5 days'),
  ('msg_7_2', 'conv_7', 'Ola Marcelo! O pacote completo inclui todos os modulos, suporte VIP e consultoria mensal. Valor: R$ 2.500', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '5 days'),
  ('msg_7_3', 'conv_7', 'Tem desconto a vista?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Marcelo Santos', NOW() - INTERVAL '4 days 20 hours'),
  ('msg_7_4', 'conv_7', 'Consigo fazer R$ 2.200 a vista para voce!', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '4 days 18 hours'),
  ('msg_7_5', 'conv_7', 'Fechado! Pode enviar o link de pagamento', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Marcelo Santos', NOW() - INTERVAL '4 days 16 hours'),
  ('msg_7_6', 'conv_7', 'Excelente! Segue o link: https://pay.exemplo.com/abc123', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '4 days 15 hours'),
  ('msg_7_7', 'conv_7', 'Pago! Obrigado pelo atendimento', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Marcelo Santos', NOW() - INTERVAL '4 days 14 hours'),
  ('msg_7_8', 'conv_7', 'Pagamento confirmado! Acesso enviado por email. Seja bem-vindo!', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '2 days'),

  -- Conversa 8: Patricia Souza (venda concluida)
  ('msg_8_1', 'conv_8', 'Oi! O Marcelo me indicou voces', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Patricia Souza', NOW() - INTERVAL '7 days'),
  ('msg_8_2', 'conv_8', 'Ola Patricia! Que otimo! O Marcelo e um cliente especial. O que posso ajudar?', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '7 days'),
  ('msg_8_3', 'conv_8', 'Quero o mesmo curso que ele fez', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Patricia Souza', NOW() - INTERVAL '6 days 20 hours'),
  ('msg_8_4', 'conv_8', 'Por ser indicacao, vou aplicar 10% de desconto. Fica R$ 450!', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '6 days 18 hours'),
  ('msg_8_5', 'conv_8', 'Perfeito! Vou fazer o PIX agora', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Patricia Souza', NOW() - INTERVAL '6 days 16 hours'),
  ('msg_8_6', 'conv_8', 'Compra realizada com sucesso!', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Patricia Souza', NOW() - INTERVAL '3 days'),

  -- Conversa 10: Andre Oliveira (arquivada - sem interesse)
  ('msg_10_1', 'conv_10', 'Ola, vi o anuncio de voces', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Andre Oliveira', NOW() - INTERVAL '12 days'),
  ('msg_10_2', 'conv_10', 'Ola Andre! Como posso ajudar?', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '12 days'),
  ('msg_10_3', 'conv_10', 'Qual o valor do servico basico?', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Andre Oliveira', NOW() - INTERVAL '11 days 20 hours'),
  ('msg_10_4', 'conv_10', 'O plano basico e R$ 197/mes. Inclui ate 5 campanhas ativas.', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '11 days 18 hours'),
  ('msg_10_5', 'conv_10', 'Hmm, esta fora do meu orcamento no momento', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Andre Oliveira', NOW() - INTERVAL '11 days'),
  ('msg_10_6', 'conv_10', 'Entendo! Quando estiver pronto, me avise. Temos promocoes periodicas.', 'TEXT'::"MessageType", 'OUTBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Atendente', NOW() - INTERVAL '10 days 20 hours'),
  ('msg_10_7', 'conv_10', 'No momento nao tenho interesse', 'TEXT'::"MessageType", 'INBOUND'::"MessageDirection", 'READ'::"MessageStatus", 'Andre Oliveira', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- PRONTO!
-- Execute este script no Supabase SQL Editor
-- Os dados serao inseridos para a pagina de Mensagens
