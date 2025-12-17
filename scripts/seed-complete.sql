-- =============================================
-- SEED COMPLETO - TODAS AS TABELAS
-- Execute no Supabase SQL Editor
-- =============================================

-- Primeiro, vamos verificar quais campanhas existem e pegar os IDs reais
-- Execute: SELECT id, name FROM campaigns;

-- =============================================
-- 1. CAMPAIGN_METRICS (para topCampaigns no Dashboard)
-- =============================================
INSERT INTO campaign_metrics (
  id, "campaignId", impressions, reach, clicks, ctr, cpc, cpm,
  conversions, "conversionRate", "costPerConversion", spent, roas,
  frequency, "videoViews", likes, comments, shares, saves,
  "periodStart", "periodEnd", "createdAt", "updatedAt"
)
SELECT
  'metric_' || c.id || '_total',
  c.id,
  150000,  -- impressions
  85000,   -- reach
  4500,    -- clicks
  3.0,     -- ctr (%)
  2.50,    -- cpc
  18.75,   -- cpm
  180,     -- conversions
  4.0,     -- conversionRate (%)
  62.50,   -- costPerConversion
  11250.00, -- spent
  3.2,     -- roas
  1.8,     -- frequency
  25000,   -- videoViews
  1200,    -- likes
  150,     -- comments
  80,      -- shares
  45,      -- saves
  NOW() - INTERVAL '30 days',
  NOW(),
  NOW(),
  NOW()
FROM campaigns c
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_metrics cm WHERE cm."campaignId" = c.id
)
LIMIT 5;

-- =============================================
-- 2. REPORTS (para pagina Relatorios)
-- =============================================
INSERT INTO reports (
  id, "organizationId", name, type, frequency, status,
  platforms, metrics, "dateRangeStart", "dateRangeEnd",
  recipients, "sendMethod", "lastGenerated", "generatedCount",
  "reportData", "isActive", "createdAt", "updatedAt"
)
VALUES
  (
    'report_1',
    'org_demo',
    'Relatorio Mensal de Performance',
    'PERFORMANCE'::"ReportType",
    'MONTHLY'::"ReportFrequency",
    'ACTIVE'::"ReportStatus",
    ARRAY['META', 'GOOGLE']::"IntegrationPlatform"[],
    ARRAY['impressions', 'clicks', 'conversions', 'spent', 'roas']::text[],
    NOW() - INTERVAL '30 days',
    NOW(),
    ARRAY['gestor@agencia.com']::text[],
    'EMAIL'::"SendMethod",
    NOW() - INTERVAL '1 day',
    5,
    '{"aggregatedMetrics": {"totalSpent": 45000, "totalImpressions": 500000, "totalClicks": 15000, "totalConversions": 600, "ctr": 3.0, "cpc": 3.0, "roas": 2.8}}'::jsonb,
    true,
    NOW() - INTERVAL '60 days',
    NOW()
  ),
  (
    'report_2',
    'org_demo',
    'Analise de Audiencia Q4',
    'AUDIENCE'::"ReportType",
    'ONCE'::"ReportFrequency",
    'ACTIVE'::"ReportStatus",
    ARRAY['META']::"IntegrationPlatform"[],
    ARRAY['reach', 'impressions', 'frequency', 'engagement']::text[],
    NOW() - INTERVAL '90 days',
    NOW(),
    ARRAY['cliente@empresa.com', 'gestor@agencia.com']::text[],
    'EMAIL'::"SendMethod",
    NOW() - INTERVAL '7 days',
    1,
    '{"aggregatedMetrics": {"totalReach": 250000, "totalImpressions": 800000, "avgFrequency": 3.2, "engagementRate": 4.5}}'::jsonb,
    true,
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    'report_3',
    'org_demo',
    'Relatorio Semanal Meta Ads',
    'PERFORMANCE'::"ReportType",
    'WEEKLY'::"ReportFrequency",
    'ACTIVE'::"ReportStatus",
    ARRAY['META']::"IntegrationPlatform"[],
    ARRAY['impressions', 'clicks', 'conversions', 'spent']::text[],
    NOW() - INTERVAL '7 days',
    NOW(),
    ARRAY['gestor@agencia.com']::text[],
    'WHATSAPP'::"SendMethod",
    NOW() - INTERVAL '1 day',
    8,
    '{"aggregatedMetrics": {"totalSpent": 8500, "totalImpressions": 120000, "totalClicks": 3600, "totalConversions": 144}}'::jsonb,
    true,
    NOW() - INTERVAL '56 days',
    NOW()
  ),
  (
    'report_4',
    'org_demo',
    'Analise de Criativos Black Friday',
    'CREATIVE'::"ReportType",
    'ONCE'::"ReportFrequency",
    'ACTIVE'::"ReportStatus",
    ARRAY['META', 'GOOGLE']::"IntegrationPlatform"[],
    ARRAY['clicks', 'ctr', 'conversions', 'engagement']::text[],
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '15 days',
    ARRAY['marketing@empresa.com']::text[],
    'DOWNLOAD'::"SendMethod",
    NOW() - INTERVAL '14 days',
    1,
    '{"topCreatives": [{"name": "Banner Principal", "clicks": 5000, "ctr": 4.2}, {"name": "Video Promo", "clicks": 8000, "ctr": 5.1}]}'::jsonb,
    true,
    NOW() - INTERVAL '45 days',
    NOW()
  ),
  (
    'report_5',
    'org_demo',
    'Dashboard Diario',
    'CUSTOM'::"ReportType",
    'DAILY'::"ReportFrequency",
    'PAUSED'::"ReportStatus",
    ARRAY['META', 'GOOGLE', 'TIKTOK']::"IntegrationPlatform"[],
    ARRAY['spent', 'conversions', 'roas']::text[],
    NOW() - INTERVAL '1 day',
    NOW(),
    ARRAY['ceo@agencia.com']::text[],
    'EMAIL'::"SendMethod",
    NOW() - INTERVAL '3 days',
    45,
    '{"aggregatedMetrics": {"totalSpent": 1500, "totalConversions": 45, "roas": 3.0}}'::jsonb,
    true,
    NOW() - INTERVAL '90 days',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. LEADS (para pagina Leads)
-- =============================================
INSERT INTO leads (
  id, "organizationId", "campaignId", name, email, phone,
  source, "sourceDetails", "utmSource", "utmMedium", "utmCampaign",
  status, value, notes, "createdAt", "updatedAt"
)
SELECT
  'lead_' || gen.n,
  'org_demo',
  CASE
    WHEN gen.n % 3 = 0 THEN c1.id
    WHEN gen.n % 3 = 1 THEN c2.id
    ELSE c3.id
  END,
  CASE gen.n
    WHEN 1 THEN 'Joao Silva'
    WHEN 2 THEN 'Maria Santos'
    WHEN 3 THEN 'Pedro Oliveira'
    WHEN 4 THEN 'Ana Costa'
    WHEN 5 THEN 'Carlos Ferreira'
    WHEN 6 THEN 'Juliana Lima'
    WHEN 7 THEN 'Roberto Souza'
    WHEN 8 THEN 'Fernanda Alves'
    WHEN 9 THEN 'Lucas Mendes'
    WHEN 10 THEN 'Camila Rocha'
    WHEN 11 THEN 'Bruno Martins'
    WHEN 12 THEN 'Patricia Gomes'
    WHEN 13 THEN 'Rafael Pereira'
    WHEN 14 THEN 'Amanda Ribeiro'
    WHEN 15 THEN 'Thiago Barbosa'
  END,
  CASE gen.n
    WHEN 1 THEN 'joao.silva@email.com'
    WHEN 2 THEN 'maria.santos@email.com'
    WHEN 3 THEN 'pedro.oliveira@email.com'
    WHEN 4 THEN 'ana.costa@email.com'
    WHEN 5 THEN 'carlos.ferreira@email.com'
    WHEN 6 THEN 'juliana.lima@email.com'
    WHEN 7 THEN 'roberto.souza@email.com'
    WHEN 8 THEN 'fernanda.alves@email.com'
    WHEN 9 THEN 'lucas.mendes@email.com'
    WHEN 10 THEN 'camila.rocha@email.com'
    WHEN 11 THEN 'bruno.martins@email.com'
    WHEN 12 THEN 'patricia.gomes@email.com'
    WHEN 13 THEN 'rafael.pereira@email.com'
    WHEN 14 THEN 'amanda.ribeiro@email.com'
    WHEN 15 THEN 'thiago.barbosa@email.com'
  END,
  '119' || (90000000 + gen.n * 111111)::text,
  CASE
    WHEN gen.n % 4 = 0 THEN 'META_ADS'
    WHEN gen.n % 4 = 1 THEN 'GOOGLE_ADS'
    WHEN gen.n % 4 = 2 THEN 'WHATSAPP'
    ELSE 'ORGANIC'
  END::"LeadSource",
  'Campanha de ' || CASE WHEN gen.n % 2 = 0 THEN 'Black Friday' ELSE 'Lancamento' END,
  CASE WHEN gen.n % 4 IN (0, 1) THEN 'facebook' ELSE NULL END,
  CASE WHEN gen.n % 4 IN (0, 1) THEN 'cpc' ELSE NULL END,
  CASE WHEN gen.n % 4 IN (0, 1) THEN 'black_friday_2024' ELSE NULL END,
  CASE gen.n % 8
    WHEN 0 THEN 'NEW'
    WHEN 1 THEN 'CONTACTED'
    WHEN 2 THEN 'QUALIFIED'
    WHEN 3 THEN 'PROPOSAL'
    WHEN 4 THEN 'NEGOTIATION'
    WHEN 5 THEN 'WON'
    WHEN 6 THEN 'LOST'
    ELSE 'REMARKETING'
  END::"LeadStatus",
  (1000 + gen.n * 500)::float,
  CASE WHEN gen.n % 3 = 0 THEN 'Cliente com alto potencial' ELSE NULL END,
  NOW() - (gen.n || ' days')::interval,
  NOW()
FROM generate_series(1, 15) AS gen(n),
  (SELECT id FROM campaigns ORDER BY "createdAt" LIMIT 1) c1,
  (SELECT id FROM campaigns ORDER BY "createdAt" OFFSET 1 LIMIT 1) c2,
  (SELECT id FROM campaigns ORDER BY "createdAt" OFFSET 2 LIMIT 1) c3
WHERE c1.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. CREATIVES (para pagina Criativos)
-- =============================================
INSERT INTO creatives (
  id, "organizationId", title, description, type, platform,
  "thumbnailUrl", "mediaUrl", "sourceAdvertiser", likes, comments, shares,
  tags, "isFavorite", "createdAt", "updatedAt"
)
VALUES
  (
    'creative_1', 'org_demo',
    'Banner Black Friday Principal',
    'Banner 1080x1080 para feed do Instagram',
    'IMAGE'::"CreativeType", 'META'::"IntegrationPlatform",
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/1080/1080?random=1',
    'Agencia Demo',
    2500, 180, 95,
    ARRAY['black-friday', 'promocao', 'instagram']::text[],
    true,
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    'creative_2', 'org_demo',
    'Video Promocional 15s',
    'Video curto para stories e reels',
    'VIDEO'::"CreativeType", 'META'::"IntegrationPlatform",
    'https://picsum.photos/400/711?random=2',
    'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'Agencia Demo',
    8500, 420, 310,
    ARRAY['video', 'stories', 'reels', 'promocao']::text[],
    true,
    NOW() - INTERVAL '25 days',
    NOW()
  ),
  (
    'creative_3', 'org_demo',
    'Carrossel de Produtos',
    'Carrossel com 5 produtos em destaque',
    'CAROUSEL'::"CreativeType", 'META'::"IntegrationPlatform",
    'https://picsum.photos/400/400?random=3',
    NULL,
    'Agencia Demo',
    3200, 250, 120,
    ARRAY['carrossel', 'produtos', 'e-commerce']::text[],
    false,
    NOW() - INTERVAL '20 days',
    NOW()
  ),
  (
    'creative_4', 'org_demo',
    'Banner Google Display 728x90',
    'Leaderboard para rede de display',
    'IMAGE'::"CreativeType", 'GOOGLE'::"IntegrationPlatform",
    'https://picsum.photos/728/90?random=4',
    'https://picsum.photos/728/90?random=4',
    'Agencia Demo',
    NULL, NULL, NULL,
    ARRAY['google-ads', 'display', 'banner']::text[],
    false,
    NOW() - INTERVAL '18 days',
    NOW()
  ),
  (
    'creative_5', 'org_demo',
    'Copy Lancamento Produto X',
    'Texto para anuncios de lancamento',
    'TEXT'::"CreativeType", 'META'::"IntegrationPlatform",
    NULL, NULL,
    'Agencia Demo',
    NULL, NULL, NULL,
    ARRAY['copy', 'lancamento', 'texto']::text[],
    false,
    NOW() - INTERVAL '15 days',
    NOW()
  ),
  (
    'creative_6', 'org_demo',
    'Video Depoimento Cliente',
    'Video de 30s com depoimento real',
    'VIDEO'::"CreativeType", 'META'::"IntegrationPlatform",
    'https://picsum.photos/400/711?random=6',
    NULL,
    'Agencia Demo',
    5600, 380, 220,
    ARRAY['depoimento', 'prova-social', 'video']::text[],
    true,
    NOW() - INTERVAL '12 days',
    NOW()
  ),
  (
    'creative_7', 'org_demo',
    'Banner Remarketing',
    'Arte para remarketing dinamico',
    'IMAGE'::"CreativeType", 'GOOGLE'::"IntegrationPlatform",
    'https://picsum.photos/300/250?random=7',
    'https://picsum.photos/300/250?random=7',
    'Agencia Demo',
    NULL, NULL, NULL,
    ARRAY['remarketing', 'google-ads', 'conversao']::text[],
    false,
    NOW() - INTERVAL '10 days',
    NOW()
  ),
  (
    'creative_8', 'org_demo',
    'Story Animado Natal',
    'Story com animacao para campanha de Natal',
    'VIDEO'::"CreativeType", 'META'::"IntegrationPlatform",
    'https://picsum.photos/400/711?random=8',
    NULL,
    'Agencia Demo',
    4200, 290, 180,
    ARRAY['natal', 'stories', 'animacao', 'sazonal']::text[],
    true,
    NOW() - INTERVAL '5 days',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. SCHEDULED_POSTS (para pagina Social)
-- =============================================
INSERT INTO scheduled_posts (
  id, "organizationId", name, platform, "scheduledDate", "scheduledTime",
  format, text, "mediaUrl", "mediaType", status, "createdAt", "updatedAt"
)
VALUES
  (
    'post_1', 'org_demo',
    'Post Black Friday',
    'INSTAGRAM'::"SocialPlatform",
    NOW() + INTERVAL '2 days',
    '10:00',
    'FEED'::"PostFormat",
    'Black Friday chegou! Aproveite descontos de ate 70% em todos os produtos. Link na bio!',
    'https://picsum.photos/1080/1080?random=10',
    'IMAGE'::"MediaType",
    'SCHEDULED'::"ScheduledPostStatus",
    NOW() - INTERVAL '5 days',
    NOW()
  ),
  (
    'post_2', 'org_demo',
    'Reels Bastidores',
    'INSTAGRAM'::"SocialPlatform",
    NOW() + INTERVAL '3 days',
    '14:00',
    'REELS'::"PostFormat",
    'Um dia na nossa agencia! Conheca os bastidores de como criamos campanhas de sucesso.',
    'https://picsum.photos/1080/1920?random=11',
    'VIDEO'::"MediaType",
    'SCHEDULED'::"ScheduledPostStatus",
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    'post_3', 'org_demo',
    'Story Enquete',
    'INSTAGRAM'::"SocialPlatform",
    NOW() + INTERVAL '1 day',
    '18:00',
    'STORY'::"PostFormat",
    'Qual tipo de conteudo voce quer ver mais por aqui?',
    'https://picsum.photos/1080/1920?random=12',
    'IMAGE'::"MediaType",
    'SCHEDULED'::"ScheduledPostStatus",
    NOW() - INTERVAL '1 day',
    NOW()
  ),
  (
    'post_4', 'org_demo',
    'Post Linkedin Case',
    'LINKEDIN'::"SocialPlatform",
    NOW() + INTERVAL '4 days',
    '09:00',
    'FEED'::"PostFormat",
    'Case de Sucesso: Como aumentamos em 300% as conversoes do nosso cliente em apenas 3 meses. Thread abaixo!',
    'https://picsum.photos/1200/628?random=13',
    'IMAGE'::"MediaType",
    'SCHEDULED'::"ScheduledPostStatus",
    NOW() - INTERVAL '2 days',
    NOW()
  ),
  (
    'post_5', 'org_demo',
    'Video TikTok Tutorial',
    'TIKTOK'::"SocialPlatform",
    NOW() + INTERVAL '5 days',
    '20:00',
    'FEED'::"PostFormat",
    '3 dicas para melhorar seus anuncios no Meta Ads',
    'https://picsum.photos/1080/1920?random=14',
    'VIDEO'::"MediaType",
    'SCHEDULED'::"ScheduledPostStatus",
    NOW() - INTERVAL '4 days',
    NOW()
  ),
  (
    'post_6', 'org_demo',
    'Post Facebook Natal',
    'FACEBOOK'::"SocialPlatform",
    NOW() + INTERVAL '7 days',
    '12:00',
    'FEED'::"PostFormat",
    'Feliz Natal! Agradecemos a todos os clientes que confiaram em nosso trabalho este ano.',
    'https://picsum.photos/1200/628?random=15',
    'IMAGE'::"MediaType",
    'SCHEDULED'::"ScheduledPostStatus",
    NOW() - INTERVAL '6 days',
    NOW()
  ),
  (
    'post_7', 'org_demo',
    'Carrossel Dicas',
    'INSTAGRAM'::"SocialPlatform",
    NOW() - INTERVAL '2 days',
    '16:00',
    'CAROUSEL'::"PostFormat",
    '5 erros que voce deve evitar nos seus anuncios. Salve para nao esquecer!',
    'https://picsum.photos/1080/1080?random=16',
    'IMAGE'::"MediaType",
    'PUBLISHED'::"ScheduledPostStatus",
    NOW() - INTERVAL '10 days',
    NOW()
  ),
  (
    'post_8', 'org_demo',
    'Reels Atras do Numero',
    'INSTAGRAM'::"SocialPlatform",
    NOW() - INTERVAL '5 days',
    '11:00',
    'REELS'::"PostFormat",
    'R$ 50 mil em vendas com apenas R$ 5 mil de investimento. Como fizemos isso?',
    'https://picsum.photos/1080/1920?random=17',
    'VIDEO'::"MediaType",
    'PUBLISHED'::"ScheduledPostStatus",
    NOW() - INTERVAL '12 days',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. AUDIT_LOGS (para logs de atividade)
-- =============================================
INSERT INTO audit_logs (
  id, "organizationId", "userId", "userEmail", action, entity, "entityId",
  "newData", "ipAddress", "createdAt"
)
SELECT
  'audit_' || gen.n,
  'org_demo',
  (SELECT id FROM users WHERE email = 'demo@trafficpro.com' LIMIT 1),
  'demo@trafficpro.com',
  CASE gen.n % 10
    WHEN 0 THEN 'campaign.created'
    WHEN 1 THEN 'campaign.updated'
    WHEN 2 THEN 'lead.created'
    WHEN 3 THEN 'lead.status_changed'
    WHEN 4 THEN 'report.created'
    WHEN 5 THEN 'report.generated'
    WHEN 6 THEN 'creative.uploaded'
    WHEN 7 THEN 'integration.connected'
    WHEN 8 THEN 'user.login'
    ELSE 'settings.updated'
  END,
  CASE gen.n % 10
    WHEN 0 THEN 'campaign'
    WHEN 1 THEN 'campaign'
    WHEN 2 THEN 'lead'
    WHEN 3 THEN 'lead'
    WHEN 4 THEN 'report'
    WHEN 5 THEN 'report'
    WHEN 6 THEN 'creative'
    WHEN 7 THEN 'integration'
    WHEN 8 THEN 'user'
    ELSE 'settings'
  END,
  CASE gen.n % 10
    WHEN 0 THEN 'camp_' || (gen.n % 3 + 1)
    WHEN 1 THEN 'camp_' || (gen.n % 3 + 1)
    WHEN 2 THEN 'lead_' || (gen.n % 5 + 1)
    WHEN 3 THEN 'lead_' || (gen.n % 5 + 1)
    WHEN 4 THEN 'report_' || (gen.n % 3 + 1)
    WHEN 5 THEN 'report_' || (gen.n % 3 + 1)
    WHEN 6 THEN 'creative_' || (gen.n % 4 + 1)
    WHEN 7 THEN 'int_meta'
    ELSE NULL
  END,
  ('{"action": "' || CASE gen.n % 10
    WHEN 0 THEN 'Nova campanha criada'
    WHEN 1 THEN 'Budget atualizado'
    WHEN 2 THEN 'Novo lead capturado'
    WHEN 3 THEN 'Status alterado para Qualified'
    WHEN 4 THEN 'Novo relatorio criado'
    WHEN 5 THEN 'Relatorio gerado com sucesso'
    WHEN 6 THEN 'Criativo enviado'
    WHEN 7 THEN 'Meta Ads conectado'
    WHEN 8 THEN 'Login realizado'
    ELSE 'Configuracoes atualizadas'
  END || '"}')::jsonb,
  '192.168.1.' || (gen.n % 255)::text,
  NOW() - (gen.n || ' hours')::interval
FROM generate_series(1, 50) AS gen(n)
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. Atualizar INTEGRATIONS para ter token
-- =============================================
UPDATE integrations
SET "accessToken" = 'demo_token_' || id
WHERE "accessToken" IS NULL OR "accessToken" = '';

-- =============================================
-- VERIFICACAO FINAL
-- =============================================
SELECT 'campaigns' as tabela, COUNT(*) as total FROM campaigns
UNION ALL
SELECT 'campaign_metrics', COUNT(*) FROM campaign_metrics
UNION ALL
SELECT 'campaign_daily_metrics', COUNT(*) FROM campaign_daily_metrics
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'creatives', COUNT(*) FROM creatives
UNION ALL
SELECT 'scheduled_posts', COUNT(*) FROM scheduled_posts
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'integrations', COUNT(*) FROM integrations
ORDER BY tabela;
