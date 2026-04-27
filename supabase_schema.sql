-- =============================================
-- ArtBlog - Supabase Database Schema
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. Posts 테이블
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  image_url text,
  image_path text,
  slider_images jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 기존 테이블에 slider_images 컬럼 추가 (이미 운영 중인 경우)
alter table posts
  add column if not exists slider_images jsonb not null default '[]'::jsonb;

-- 기존 테이블에 is_hidden 컬럼 추가 (이미 운영 중인 경우)
alter table posts
  add column if not exists is_hidden boolean not null default false;

-- 기존 테이블에 display_order 컬럼 추가는 supabase_migration_display_order.sql 참고

-- 2. Comments 테이블
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  nickname text not null,
  password_hash text not null,
  content text not null,
  is_deleted boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. Site settings 테이블
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
  add column if not exists contact_email text default 'hello@example.com';

insert into site_settings (id, artist_name, about_title, about_content, contact_email, contact_intro)
values (
  1,
  'Your Name',
  '작업과 생각을 소개하는 공간',
  '<p>이 페이지는 작가 소개와 작업 세계를 보여주는 소개 페이지입니다.</p><p>관리자 화면에서 소개 문구와 문의 수신 이메일을 자유롭게 수정할 수 있습니다.</p>',
  'hello@example.com',
  '의뢰, 협업, 전시 문의는 아래 폼 또는 이메일로 보내주세요.'
)
on conflict (id) do nothing;

-- 4. Storage bucket 생성 (이미지 업로드용)
insert into storage.buckets (id, name, public)
values ('artblog-images', 'artblog-images', true)
on conflict do nothing;

-- 5. RLS (Row Level Security) 정책

-- Posts: 누구나 읽기 가능, 쓰기는 인증된 사용자만
alter table posts enable row level security;

create policy "Read posts (hide private from anon)"
  on posts for select
  using (is_hidden = false or auth.role() = 'authenticated');

create policy "Authenticated users can insert posts"
  on posts for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update posts"
  on posts for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete posts"
  on posts for delete using (auth.role() = 'authenticated');

-- Comments: 누구나 읽기/쓰기, 삭제는 인증된 사용자만
alter table comments enable row level security;

create policy "Anyone can read comments"
  on comments for select using (true);

create policy "Anyone can insert comments"
  on comments for insert with check (true);

create policy "Authenticated users can delete comments"
  on comments for delete using (auth.role() = 'authenticated');

create policy "Comment owner can update (by password check in app)"
  on comments for update using (true);

alter table site_settings enable row level security;

create policy "Anyone can read site settings"
  on site_settings for select using (true);

create policy "Authenticated users can upsert site settings"
  on site_settings for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update site settings"
  on site_settings for update using (auth.role() = 'authenticated');

-- 6. Storage 정책
create policy "Anyone can view images"
  on storage.objects for select
  using (bucket_id = 'artblog-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'artblog-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete images"
  on storage.objects for delete
  using (bucket_id = 'artblog-images' and auth.role() = 'authenticated');
