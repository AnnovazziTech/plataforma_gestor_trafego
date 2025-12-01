-- Enable Row Level Security on all tables
-- Note: Our app uses Prisma with service role key, so RLS won't block our queries
-- This is an extra security layer if someone tries to access DB directly via Supabase client

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_templates_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies that allow service role (our backend) full access
-- The service role bypasses RLS by default in Supabase

-- Plans: anyone can read (public info)
CREATE POLICY "Plans are viewable by everyone" ON public.plans
  FOR SELECT USING (true);

-- Art templates: anyone can read (public templates)
CREATE POLICY "Art templates are viewable by everyone" ON public.art_templates
  FOR SELECT USING (true);

-- Users: users can only see their own data (using Prisma column name)
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- Organizations: members can view their orgs (Prisma uses camelCase: organizationId, userId)
CREATE POLICY "Org members can view organization" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = organizations.id
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Organization members: can view members of same org
CREATE POLICY "Can view org members" ON public.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members AS om
      WHERE om."organizationId" = organization_members."organizationId"
      AND om."userId" = auth.uid()::text
      AND om."isActive" = true
    )
  );

-- Integrations: org members can view
CREATE POLICY "Org members can view integrations" ON public.integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = integrations."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Ad accounts: org members can view
CREATE POLICY "Org members can view ad accounts" ON public.ad_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      JOIN public.organization_members ON organization_members."organizationId" = integrations."organizationId"
      WHERE integrations.id = ad_accounts."integrationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Campaigns: org members can view
CREATE POLICY "Org members can view campaigns" ON public.campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = campaigns."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Campaign metrics: org members can view
CREATE POLICY "Org members can view campaign metrics" ON public.campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.organization_members ON organization_members."organizationId" = campaigns."organizationId"
      WHERE campaigns.id = campaign_metrics."campaignId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Campaign daily metrics: org members can view
CREATE POLICY "Org members can view daily metrics" ON public.campaign_daily_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      JOIN public.organization_members ON organization_members."organizationId" = campaigns."organizationId"
      WHERE campaigns.id = campaign_daily_metrics."campaignId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Leads: org members can view
CREATE POLICY "Org members can view leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = leads."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Lead history: org members can view
CREATE POLICY "Org members can view lead history" ON public.lead_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      JOIN public.organization_members ON organization_members."organizationId" = leads."organizationId"
      WHERE leads.id = lead_history."leadId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Conversations: org members can view
CREATE POLICY "Org members can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = conversations."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Messages: org members can view
CREATE POLICY "Org members can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      JOIN public.organization_members ON organization_members."organizationId" = conversations."organizationId"
      WHERE conversations.id = messages."conversationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Creatives: org members can view
CREATE POLICY "Org members can view creatives" ON public.creatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = creatives."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Saved art templates: org members can view
CREATE POLICY "Org members can view saved templates" ON public.art_templates_saved
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = art_templates_saved."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Webhooks: org members can view
CREATE POLICY "Org members can view webhooks" ON public.webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = webhooks."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- API keys: org members can view
CREATE POLICY "Org members can view api keys" ON public.api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = api_keys."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Audit logs: org members can view
CREATE POLICY "Org members can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members."organizationId" = audit_logs."organizationId"
      AND organization_members."userId" = auth.uid()::text
      AND organization_members."isActive" = true
    )
  );

-- Sessions and accounts: NextAuth internal tables
CREATE POLICY "Users can manage own sessions" ON public.sessions
  FOR ALL USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can manage own accounts" ON public.accounts
  FOR ALL USING ("userId" = auth.uid()::text);

-- Verification tokens: public for email verification flow
CREATE POLICY "Verification tokens are accessible" ON public.verification_tokens
  FOR SELECT USING (true);
