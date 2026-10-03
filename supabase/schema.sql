-- SUNNAKHON GROUP — Supabase schema
-- วิธีใช้: Supabase Dashboard > SQL Editor > วางทั้งไฟล์แล้วกด Run (รันซ้ำได้)
-- แก้อีเมลแอดมินคนแรกที่บรรทัด "insert into public.admins" ก่อนรัน

create extension if not exists "pgcrypto";

-- ───────── admins (อีเมลที่ได้สิทธิ์เข้าหลังบ้าน) ─────────
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ───────── helper: updated_at ─────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ───────── site_settings (แถวเดียว id = 1) ─────────
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'SUNNAKHON GROUP',
  hero_eyebrow text not null default '#teamsunnakhon',
  hero_title text not null default 'จัด Event, Live Commerce และ Production ครบวงจร จบในที่เดียว',
  hero_subtitle text not null default 'เนรมิตงานประกวด คอนเสิร์ต งานนักศึกษา และไลฟ์สดขายสินค้าให้ปัง พร้อมบริการวิดีโอโปรดักชัน ตัดต่อ และออกแบบกราฟิก/Motion Graphics ทุกรูปแบบ การันตีผลงานด้วยประสบการณ์กว่า 4 ปี',
  hero_image_url text,
  hero_image_public_id text,
  why_title text not null default 'ทำไมต้อง #teamsunnakhon',
  why_text text not null default '"เพราะความต้องการของคุณ #teamsunnakhon ทำได้ทุกอย่าง" เราไม่ใช่แค่ออแกไนเซอร์ แต่เราคือ ''พาร์ทเนอร์'' ที่พร้อมเนรมิตทุกไอเดียของคุณให้เกิดขึ้นจริง ด้วยประสบการณ์ 4 ปี เราเข้าใจทุกมิติของการจัดงาน ทั้งอีเวนต์ออฟไลน์ ไลฟ์สด วิดีโอโปรดักชัน และงานออกแบบ... ให้เราดูแลจบ ครบในที่เดียว',
  stats jsonb not null default '[{"value":"4+","label":"ปีประสบการณ์"}]'::jsonb,
  cta_title text not null default 'พร้อมให้เราเนรมิตงานของคุณหรือยัง?',
  cta_text text not null default 'ทักมาคุยไอเดียกับทีมงานได้เลย ปรึกษาฟรี',
  phone text not null default '08-3974-4566',
  email text,
  line_id text not null default '@sunnakhon.org',
  line_url text,
  facebook_url text not null default 'https://www.facebook.com/sunnakhon.46/',
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  address text,
  map_url text,
  seo_title text not null default 'SUNNAKHON GROUP | Event, Live Commerce & Production ครบวงจร',
  seo_description text not null default 'รับจัดงานประกวด คอนเสิร์ต งานนักศึกษา ไลฟ์สดขายสินค้า วิดีโอโปรดักชัน และกราฟิก/Motion Graphics ประสบการณ์กว่า 4 ปี',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ───────── services (บริการของเรา) ─────────
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  icon text not null default 'sparkles',   -- ชื่อไอคอน lucide
  cover_url text,
  cover_public_id text,
  features text[] not null default '{}',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── posts (ผลงานของเรา / โพสต์) ─────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'work' check (kind in ('work','article')), -- work = ผลงาน, article = บทความ
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,                              -- markdown
  cover_url text,
  cover_public_id text,
  gallery jsonb not null default '[]'::jsonb, -- [{url, public_id}]
  video_url text,
  category text not null default 'event',    -- event | live-commerce | video | graphic | other
  client_name text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- สำหรับฐานข้อมูลที่สร้างตารางไว้ก่อนมีคอลัมน์ kind
alter table public.posts add column if not exists kind text not null default 'work';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'posts_kind_check') then
    alter table public.posts add constraint posts_kind_check check (kind in ('work','article'));
  end if;
end $$;
create index if not exists posts_pub_idx on public.posts (published, published_at desc);
create index if not exists posts_kind_idx on public.posts (kind, published, published_at desc);

-- ───────── clients (ลูกค้าที่เคยร่วมงาน / โลโก้วิ่ง) ─────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  logo_public_id text,
  website_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────── packages (แพ็กเกจ/ราคา) ─────────
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_text text not null default 'สอบถามราคา',
  price_note text,
  description text,
  features text[] not null default '{}',
  highlight boolean not null default false,
  cta_label text not null default 'ติดต่อเรา',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── testimonials (เสียงจากลูกค้า) ─────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  content text not null,
  avatar_url text,
  avatar_public_id text,
  rating int not null default 5 check (rating between 1 and 5),
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────── inquiries (ข้อความจากฟอร์มติดต่อ) ─────────
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  service text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','done')),
  created_at timestamptz not null default now()
);

-- triggers updated_at
do $$
declare t text;
begin
  foreach t in array array['site_settings','services','posts','packages'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ───────── Row Level Security ─────────
alter table public.admins        enable row level security;
alter table public.site_settings enable row level security;
alter table public.services      enable row level security;
alter table public.posts         enable row level security;
alter table public.clients       enable row level security;
alter table public.packages      enable row level security;
alter table public.testimonials  enable row level security;
alter table public.inquiries     enable row level security;

-- admins: เฉพาะแอดมินเท่านั้น
drop policy if exists admins_all on public.admins;
create policy admins_all on public.admins for all using (public.is_admin()) with check (public.is_admin());

-- site_settings: ทุกคนอ่านได้ / แอดมินแก้ได้
drop policy if exists settings_read on public.site_settings;
drop policy if exists settings_write on public.site_settings;
create policy settings_read  on public.site_settings for select using (true);
create policy settings_write on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ตารางเนื้อหา: อ่านได้เฉพาะที่ published (แอดมินอ่านได้ทั้งหมด) / แอดมินเขียนได้
do $$
declare t text;
begin
  foreach t in array array['services','posts','clients','packages','testimonials'] loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select using (published or public.is_admin())', t);
    execute format('create policy %1$s_write on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- inquiries: ใครก็ส่งฟอร์มได้ / แอดมินเท่านั้นที่อ่าน-แก้-ลบ
drop policy if exists inquiries_insert on public.inquiries;
drop policy if exists inquiries_admin on public.inquiries;
create policy inquiries_insert on public.inquiries for insert with check (
  length(name) between 1 and 200 and length(message) between 1 and 5000
);
create policy inquiries_admin on public.inquiries for all using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.services, public.posts, public.clients, public.packages, public.testimonials to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant all on all tables in schema public to authenticated;

-- ───────── Seed ─────────
-- ⚠️ เพิ่มแอดมินคนแรก: เอา -- หน้าบรรทัดล่างออก แล้วเปลี่ยนเป็นอีเมล Google ของคุณ (หรือรันบรรทัดนี้แยกต่างหากทีหลังก็ได้)
-- insert into public.admins (email) values ('your-email@gmail.com') on conflict do nothing;

insert into public.services (slug, title, subtitle, description, icon, features, sort_order) values
 ('event-organizer', 'Event Organizer', 'รับจัดงานอีเวนต์ครบวงจร',
  'เนรมิตงานให้ปังทุกสเกล! ทั้งงานประกวดนางงาม คอนเสิร์ต และงานนักศึกษา พร้อมบริการจัดหา Supplier และดีลสปอนเซอร์ให้แบบเบ็ดเสร็จ',
  'mic', array['งานประกวดนางงาม','คอนเสิร์ต','งานนักศึกษา','จัดหา Supplier','ดีลสปอนเซอร์'], 1),
 ('live-commerce', 'Live Commerce', 'ไลฟ์สดขายสินค้า',
  'เปลี่ยนผู้ชมให้เป็นผู้ซื้อ! บริการไลฟ์สดแบบเรียลไทม์ ผสานความบันเทิงเข้ากับการขายออนไลน์ ดึงดูดสายตาและดันยอดขายให้พุ่งกระฉูด',
  'smartphone', array['ไลฟ์สดแบบเรียลไทม์','ผสานความบันเทิงกับการขาย','ดันยอดขายออนไลน์'], 2),
 ('video-production', 'Video Production', 'โปรดักชันและตัดต่อวิดีโอ',
  'สร้างสรรค์งานวิดีโอคุณภาพสูง รับถ่ายทำและตัดต่อวิดีโอทุกรูปแบบ เล่าเรื่องราวของคุณให้น่าสนใจและดูเป็นมืออาชีพ',
  'clapperboard', array['ถ่ายทำวิดีโอ','ตัดต่อวิดีโอ','เล่าเรื่องแบบมืออาชีพ'], 3),
 ('graphic-motion-design', 'Graphic & Motion Design', 'ออกแบบกราฟิก',
  'สะกดทุกสายตาด้วยงานดีไซน์ รับออกแบบกราฟิกทุกชนิด รวมถึง Motion Graphics ภาพเคลื่อนไหวสุดล้ำ ที่จะทำให้แบรนด์ของคุณโดดเด่น',
  'palette', array['ออกแบบกราฟิกทุกชนิด','Motion Graphics','Brand Identity'], 4)
on conflict (slug) do nothing;

insert into public.packages (name, price_text, price_note, description, features, highlight, sort_order)
select * from (values
 ('Event Package', 'สอบถามราคา', 'ตามขนาดและรูปแบบงาน', 'จัดงานครบวงจรตั้งแต่คอนเซ็ปต์ถึงวันงานจริง', array['วางคอนเซ็ปต์และแผนงาน','จัดหา Supplier และสถานที่','ทีมงานดูแลหน้างาน'], false, 1),
 ('Live Commerce Package', 'สอบถามราคา', 'รายเดือน / รายครั้ง', 'ทีมไลฟ์สดพร้อมสตูดิโอและอุปกรณ์', array['พิธีกร/แอดมินไลฟ์','อุปกรณ์และสตูดิโอ','รายงานสรุปผล'], true, 2),
 ('Production Package', 'สอบถามราคา', 'ตามจำนวนชิ้นงาน', 'ถ่ายทำ ตัดต่อ และออกแบบกราฟิก/Motion', array['ถ่ายทำและตัดต่อวิดีโอ','กราฟิกและ Motion Graphics','แก้ไขงานตามตกลง'], false, 3)
) as v(name, price_text, price_note, description, features, highlight, sort_order)
where not exists (select 1 from public.packages);
