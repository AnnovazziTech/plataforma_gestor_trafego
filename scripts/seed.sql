-- =============================================
-- SEED SQL PARA PLATAFORMA GESTOR DE TRAFEGO
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. CRIAR PLANOS
INSERT INTO plans (id, name, slug, description, "priceMonthly", "priceYearly", "maxUsers", "maxCampaigns", "maxLeads", "maxIntegrations", "maxCreatives", "maxWhatsappNumbers", "hasAiAnalysis", "hasAdvancedReports", "hasAutomation", "hasApiAccess", "hasPrioritySupport", "hasWhiteLabel", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('plan_starter', 'Starter', 'starter', 'Plano inicial gratuito', 0, 0, 1, 5, 100, 1, 20, 1, false, false, false, false, false, false, 0, NOW(), NOW()),
  ('plan_pro', 'Pro', 'pro', 'Para profissionais', 197, 1970, 5, 50, 2000, 5, 500, 3, true, true, true, false, false, false, 1, NOW(), NOW()),
  ('plan_enterprise', 'Enterprise', 'enterprise', 'Para agencias', 497, 4970, 20, 500, 50000, 20, 5000, 10, true, true, true, true, true, true, 2, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- 2. CRIAR USUARIO DEMO
-- Senha: Demo@123 (hash bcrypt)
INSERT INTO users (id, email, name, "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES (
  'user_demo',
  'demo@trafficpro.com',
  'Usuario Demo',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYYwMEpKmXHK',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. CRIAR ORGANIZACAO DEMO
INSERT INTO organizations (id, name, slug, "planId", "subscriptionStatus", "trialEndsAt", "createdAt", "updatedAt")
VALUES (
  'org_demo',
  'Agencia Demo',
  'agencia-demo',
  'plan_pro',
  'ACTIVE',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 4. VINCULAR USUARIO A ORGANIZACAO
INSERT INTO organization_members (id, "organizationId", "userId", role, "canManageCampaigns", "canManageLeads", "canManageIntegrations", "canManageBilling", "canManageMembers", "canViewReports", "isActive", "invitedAt", "acceptedAt")
VALUES (
  'member_demo',
  'org_demo',
  'user_demo',
  'OWNER',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("organizationId", "userId") DO NOTHING;

-- 5. CRIAR INTEGRACOES DE EXEMPLO
INSERT INTO integrations (id, "organizationId", platform, name, status, "accountId", "accountName", "isActive", "createdAt", "updatedAt")
VALUES
  ('int_meta', 'org_demo', 'META', 'Meta Ads - Conta Principal', 'ACTIVE', 'act_123456789', 'Agencia Demo', true, NOW(), NOW()),
  ('int_google', 'org_demo', 'GOOGLE', 'Google Ads - Conta Principal', 'ACTIVE', '123-456-7890', 'Agencia Demo', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 6. CRIAR CAMPANHAS DE EXEMPLO
INSERT INTO campaigns (id, "organizationId", "integrationId", "externalId", name, status, objective, "dailyBudget", "totalBudget", "startDate", platform, "isActive", "createdAt", "updatedAt")
VALUES
  ('camp_1', 'org_demo', 'int_meta', 'ext_001', 'Black Friday 2024', 'ACTIVE', 'CONVERSIONS', 500, 15000, NOW() - INTERVAL '30 days', 'META', true, NOW(), NOW()),
  ('camp_2', 'org_demo', 'int_meta', 'ext_002', 'Lancamento Produto X', 'ACTIVE', 'TRAFFIC', 300, 9000, NOW() - INTERVAL '20 days', 'META', true, NOW(), NOW()),
  ('camp_3', 'org_demo', 'int_google', 'ext_003', 'Remarketing Geral', 'ACTIVE', 'CONVERSIONS', 200, 6000, NOW() - INTERVAL '15 days', 'GOOGLE', true, NOW(), NOW()),
  ('camp_4', 'org_demo', 'int_meta', 'ext_004', 'Awareness Marca', 'PAUSED', 'REACH', 150, 4500, NOW() - INTERVAL '45 days', 'META', true, NOW(), NOW()),
  ('camp_5', 'org_demo', 'int_google', 'ext_005', 'Search Produtos', 'ACTIVE', 'CONVERSIONS', 400, 12000, NOW() - INTERVAL '10 days', 'GOOGLE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. CRIAR METRICAS DIARIAS (ultimos 30 dias)
DO $$
DECLARE
  d DATE;
  camp_id TEXT;
  camps TEXT[] := ARRAY['camp_1', 'camp_2', 'camp_3', 'camp_4', 'camp_5'];
  base_impressions INT;
  base_clicks INT;
  base_conversions INT;
  base_spent DECIMAL;
  base_reach INT;
BEGIN
  FOR i IN 0..29 LOOP
    d := CURRENT_DATE - i;
    FOREACH camp_id IN ARRAY camps LOOP
      -- Valores base aleatorios por campanha
      base_impressions := 5000 + (random() * 15000)::INT;
      base_clicks := (base_impressions * (0.02 + random() * 0.03))::INT;
      base_conversions := (base_clicks * (0.05 + random() * 0.1))::INT;
      base_spent := 50 + random() * 200;
      base_reach := (base_impressions * 0.7)::INT;

      INSERT INTO campaign_daily_metrics (id, "campaignId", date, impressions, clicks, conversions, spent, reach, "createdAt", "updatedAt")
      VALUES (
        'metric_' || camp_id || '_' || i,
        camp_id,
        d,
        base_impressions,
        base_clicks,
        base_conversions,
        base_spent,
        base_reach,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 8. CRIAR LEADS DE EXEMPLO
INSERT INTO leads (id, "organizationId", "campaignId", name, email, phone, status, source, "createdAt", "updatedAt")
VALUES
  ('lead_1', 'org_demo', 'camp_1', 'Joao Silva', 'joao@email.com', '11999998888', 'NEW', 'META', NOW() - INTERVAL '2 days', NOW()),
  ('lead_2', 'org_demo', 'camp_1', 'Maria Santos', 'maria@email.com', '11999997777', 'CONTACTED', 'META', NOW() - INTERVAL '3 days', NOW()),
  ('lead_3', 'org_demo', 'camp_2', 'Pedro Oliveira', 'pedro@email.com', '11999996666', 'QUALIFIED', 'META', NOW() - INTERVAL '5 days', NOW()),
  ('lead_4', 'org_demo', 'camp_3', 'Ana Costa', 'ana@email.com', '11999995555', 'CONVERTED', 'GOOGLE', NOW() - INTERVAL '7 days', NOW()),
  ('lead_5', 'org_demo', 'camp_5', 'Carlos Ferreira', 'carlos@email.com', '11999994444', 'NEW', 'GOOGLE', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT DO NOTHING;

-- 9. CRIAR ATIVIDADES RECENTES
INSERT INTO activities (id, "organizationId", "userId", type, title, description, metadata, "createdAt")
VALUES
  ('act_1', 'org_demo', 'user_demo', 'CAMPAIGN_CREATED', 'Campanha criada', 'Black Friday 2024 foi criada', '{"campaignId": "camp_1"}', NOW() - INTERVAL '30 days'),
  ('act_2', 'org_demo', 'user_demo', 'LEAD_CREATED', 'Novo lead', 'Joao Silva converteu via Meta Ads', '{"leadId": "lead_1"}', NOW() - INTERVAL '2 days'),
  ('act_3', 'org_demo', 'user_demo', 'CAMPAIGN_UPDATED', 'Campanha atualizada', 'Budget aumentado em Lancamento Produto X', '{"campaignId": "camp_2"}', NOW() - INTERVAL '1 day'),
  ('act_4', 'org_demo', 'user_demo', 'INTEGRATION_CONNECTED', 'Integracao conectada', 'Google Ads foi conectado', '{"integrationId": "int_google"}', NOW() - INTERVAL '15 days'),
  ('act_5', 'org_demo', 'user_demo', 'LEAD_CONVERTED', 'Lead convertido', 'Ana Costa foi convertida', '{"leadId": "lead_4"}', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- PRONTO!
-- Usuario: demo@trafficpro.com
-- Senha: Demo@123
