-- GrowthOS AI — core schema
-- Run this against a Supabase Postgres project once you're ready to move
-- off the local demo store. The app works with zero configuration without
-- this: see src/lib/supabase/config.ts.

create extension if not exists "pgcrypto";

-- ---------- Organizations & membership ----------

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  industry text,
  plan text not null default 'Starter' check (plan in ('Starter', 'Growth', 'Scale', 'Enterprise')),
  brand_voice jsonb not null default '{}'::jsonb, -- default tone, channels, etc. from onboarding
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'Contributor' check (role in ('Owner', 'Admin', 'Editor', 'Contributor', 'Viewer')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ---------- Shared content model ----------
-- One flexible table for every content type across every module
-- (blog, landing-page, social-post, email, ad, case-study, etc.)
-- rather than a separate table per content type.

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null, -- 'blog' | 'social' | 'email' | 'ad' | 'landing' | 'case-study' | 'newsletter' | ...
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'approved', 'scheduled', 'published')),
  brief jsonb not null default '{}'::jsonb,       -- structured brief (topic, tone, audience, keywords, platform, etc.)
  metadata jsonb not null default '{}'::jsonb,    -- module-specific extras (platform, media type, engagement stats...)
  active_version_id uuid,                          -- FK added below, after content_versions exists
  campaign text,
  owner_id uuid references auth.users(id),
  owner_name text,
  scheduled_for timestamptz,
  published_at timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_items_org on content_items(org_id);
create index if not exists idx_content_items_type on content_items(org_id, type);
create index if not exists idx_content_items_status on content_items(org_id, status);

create table if not exists content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content_items(id) on delete cascade,
  body text not null,
  metadata jsonb not null default '{}'::jsonb, -- e.g. { "hashtags": ["a", "b"] } for social versions
  note text,
  generated_by text not null default 'ai' check (generated_by in ('ai', 'human')),
  created_at timestamptz not null default now()
);

create index if not exists idx_content_versions_content on content_versions(content_id);

alter table content_items
  add constraint content_items_active_version_fk
  foreign key (active_version_id) references content_versions(id) on delete set null;

-- ---------- Assets (shared across Creative Studio, Brand Guardian, etc.) ----------

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null check (type in ('image', 'logo', 'document', 'video', 'icon', 'template')),
  name text not null,
  storage_path text not null, -- Supabase Storage object path
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Prompt library (versioned, reusable across modules) ----------

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade, -- null = global/system prompt
  type text not null, -- 'SEO' | 'Social' | 'Email' | 'Website' | 'Ads' | 'Strategy'
  name text not null,
  template text not null,
  version int not null default 1,
  created_at timestamptz not null default now()
);

-- ---------- AI usage log (cost visibility, per-org limits) ----------

create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete set null,
  task text not null,
  provider text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cached boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_org on ai_usage(org_id, created_at desc);

-- ---------- Housekeeping: keep updated_at current ----------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists content_items_set_updated_at on content_items;
create trigger content_items_set_updated_at
  before update on content_items
  for each row execute function set_updated_at();

-- ---------- Onboarding bootstrap ----------
-- New users can't insert into organizations/memberships directly under RLS
-- (they don't have a membership yet — chicken-and-egg). This SECURITY
-- DEFINER function does both inserts atomically on the user's behalf,
-- called once from the onboarding flow.

create or replace function create_organization_with_owner(
  org_name text,
  org_slug text,
  org_industry text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name, slug, industry)
  values (org_name, org_slug, org_industry)
  returning id into new_org_id;

  insert into memberships (org_id, user_id, role)
  values (new_org_id, auth.uid(), 'Owner');

  return new_org_id;
end;
$$;

revoke all on function create_organization_with_owner from public;
grant execute on function create_organization_with_owner to authenticated;

-- ---------- CRM + Lead Engine ----------
-- Contacts and deals get their own tables rather than being forced into
-- content_items — they're structured relational records (email, phone,
-- deal value, pipeline stage) rather than generated/editable content with
-- a version history, so the flexible content model doesn't fit here.

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  status text not null default 'lead' check (status in ('lead', 'qualified', 'customer', 'churned')),
  source text,
  tags text[] not null default '{}',
  notes text,
  owner_id uuid references auth.users(id),
  owner_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_org on contacts(org_id);
create index if not exists idx_contacts_status on contacts(org_id, status);

drop trigger if exists contacts_set_updated_at on contacts;
create trigger contacts_set_updated_at
  before update on contacts
  for each row execute function set_updated_at();

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  value numeric not null default 0,
  stage text not null default 'new' check (stage in ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  probability int not null default 20 check (probability between 0 and 100),
  expected_close_date date,
  notes text,
  owner_id uuid references auth.users(id),
  owner_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_deals_org on deals(org_id);
create index if not exists idx_deals_stage on deals(org_id, stage);
create index if not exists idx_deals_contact on deals(contact_id);

drop trigger if exists deals_set_updated_at on deals;
create trigger deals_set_updated_at
  before update on deals
  for each row execute function set_updated_at();

-- ---------- Local Marketing Suite ----------

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  city text,
  region text,
  postal_code text,
  phone text,
  hours text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_locations_org on locations(org_id);

drop trigger if exists locations_set_updated_at on locations;
create trigger locations_set_updated_at
  before update on locations
  for each row execute function set_updated_at();

-- ---------- Paid Ads Manager ----------
-- Campaign records are real CRUD (own table, like contacts/deals/locations).
-- Actual ad performance (impressions, clicks, spend) needs a live Meta/
-- Google/TikTok Ads connection this build doesn't have — that part is a
-- deterministic seeded simulation computed at read time, not stored here.

create table if not exists ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  platform text not null check (platform in ('meta', 'google', 'tiktok')),
  objective text not null check (objective in ('awareness', 'traffic', 'conversions', 'leads')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'ended')),
  budget_daily numeric not null default 20,
  start_date date,
  end_date date,
  target_audience text,
  headline text,
  body text,
  cta text,
  notes text,
  owner_id uuid references auth.users(id),
  owner_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ad_campaigns_org on ad_campaigns(org_id);
create index if not exists idx_ad_campaigns_status on ad_campaigns(org_id, status);

drop trigger if exists ad_campaigns_set_updated_at on ad_campaigns;
create trigger ad_campaigns_set_updated_at
  before update on ad_campaigns
  for each row execute function set_updated_at();

-- ---------- Creative Studio ----------
-- Real, functional design tool: text/shape layers on a canvas, exported to
-- PNG client-side. No AI image generation is wired up here — there's no
-- image-gen API connected in this build, so rather than fake it, this is a
-- genuinely real (if simple) design editor instead of a placeholder.

create table if not exists creative_designs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  canvas_width int not null default 1080,
  canvas_height int not null default 1080,
  layers jsonb not null default '[]'::jsonb,
  thumbnail_data_url text,
  owner_id uuid references auth.users(id),
  owner_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creative_designs_org on creative_designs(org_id);

drop trigger if exists creative_designs_set_updated_at on creative_designs;
create trigger creative_designs_set_updated_at
  before update on creative_designs
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------

alter table organizations enable row level security;
alter table memberships enable row level security;
alter table content_items enable row level security;
alter table content_versions enable row level security;
alter table assets enable row level security;
alter table prompts enable row level security;
alter table ai_usage enable row level security;

create policy "Members can read their org" on organizations
  for select using (id in (select org_id from memberships where user_id = auth.uid()));

create policy "Members can read their own memberships" on memberships
  for select using (user_id = auth.uid());

create policy "Members can read their org's content" on content_items
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));

create policy "Editors+ can write their org's content" on content_items
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));

create policy "Editors+ can update their org's content" on content_items
  for update using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));

create policy "Admins+ can delete their org's content" on content_items
  for delete using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin')));

create policy "Members can read their org's content versions" on content_versions
  for select using (content_id in (select id from content_items where org_id in (select org_id from memberships where user_id = auth.uid())));

create policy "Editors+ can write content versions" on content_versions
  for insert with check (content_id in (select id from content_items where org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor'))));

create policy "Editors+ can update content versions" on content_versions
  for update using (content_id in (select id from content_items where org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor'))));

create policy "Members can read their org's assets" on assets
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));

create policy "Members can read their org's ai_usage" on ai_usage
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));

create policy "Members can log ai_usage for their org" on ai_usage
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid()));

alter table contacts enable row level security;
alter table deals enable row level security;

create policy "Members can read their org's contacts" on contacts
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));
create policy "Editors+ can write their org's contacts" on contacts
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Editors+ can update their org's contacts" on contacts
  for update using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Admins+ can delete their org's contacts" on contacts
  for delete using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin')));

create policy "Members can read their org's deals" on deals
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));
create policy "Editors+ can write their org's deals" on deals
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Editors+ can update their org's deals" on deals
  for update using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Admins+ can delete their org's deals" on deals
  for delete using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin')));

alter table locations enable row level security;

create policy "Members can read their org's locations" on locations
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));
create policy "Editors+ can write their org's locations" on locations
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Editors+ can update their org's locations" on locations
  for update using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Admins+ can delete their org's locations" on locations
  for delete using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin')));

alter table ad_campaigns enable row level security;

create policy "Members can read their org's ad campaigns" on ad_campaigns
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));
create policy "Editors+ can write their org's ad campaigns" on ad_campaigns
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Editors+ can update their org's ad campaigns" on ad_campaigns
  for update using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Admins+ can delete their org's ad campaigns" on ad_campaigns
  for delete using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin')));

alter table creative_designs enable row level security;

create policy "Members can read their org's designs" on creative_designs
  for select using (org_id in (select org_id from memberships where user_id = auth.uid()));
create policy "Editors+ can write their org's designs" on creative_designs
  for insert with check (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Editors+ can update their org's designs" on creative_designs
  for update using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin', 'Editor', 'Contributor')));
create policy "Admins+ can delete their org's designs" on creative_designs
  for delete using (org_id in (select org_id from memberships where user_id = auth.uid() and role in ('Owner', 'Admin')));
