-- =============================================
-- ArtBlog - 비밀글(비노출) 컬럼 추가 마이그레이션
-- 운영 중인 DB에 1회 실행
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. is_hidden 컬럼 추가 (true면 비공개)
alter table posts
  add column if not exists is_hidden boolean not null default false;

-- 2. RLS 정책 갱신: 비공개 글은 인증된 사용자(관리자)만 조회 가능
drop policy if exists "Anyone can read posts" on posts;

create policy "Read posts (hide private from anon)"
  on posts for select
  using (is_hidden = false or auth.role() = 'authenticated');
