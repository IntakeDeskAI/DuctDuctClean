-- ============================================================
-- 00009_marketing_hub.sql
-- Marketing Command Center tables
-- Run this in Supabase SQL Editor before using the Marketing hub
-- ============================================================

-- 1. Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'both')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled')),
  target_audience TEXT NOT NULL DEFAULT 'all_customers' CHECK (target_audience IN ('all_customers', 'all_leads', 'new_leads', 'converted_only', 'custom')),
  custom_filter JSONB DEFAULT NULL,
  subject TEXT DEFAULT NULL,
  content TEXT NOT NULL DEFAULT '',
  sms_content TEXT DEFAULT NULL,
  scheduled_for TIMESTAMPTZ DEFAULT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  converted_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Content Library
CREATE TABLE IF NOT EXISTS content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('email', 'social', 'sms', 'promo', 'blog_idea', 'review_response', 'google_post')),
  platform TEXT DEFAULT NULL,
  tone TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'urgent', 'seasonal')),
  title TEXT DEFAULT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Marketing Coupons
CREATE TABLE IF NOT EXISTS marketing_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  service_type TEXT DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  revenue_generated NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Marketing Action Log
CREATE TABLE IF NOT EXISTS marketing_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (service_role bypasses RLS)
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_action_log ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "Service role full access" ON marketing_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON content_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON marketing_coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON marketing_action_log FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger for campaigns
CREATE OR REPLACE FUNCTION update_marketing_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_campaigns_updated_at();

-- Updated_at trigger for coupons
CREATE OR REPLACE FUNCTION update_marketing_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_coupons_updated_at
  BEFORE UPDATE ON marketing_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_coupons_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_at ON marketing_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_library_type ON content_library(type);
CREATE INDEX IF NOT EXISTS idx_content_library_is_favorite ON content_library(is_favorite);
CREATE INDEX IF NOT EXISTS idx_content_library_created_at ON content_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_coupons_code ON marketing_coupons(code);
CREATE INDEX IF NOT EXISTS idx_marketing_coupons_is_active ON marketing_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_marketing_action_log_created_at ON marketing_action_log(created_at DESC);
