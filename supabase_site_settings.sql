-- =============================================
-- ArtBlog - Site Settings only
-- posts/comments가 이미 있는 프로젝트에서 실행하세요
-- =============================================

create table if not exists site_settings (
  id integer primary key,
  artist_name text default 'Your Name',
  about_title text default '작업과 생각을 소개하는 공간',
  about_content text,
  contact_email text default 'hello@example.com',
  contact_intro text default '의뢰, 협업, 전시 문의는 아래 폼 또는 이메일로 보내주세요.',
  updated_at timestamp with time zone default now()
);

alter table site_settings
  add column if not exists artist_name text default 'Your Name';

alter table site_settings
  add column if not exists about_title text default '작업과 생각을 소개하는 공간';

alter table site_settings
  add column if not exists about_content text;

alter table site_settings
  add column if not exists contact_email text default 'hello@example.com';

alter table site_settings
  add column if not exists contact_intro text default '의뢰, 협업, 전시 문의는 아래 폼 또는 이메일로 보내주세요.';

alter table site_settings
  add column if not exists updated_at timestamp with time zone default now();

insert into site_settings (id, artist_name, about_title, about_content, contact_email, contact_intro)
values (
  1,
  'Your Name',
  '작업과 생각을 소개하는 공간',
  '<p>이 페이지는 작가 소개와 작업 세계를 보여주는 소개 페이지입니다.</p><p>관리자 화면에서 소개 문구와 문의 수신 이메일을 자유롭게 수정할 수 있습니다.</p>',
  'hello@example.com',
  '의뢰, 협업, 전시 문의는 아래 폼 또는 이메일로 보내주세요.'
)
on conflict (id) do update
set
  artist_name = coalesce(site_settings.artist_name, excluded.artist_name),
  about_title = coalesce(site_settings.about_title, excluded.about_title),
  about_content = coalesce(site_settings.about_content, excluded.about_content),
  contact_email = coalesce(site_settings.contact_email, excluded.contact_email),
  contact_intro = coalesce(site_settings.contact_intro, excluded.contact_intro);

alter table site_settings enable row level security;

drop policy if exists "Anyone can read site settings" on site_settings;
create policy "Anyone can read site settings"
  on site_settings for select using (true);

drop policy if exists "Authenticated users can upsert site settings" on site_settings;
create policy "Authenticated users can upsert site settings"
  on site_settings for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update site settings" on site_settings;
create policy "Authenticated users can update site settings"
  on site_settings for update using (auth.role() = 'authenticated');
