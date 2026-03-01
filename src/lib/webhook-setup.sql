-- ════════════════════════════════════════════════════════════
-- DARKCLUB — Stripe Webhook (Supabase Edge Function)
-- ════════════════════════════════════════════════════════════
--
-- SETUP:
--   1. Supabase Dashboard → Edge Functions → New Function
--      Name: stripe-webhook
--   2. Paste the Deno code below (stripe-webhook/index.ts)
--   3. Add secrets:
--      STRIPE_SECRET_KEY     = sk_live_...
--      STRIPE_WEBHOOK_SECRET = whsec_...
--      SUPABASE_URL          = (auto-set by Edge Functions)
--      SUPABASE_SERVICE_ROLE_KEY  = (from project settings → API)
--
-- STRIPE SETUP:
--   Dashboard → Webhooks → Add endpoint
--   URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook
--   Event: checkout.session.completed
-- ════════════════════════════════════════════════════════════

-- This file is documentation. The actual Edge Function code
-- is in: supabase/functions/stripe-webhook/index.ts
-- (created automatically by the setup instructions above)

-- The webhook will run this query on payment confirmation:
--
-- UPDATE models
-- SET status = 'active', published = true
-- WHERE slug = <clientReferenceId from Stripe session>;
--
-- Add status column if not exists:
ALTER TABLE models
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- RLS: public can only read 'active' models
DROP POLICY IF EXISTS "Public read published models" ON models;
DROP POLICY IF EXISTS "Public read active models" ON models;

CREATE POLICY "Public read active models"
ON models FOR SELECT
TO public
USING (status = 'active' AND published = true);
