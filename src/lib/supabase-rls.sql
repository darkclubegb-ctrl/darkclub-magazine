-- ════════════════════════════════════════════════════════════
-- DARKCLUB — Supabase RLS Policies
-- Run these in: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════

-- ── 1. Create the media storage bucket (if not exists) ───────
-- Go to: Storage → New Bucket → Name: "media" → Public: true

-- ── 2. Storage Policies for bucket "media" ──────────────────

-- Allow authenticated users to UPLOAD (INSERT) files
CREATE POLICY "Authenticated upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to UPDATE files (Needed for upsert/replace)
CREATE POLICY "Authenticated update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow everyone to READ (SELECT) files (public CDN)
CREATE POLICY "Public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow owner to DELETE their own files
CREATE POLICY "Owner delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 3. Models table RLS ──────────────────────────────────────

-- Enable RLS on models
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Anyone can read published models (public magazine pages)
CREATE POLICY "Public read published models"
ON models FOR SELECT
TO public
USING (published = true);

-- Authenticated users can read their own model (even if unpublished)
CREATE POLICY "Owner read own model"
ON models FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Authenticated users can INSERT their own model
CREATE POLICY "Owner insert model"
ON models FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Authenticated users can UPDATE their own model
CREATE POLICY "Owner update model"
ON models FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- ── 4. Profiles table RLS ────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Own profile access"
ON profiles FOR ALL
TO authenticated
USING (id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- COLUMNS needed in 'models' table for the Dossier:
--
-- edition_title  TEXT
-- bio            TEXT  
-- storytelling   JSONB   (array of {eyebrow, heading, text})
-- cinema_videos  JSONB   (array of {type, url, label, duration})
-- gallery_photos JSONB   (array of {url, size, alignment, caption})
-- testimonials   JSONB   (array of {quote, author})
--
-- Run this if the columns don't exist yet:
-- ════════════════════════════════════════════════════════════

ALTER TABLE models
  ADD COLUMN IF NOT EXISTS edition_title  TEXT,
  ADD COLUMN IF NOT EXISTS storytelling   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cinema_videos  JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gallery_photos JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS testimonials   JSONB DEFAULT '[]';
