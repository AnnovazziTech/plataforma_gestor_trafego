-- Fix RLS: Correct schema from public to sistema_gestor
-- Also adds RLS + policies for all new tables added since original migration
-- Note: Prisma connects via service role which bypasses RLS.
-- This is an extra security layer for direct Supabase client access.

-- =============================================
-- STEP 1: Drop all existing policies (from old migration using public schema)
-- =============================================

DROP POLICY IF EXISTS "Plans are viewable by everyone" ON sistema_gestor.plans;
DROP POLICY IF EXISTS "Art templates are viewable by everyone" ON sistema_gestor.art_templates;
DROP POLICY IF EXISTS "Users can view own data" ON sistema_gestor.users;
DROP POLICY IF EXISTS "Users can update own data" ON sistema_gestor.users;
DROP POLICY IF EXISTS "Org members can view organization" ON sistema_gestor.organizations;
DROP POLICY IF EXISTS "Can view org members" ON sistema_gestor.organization_members;
DROP POLICY IF EXISTS "Org members can view integrations" ON sistema_gestor.integrations;
DROP POLICY IF EXISTS "Org members can view ad accounts" ON sistema_gestor.ad_accounts;
DROP POLICY IF EXISTS "Org members can view campaigns" ON sistema_gestor.campaigns;
DROP POLICY IF EXISTS "Org members can view campaign metrics" ON sistema_gestor.campaign_metrics;
DROP POLICY IF EXISTS "Org members can view daily metrics" ON sistema_gestor.campaign_daily_metrics;
DROP POLICY IF EXISTS "Org members can view leads" ON sistema_gestor.leads;
DROP POLICY IF EXISTS "Org members can view lead history" ON sistema_gestor.lead_history;
DROP POLICY IF EXISTS "Org members can view conversations" ON sistema_gestor.conversations;
DROP POLICY IF EXISTS "Org members can view messages" ON sistema_gestor.messages;
DROP POLICY IF EXISTS "Org members can view creatives" ON sistema_gestor.creatives;
DROP POLICY IF EXISTS "Org members can view saved templates" ON sistema_gestor.art_templates_saved;
DROP POLICY IF EXISTS "Org members can view webhooks" ON sistema_gestor.webhooks;
DROP POLICY IF EXISTS "Org members can view api keys" ON sistema_gestor.api_keys;
DROP POLICY IF EXISTS "Org members can view audit logs" ON sistema_gestor.audit_logs;
DROP POLICY IF EXISTS "Users can manage own sessions" ON sistema_gestor.sessions;
DROP POLICY IF EXISTS "Users can manage own accounts" ON sistema_gestor.accounts;
DROP POLICY IF EXISTS "Verification tokens are accessible" ON sistema_gestor.verification_tokens;

-- =============================================
-- STEP 2: Enable RLS on ALL tables (original + new)
-- =============================================

-- Original tables
ALTER TABLE sistema_gestor.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.campaign_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.art_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.art_templates_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.audit_logs ENABLE ROW LEVEL SECURITY;

-- New tables
ALTER TABLE sistema_gestor.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.link_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.link_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_gestor.quotes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 3: Create policies for ORIGINAL tables (fixed schema)
-- =============================================

-- Plans: anyone can read (public info)
CREATE POLICY "Plans are viewable by everyone" ON sistema_gestor.plans
  FOR SELECT USING (true);

-- Art templates: anyone can read (public templates)
CREATE POLICY "Art templates are viewable by everyone" ON sistema_gestor.art_templates
  FOR SELECT USING (true);

-- Users: users can only see their own data
CREATE POLICY "Users can view own data" ON sistema_gestor.users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON sistema_gestor.users
  FOR UPDATE USING (auth.uid()::text = id);

-- Organizations: members can view their orgs
CREATE POLICY "Org members can view organization" ON sistema_gestor.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = organizations.id
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Organization members: can view members of same org
CREATE POLICY "Can view org members" ON sistema_gestor.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members AS om
      WHERE om."organizationId" = organization_members."organizationId"
      AND om."userId" = auth.uid()::text
      AND om."isActive" = true
    )
  );

-- Integrations: org members can view
CREATE POLICY "Org members can view integrations" ON sistema_gestor.integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = integrations."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Ad accounts: org members can view
CREATE POLICY "Org members can view ad accounts" ON sistema_gestor.ad_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.integrations
      JOIN sistema_gestor.organization_members ON organization_members."organizationId" = integrations."organizationId"
      WHERE integrations.id = ad_accounts."integrationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Campaigns: org members can view
CREATE POLICY "Org members can view campaigns" ON sistema_gestor.campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = campaigns."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Campaign metrics: org members can view
CREATE POLICY "Org members can view campaign metrics" ON sistema_gestor.campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.campaigns
      JOIN sistema_gestor.organization_members ON organization_members."organizationId" = campaigns."organizationId"
      WHERE campaigns.id = campaign_metrics."campaignId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Campaign daily metrics: org members can view
CREATE POLICY "Org members can view daily metrics" ON sistema_gestor.campaign_daily_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.campaigns
      JOIN sistema_gestor.organization_members ON organization_members."organizationId" = campaigns."organizationId"
      WHERE campaigns.id = campaign_daily_metrics."campaignId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Leads: org members can view
CREATE POLICY "Org members can view leads" ON sistema_gestor.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = leads."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Lead history: org members can view
CREATE POLICY "Org members can view lead history" ON sistema_gestor.lead_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.leads
      JOIN sistema_gestor.organization_members ON organization_members."organizationId" = leads."organizationId"
      WHERE leads.id = lead_history."leadId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Conversations: org members can view
CREATE POLICY "Org members can view conversations" ON sistema_gestor.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = conversations."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Messages: org members can view
CREATE POLICY "Org members can view messages" ON sistema_gestor.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.conversations
      JOIN sistema_gestor.organization_members ON organization_members."organizationId" = conversations."organizationId"
      WHERE conversations.id = messages."conversationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Creatives: org members can view
CREATE POLICY "Org members can view creatives" ON sistema_gestor.creatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = creatives."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Saved art templates: org members can view
CREATE POLICY "Org members can view saved templates" ON sistema_gestor.art_templates_saved
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = art_templates_saved."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Webhooks: org members can view
CREATE POLICY "Org members can view webhooks" ON sistema_gestor.webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = webhooks."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- API keys: org members can view
CREATE POLICY "Org members can view api keys" ON sistema_gestor.api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = api_keys."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Audit logs: org members can view
CREATE POLICY "Org members can view audit logs" ON sistema_gestor.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = audit_logs."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Sessions and accounts: NextAuth internal tables
CREATE POLICY "Users can manage own sessions" ON sistema_gestor.sessions
  FOR ALL USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can manage own accounts" ON sistema_gestor.accounts
  FOR ALL USING ("userId" = auth.uid()::text);

-- Verification tokens: public for email verification flow
CREATE POLICY "Verification tokens are accessible" ON sistema_gestor.verification_tokens
  FOR SELECT USING (true);

-- =============================================
-- STEP 4: Create policies for NEW tables
-- =============================================

-- Reports: org members can view
CREATE POLICY "Org members can view reports" ON sistema_gestor.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = reports."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Automations: org members can view
CREATE POLICY "Org members can view automations" ON sistema_gestor.automations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = automations."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Scheduled posts: org members can view
CREATE POLICY "Org members can view scheduled posts" ON sistema_gestor.scheduled_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = scheduled_posts."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Prospects: org members can view
CREATE POLICY "Org members can view prospects" ON sistema_gestor.prospects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = prospects."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Notes: org members can view
CREATE POLICY "Org members can view notes" ON sistema_gestor.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = notes."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Ideas: org members can view
CREATE POLICY "Org members can view ideas" ON sistema_gestor.ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = ideas."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Goals: org members can view
CREATE POLICY "Org members can view goals" ON sistema_gestor.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = goals."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Link pages: org members can view
CREATE POLICY "Org members can view link pages" ON sistema_gestor.link_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = link_pages."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Link items: org members can view (via link page)
CREATE POLICY "Org members can view link items" ON sistema_gestor.link_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.link_pages
      JOIN sistema_gestor.organization_members ON organization_members."organizationId" = link_pages."organizationId"
      WHERE link_pages.id = link_items."linkPageId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Products: public (standalone marketplace)
CREATE POLICY "Products are viewable by everyone" ON sistema_gestor.products
  FOR SELECT USING (true);

-- Purchases: org members can view
CREATE POLICY "Org members can view purchases" ON sistema_gestor.purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = purchases."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Courses: public (standalone marketplace)
CREATE POLICY "Courses are viewable by everyone" ON sistema_gestor.courses
  FOR SELECT USING (true);

-- Lessons: public (accessible via course)
CREATE POLICY "Lessons are viewable by everyone" ON sistema_gestor.lessons
  FOR SELECT USING (true);

-- Enrollments: org members can view
CREATE POLICY "Org members can view enrollments" ON sistema_gestor.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = enrollments."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Lesson progress: org members can view
CREATE POLICY "Org members can view lesson progress" ON sistema_gestor.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = lesson_progress."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Clients: org members can view
CREATE POLICY "Org members can view clients" ON sistema_gestor.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = clients."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Expenses: org members can view
CREATE POLICY "Org members can view expenses" ON sistema_gestor.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = expenses."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Quotes: org members can view
CREATE POLICY "Org members can view quotes" ON sistema_gestor.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sistema_gestor.organization_members
      WHERE organization_members."organizationId" = quotes."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );
