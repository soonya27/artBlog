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
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

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

-- 3. Storage bucket 생성 (이미지 업로드용)
insert into storage.buckets (id, name, public)
values ('artblog-images', 'artblog-images', true)
on conflict do nothing;

-- 4. RLS (Row Level Security) 정책

-- Posts: 누구나 읽기 가능, 쓰기는 인증된 사용자만
alter table posts enable row level security;

create policy "Anyone can read posts"
  on posts for select using (true);

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

-- 5. Storage 정책
create policy "Anyone can view images"
  on storage.objects for select
  using (bucket_id = 'artblog-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'artblog-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete images"
  on storage.objects for delete
  using (bucket_id = 'artblog-images' and auth.role() = 'authenticated');
