-- =============================================
-- ArtBlog - 메인페이지 갤러리 정렬 컬럼 추가 마이그레이션
-- 운영 중인 DB에 1회 실행
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. display_order 컬럼 추가 (정렬값, 작을수록 앞)
alter table posts
  add column if not exists display_order integer;

-- 2. 기존 데이터 백필
--    created_at DESC 기준으로 1..N 순번 부여 (가장 최근 글이 1)
--    => 마이그레이션 직후 메인페이지 노출 순서는 기존(시간 역순)과 동일하게 유지됨
with ranked as (
  select id, row_number() over (order by created_at desc) as rn
  from posts
)
update posts
set display_order = ranked.rn
from ranked
where posts.id = ranked.id
  and posts.display_order is null;

-- 3. 기본값 + NOT NULL 제약 (이후 신규 insert 안전 장치)
alter table posts
  alter column display_order set default 0;

alter table posts
  alter column display_order set not null;

-- 4. 인덱스 (정렬 쿼리 가속)
create index if not exists posts_display_order_idx
  on posts(display_order);

-- =============================================
-- 확인 쿼리 (실행 후 결과 확인용)
-- =============================================
-- select id, title, created_at, display_order
--   from posts
--   order by display_order asc;
