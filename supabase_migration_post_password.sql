-- =============================================
-- ArtBlog - 게시글별 비밀번호 마이그레이션
-- 운영 중인 DB에 1회 실행
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. 게시글별 비밀번호를 보관하는 별도 테이블
--    (관리자만 평문을 직접 조회할 수 있도록 RLS로 분리)
create table if not exists post_passwords (
  post_id uuid primary key references posts(id) on delete cascade,
  password text not null,
  updated_at timestamp with time zone default now()
);

alter table post_passwords enable row level security;

drop policy if exists "Authenticated can read post passwords" on post_passwords;
create policy "Authenticated can read post passwords"
  on post_passwords for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can insert post passwords" on post_passwords;
create policy "Authenticated can insert post passwords"
  on post_passwords for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update post passwords" on post_passwords;
create policy "Authenticated can update post passwords"
  on post_passwords for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete post passwords" on post_passwords;
create policy "Authenticated can delete post passwords"
  on post_passwords for delete using (auth.role() = 'authenticated');

-- 2. 목록에 좌물쇠 아이콘 노출용 플래그 (anon에도 공개)
alter table posts
  add column if not exists has_password boolean not null default false;

-- 3. post_passwords 변경에 따라 posts.has_password 자동 동기화
create or replace function sync_post_has_password()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'DELETE') then
    update posts set has_password = false where id = OLD.post_id;
    return OLD;
  else
    update posts
    set has_password = (NEW.password is not null and length(btrim(NEW.password)) > 0)
    where id = NEW.post_id;
    return NEW;
  end if;
end;
$$;

drop trigger if exists trg_sync_post_has_password on post_passwords;
create trigger trg_sync_post_has_password
  after insert or update or delete on post_passwords
  for each row execute function sync_post_has_password();

-- 기존 데이터 백필
update posts p
set has_password = exists(
  select 1 from post_passwords pp
  where pp.post_id = p.id
    and pp.password is not null
    and length(btrim(pp.password)) > 0
);

-- 4. 비밀번호 검증용 RPC (SECURITY DEFINER로 RLS 우회하여 검증만 수행)
create or replace function verify_post_password(p_post_id uuid, p_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from post_passwords
    where post_id = p_post_id
      and password = p_password
  );
$$;

grant execute on function verify_post_password(uuid, text) to anon, authenticated;
