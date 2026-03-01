-- ============================================================
-- DARKCLUB DIGITAL MAGAZINE — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'modelo')) default 'modelo',
  display_name text,
  darkclub_verified boolean default false,
  darkclub_url text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Models (magazine content)
create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  slug text unique not null,
  name text not null,
  subtitle text default '',
  bio text default '',
  hero_image text default '',
  video_url text default '',
  darkclub_link text default '',
  insta_link text default '',
  tiktok_link text,
  whatsapp_link text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Gallery photos
create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references models(id) on delete cascade,
  url text not null,
  size text check (size in ('large','medium','small')) default 'medium',
  alignment text check (alignment in ('left','center','right')) default 'center',
  caption text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
alter table profiles enable row level security;
alter table models enable row level security;
alter table gallery_photos enable row level security;

-- ── Profiles ─────────────────────────────────────────────────

-- Anyone can read published profiles (for public pages)
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Admins can update any profile
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Models ───────────────────────────────────────────────────

-- Published models are readable by everyone (public magazine pages)
create policy "Published models are viewable by everyone"
  on models for select
  using (published = true);

-- Model owners can see their own (even unpublished)
create policy "Owners can view own models"
  on models for select
  using (owner_id = auth.uid());

-- Admins can see all models
create policy "Admins can view all models"
  on models for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Model owners can insert/update/delete their own
create policy "Owners can insert models"
  on models for insert
  with check (owner_id = auth.uid());

create policy "Owners can update own models"
  on models for update
  using (owner_id = auth.uid());

create policy "Owners can delete own models"
  on models for delete
  using (owner_id = auth.uid());

-- Admins can do everything
create policy "Admins can insert any model"
  on models for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update any model"
  on models for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete any model"
  on models for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Gallery Photos ───────────────────────────────────────────

-- Public: can read photos of published models
create policy "Public can view gallery of published models"
  on gallery_photos for select
  using (
    exists (select 1 from models where models.id = gallery_photos.model_id and models.published = true)
  );

-- Owners can CRUD their model's photos
create policy "Owners can manage own gallery"
  on gallery_photos for all
  using (
    exists (select 1 from models where models.id = gallery_photos.model_id and models.owner_id = auth.uid())
  );

-- Admins can do everything
create policy "Admins can manage all gallery photos"
  on gallery_photos for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'modelo');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
