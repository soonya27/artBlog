# 이관 TodoList

## 1. 소스코드 & 저장소
- [ ] GitHub 저장소 소유권 이전 (Settings → Transfer ownership) 또는 외부업체 계정을 Collaborator로 추가
- [ ] `.env` 파일을 별도 보안 채널(이메일 암호화, 1Password 등)로 전달 — 절대 저장소에 커밋 금지
- [ ] `node_modules` 제외, `npm install` 환경 세팅 가이드 전달

---

## 2. Supabase
- [ ] **프로젝트 소유권 이전**: Supabase 대시보드 → Settings → General → Transfer project
  - 이전 불가 시: 외부업체가 새 프로젝트 생성 후 데이터 마이그레이션
- [ ] 외부업체 계정을 Organization member로 초대 (Owner 권한)
- [ ] **전달 항목**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - Service Role Key (서버사이드 작업 필요 시)
- [ ] RLS(Row Level Security) 정책 설명 문서화 ← 아래 상세 참고
- [ ] Storage 버킷(`artblog-images`) 정책 설명 ← 아래 상세 참고
- [ ] 현재 Admin 계정 이메일/비밀번호 전달 (또는 새 계정 생성 후 전달)
- [ ] DB 백업 1회 수행 후 전달 (Supabase → Database → Backups) ← 아래 상세 참고

---

## [상세] RLS (Row Level Security) 정책

RLS는 테이블별로 "누가 어떤 행을 읽고 쓸 수 있는지"를 제어하는 Supabase 보안 규칙입니다.
외부업체가 스키마를 재생성하거나 수정할 때 이 정책이 없으면 데이터가 외부에 전부 노출되거나 아무것도 동작하지 않습니다.

### posts 테이블
| 동작 | 허용 대상 | 설명 |
|------|----------|------|
| SELECT (읽기) | 누구나 | 비로그인 방문자도 게시물 목록/상세 조회 가능 |
| INSERT (작성) | 인증된 사용자만 | 관리자 로그인 후에만 게시물 생성 가능 |
| UPDATE (수정) | 인증된 사용자만 | 관리자 로그인 후에만 게시물 수정 가능 |
| DELETE (삭제) | 인증된 사용자만 | 관리자 로그인 후에만 게시물 삭제 가능 |

### comments 테이블
| 동작 | 허용 대상 | 설명 |
|------|----------|------|
| SELECT (읽기) | 누구나 | 비로그인 방문자도 댓글 조회 가능 |
| INSERT (작성) | 누구나 | 비로그인 방문자도 댓글 작성 가능 (닉네임+비밀번호 방식) |
| UPDATE (수정) | 누구나(앱에서 비밀번호 검증) | 비밀번호 일치 여부는 앱 코드에서 처리, DB단은 열어둠 |
| DELETE (삭제) | 인증된 사용자만 | 관리자만 댓글 강제 삭제 가능 |

### site_settings 테이블
| 동작 | 허용 대상 | 설명 |
|------|----------|------|
| SELECT (읽기) | 누구나 | 사이트 이름, About/Contact 내용 등 공개 데이터 |
| INSERT / UPDATE | 인증된 사용자만 | `/admin/site-settings` 페이지에서만 수정 가능 |

> **이관 시 주의**: 외부업체가 새 Supabase 프로젝트를 만들 경우 `supabase_schema.sql`을 SQL Editor에서 실행하면 테이블과 RLS 정책이 한 번에 생성됩니다.

---

## [상세] Storage 버킷 (`artblog-images`) 정책

게시물 이미지 파일이 저장되는 버킷입니다. 버킷은 **public(공개)** 으로 설정되어 있어 URL만 알면 누구나 이미지를 볼 수 있습니다.

### 정책 현황
| 동작 | 허용 대상 | 설명 |
|------|----------|------|
| SELECT (이미지 보기) | 누구나 | 게시물 이미지 URL로 직접 접근 가능 |
| INSERT (업로드) | 인증된 사용자만 | 관리자 로그인 후 게시물 작성/수정 시에만 업로드 가능 |
| DELETE (삭제) | 인증된 사용자만 | 게시물 삭제 시 연결된 이미지 파일도 함께 삭제 |

### 이관 시 확인 사항
- Supabase 대시보드 → Storage → `artblog-images` 버킷 존재 여부 확인
- 버킷이 없으면 `supabase_schema.sql` 실행 시 자동 생성됨
- 기존 이미지 파일은 버킷째로 이전되지 않으므로, 게시물의 `image_url` / `image_path` 컬럼 값을 참고해 파일을 수동으로 옮기거나 재업로드 필요

---

## [상세] DB 백업 및 전달

### 백업 방법 (2가지)

**방법 A — Supabase 대시보드 (간편)**
1. Supabase 프로젝트 → Database → Backups
2. 최신 백업 선택 → Download
3. `.sql` 파일로 다운로드됨 → 외부업체에 전달
> ⚠️ 무료 플랜(Free tier)은 매일 1회 자동 백업, 보관 기간 7일

**방법 B — pg_dump (완전한 백업)**
```bash
pg_dump "postgresql://postgres:[DB_PASSWORD]@[HOST]:5432/postgres" \
  --clean --no-owner --no-privileges \
  -f artblog_backup.sql
```
- 접속 정보: Supabase → Settings → Database → Connection string

### 외부업체 복원 방법
```bash
psql "postgresql://postgres:[NEW_DB_PASSWORD]@[NEW_HOST]:5432/postgres" \
  < artblog_backup.sql
```
또는 새 Supabase 프로젝트에서 SQL Editor → `artblog_backup.sql` 내용 붙여넣기 실행

### 백업에 포함되는 데이터
| 항목 | 포함 여부 |
|------|----------|
| posts (게시물 목록, 제목, 내용) | ✅ 포함 |
| comments (댓글) | ✅ 포함 |
| site_settings (사이트 설정) | ✅ 포함 |
| 이미지 파일 (Storage) | ❌ 미포함 — Storage는 별도 다운로드 필요 |

> **이미지 별도 백업**: Supabase Storage는 DB 백업에 포함되지 않습니다. 게시물 수가 많다면 Storage → `artblog-images` → 파일 전체 다운로드 후 새 버킷에 업로드해야 합니다.

---

## 3. EmailJS
- [ ] 외부업체 계정으로 EmailJS 재가입 후 Service/Template 재생성 권장
  - 또는 현재 계정 이메일/비밀번호 전달
- [ ] **전달 항목**:
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`
- [ ] 연결된 이메일 서비스(Gmail 등) 계정 연동 정보 전달
- [ ] 월 발송량 한도 플랜 확인 (무료 200건/월)

---

## 4. 호스팅 / 배포
- [ ] 현재 배포 플랫폼 확인 후 이전
  - Vercel / Netlify / GitHub Pages 등 → 외부업체 계정으로 재배포 또는 소유권 이전
- [ ] 환경변수(`.env`) 배포 플랫폼에 재등록
- [ ] 도메인 연결 정보 이전 (DNS 설정, 네임서버)

---

## 5. 도메인
- [ ] 도메인 등록 대행사(가비아, Cloudflare 등) 계정 이전 또는 도메인 이관
- [ ] DNS A레코드 / CNAME 설정 정보 전달
- [ ] SSL 인증서 자동 갱신 여부 확인 (Vercel/Netlify는 자동)

---

## 6. 인수인계 문서
- [ ] 사용 중인 서비스 목록 및 각 계정 정보 정리
- [ ] 환경변수 설명서 (`.env.example` 기반으로 각 키의 용도 설명)
- [ ] Admin 로그인 방법 안내 (`/admin-login` 경로)
- [ ] 게시물 작성/수정/삭제 사용법
- [ ] 사이트 설정 변경 방법 (`/admin/site-settings`)
- [ ] 이미지 업로드 용량 제한 안내

---

## 7. 이관 후 확인 사항
- [ ] 외부업체 환경에서 빌드 성공 확인 (`npm run build`)
- [ ] 게시물 CRUD 동작 확인
- [ ] 이미지 업로드/삭제 동작 확인 (Supabase Storage)
- [ ] Contact 폼 이메일 발송 확인 (EmailJS)
- [ ] Admin 로그인/로그아웃 확인
- [ ] 기존 계정(이전 개발자 계정) Supabase/EmailJS에서 멤버 제거
