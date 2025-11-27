-- Migration: Create web_dev_quote_events table for tracking quote interactions
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS web_dev_quote_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_fingerprint TEXT NOT NULL,
  step INTEGER,
  plan_id TEXT,
  addon_ids TEXT[],
  timeline_id TEXT,
  email TEXT,
  phone TEXT,
  name TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_session_id ON web_dev_quote_events(session_id);
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_user_fingerprint ON web_dev_quote_events(user_fingerprint);
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_event_type ON web_dev_quote_events(event_type);
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_timestamp ON web_dev_quote_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_email ON web_dev_quote_events(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_ip_address ON web_dev_quote_events(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_web_dev_quote_events_step ON web_dev_quote_events(step) WHERE step IS NOT NULL;

-- Create a view for abandoned quotes (users who started but didn't complete)
CREATE OR REPLACE VIEW web_dev_abandoned_quotes AS
SELECT DISTINCT ON (session_id)
  session_id,
  user_fingerprint,
  email,
  phone,
  name,
  plan_id,
  addon_ids,
  timeline_id,
  step,
  timestamp as abandoned_at,
  url
FROM web_dev_quote_events
WHERE event_type = 'quote_abandoned'
ORDER BY session_id, timestamp DESC;

-- Create a view for completed quotes
CREATE OR REPLACE VIEW web_dev_completed_quotes AS
SELECT DISTINCT ON (session_id)
  session_id,
  user_fingerprint,
  email,
  phone,
  name,
  plan_id,
  addon_ids,
  timeline_id,
  timestamp as completed_at
FROM web_dev_quote_events
WHERE event_type = 'quote_completed'
ORDER BY session_id, timestamp DESC;

-- Create a view for quote funnel analysis
CREATE OR REPLACE VIEW web_dev_quote_funnel AS
SELECT
  DATE(timestamp) as date,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_started' THEN session_id END) as started,
  COUNT(DISTINCT CASE WHEN event_type = 'plan_selected' THEN session_id END) as plan_selected,
  COUNT(DISTINCT CASE WHEN event_type = 'timeline_selected' THEN session_id END) as timeline_selected,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_completed' THEN session_id END) as completed,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_abandoned' THEN session_id END) as abandoned
FROM web_dev_quote_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE web_dev_quote_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from anyone (for tracking)
CREATE POLICY "Allow public inserts" ON web_dev_quote_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only allow reads for authenticated users (adjust based on your needs)
-- CREATE POLICY "Allow authenticated reads" ON web_dev_quote_events
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

-- For now, allow reads for service role (you can restrict this later)
-- Note: This allows anyone to read, you may want to restrict this
CREATE POLICY "Allow service role reads" ON web_dev_quote_events
  FOR SELECT
  USING (true);

-- Migration: Enhance web_dev_leads table with tracking fields
-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add session_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'web_dev_leads' AND column_name = 'session_id') THEN
    ALTER TABLE web_dev_leads ADD COLUMN session_id TEXT;
  END IF;

  -- Add user_fingerprint column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'web_dev_leads' AND column_name = 'user_fingerprint') THEN
    ALTER TABLE web_dev_leads ADD COLUMN user_fingerprint TEXT;
  END IF;

  -- Add ip_address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'web_dev_leads' AND column_name = 'ip_address') THEN
    ALTER TABLE web_dev_leads ADD COLUMN ip_address TEXT;
  END IF;

  -- Add user_agent column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'web_dev_leads' AND column_name = 'user_agent') THEN
    ALTER TABLE web_dev_leads ADD COLUMN user_agent TEXT;
  END IF;

  -- Add last_step_reached column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'web_dev_leads' AND column_name = 'last_step_reached') THEN
    ALTER TABLE web_dev_leads ADD COLUMN last_step_reached INTEGER;
  END IF;

  -- Add abandoned_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'web_dev_leads' AND column_name = 'abandoned_at') THEN
    ALTER TABLE web_dev_leads ADD COLUMN abandoned_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_web_dev_leads_session_id ON web_dev_leads(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_web_dev_leads_user_fingerprint ON web_dev_leads(user_fingerprint) WHERE user_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_web_dev_leads_ip_address ON web_dev_leads(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_web_dev_leads_abandoned_at ON web_dev_leads(abandoned_at) WHERE abandoned_at IS NOT NULL;

