# 🎨 ArtBlog — 개인 그림 갤러리 블로그

인스타그램 스타일의 개인 그림 업로드 블로그입니다.
관리자 로그인, 다중 이미지(슬라이더) 업로드, HTML 에디터, 게시글별 비공개/비밀번호 보호, 비밀번호 댓글, 작가 소개·문의 페이지를 갖추고 있습니다.

---

## 🛠 기술 스택

| 영역 | 기술 | 비용 |
|------|------|------|
| Frontend | React 18 + Vite 5 | 무료 |
| Routing | react-router-dom v6 | 무료 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) | 무료 (500MB DB) |
| 이미지 스토리지 | Cloudinary (Unsigned Upload) | 무료 (25GB 대역폭/월) |
| 에디터 | TipTap (Bold / Italic / Underline / Link / Image / Align / List) | 무료 |
| 드래그&드롭 정렬 | @dnd-kit | 무료 |
| 아이콘 | lucide-react | 무료 |
| 문의 메일 | EmailJS | 무료 |
| 배포 / 서버리스 / Cron | Vercel (Serverless Functions + Cron Jobs) | 무료 |

> 이미지는 Cloudinary에 업로드되며, Supabase Storage(`artblog-images` 버킷)는 과거 호환을 위해 유지됩니다. 신규 업로드는 Cloudinary를 우선 사용합니다.

---

## ⚡ 로컬 실행 방법

### 1단계 — 의존성 설치

```bash
npm install
```

### 2단계 — Supabase 프로젝트 설정

1. [https://supabase.com](https://supabase.com) 접속 → 무료 계정 생성
2. **New Project** 클릭 → 프로젝트 이름 입력 → DB 비밀번호 설정
3. 프로젝트 생성 완료 후 **SQL Editor** 탭 이동
4. `supabase_schema.sql` 파일 내용을 전체 복사 → **Run** 클릭
5. 이미 운영 중인 DB라면 아래 마이그레이션 SQL도 순서대로 실행:
   - `supabase_migration_display_order.sql` — 갤러리 정렬 순서 컬럼
   - `supabase_migration_is_hidden.sql` — 비공개 게시글 컬럼
   - `supabase_migration_post_password.sql` — 게시글별 비밀번호 보호
   - `supabase_site_settings.sql` — 사이트 설정 테이블
6. **Project Settings > API** 에서 아래 두 값 복사:
   - `Project URL`
   - `anon public` key

### 3단계 — Cloudinary 설정

1. [https://cloudinary.com](https://cloudinary.com) 가입
2. **Settings > Upload > Upload presets** → **Add upload preset**
3. **Signing Mode**: `Unsigned` 으로 설정 → preset 이름 저장
4. **Settings > Account** 에서 `Cloud name` 확인
5. **Settings > API Keys** 에서 `API Key` / `API Secret` 확인 (서버리스 삭제 API용)

### 4단계 — 환경변수 설정

프로젝트 루트에 `.env` 파일 생성 (`.env.example` 참고):

```env
# 클라이언트 (브라우저에 노출됨)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset

# 서버 전용 (Vercel Serverless Functions에서만 사용 — VITE_ prefix 금지)
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4-1단계 — EmailJS 문의 메일 설정

1. [https://www.emailjs.com](https://www.emailjs.com) 에서 계정 생성
2. Email Service 연결
3. Email Template 생성
4. 템플릿 변수에 `name`, `email`, `title`, `message`, `submitted_at`, `contact_email` 사용
5. EmailJS 템플릿의 `To Email` 필드에 `{{contact_email}}` 입력
6. Dashboard에서 `Service ID`, `Template ID`, `Public Key`를 `.env`에 입력

수신 이메일 주소는 관리자 화면의 **사이트 설정**에서 변경하며, 일반 방문자에게는 `/contact` 페이지에서 표시됩니다.

### 5단계 — 관리자 계정 생성

Supabase 대시보드 → **Authentication > Users** 탭 → **Add user** 클릭
이메일과 비밀번호를 입력하여 관리자 계정 생성

### 6단계 — 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속
관리자 로그인: `/admin/login`

> 로컬 환경에서는 Cloudinary **삭제** API(`/api/cloudinary-delete`)가 동작하지 않습니다. 삭제는 Vercel 배포 환경에서만 동작하며, 로컬에서는 업로드만 가능합니다.

---

## 🚀 Vercel 배포

1. [https://vercel.com](https://vercel.com) 가입 (GitHub 연동)
2. 프로젝트를 GitHub에 push
3. Vercel 대시보드 → **New Project** → GitHub 레포 선택
4. **Environment Variables** 섹션에 위 `.env`의 **모든 값** (클라이언트 + 서버 전용) 입력
5. **Deploy** 클릭

### 자동 포함 기능

- **Serverless Functions** (`/api/*`)
  - `POST /api/cloudinary-delete` — 관리자 인증 후 Cloudinary 이미지 일괄 삭제
  - `GET  /api/keep-alive` — Supabase `site_settings` 핑(무료 플랜 일시정지 방지)
- **Cron Jobs** (`vercel.json`)
  - 매주 월요일 00:00 UTC `keep-alive` 자동 호출 → Supabase 프로젝트 비활성 방지
- **SPA Rewrites** (`vercel.json`) — 모든 경로를 `index.html` 로 라우팅

---

## 📁 프로젝트 구조

```
artblog/
├── api/                              # Vercel Serverless Functions
│   ├── cloudinary-delete.js          # Cloudinary 이미지 삭제 (관리자 인증 필요)
│   └── keep-alive.js                 # Supabase 핑 (Cron으로 호출)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── RichEditor.jsx        # TipTap HTML 에디터
│   │   │   ├── RichEditor.module.css
│   │   │   ├── SliderEditor.jsx      # 슬라이더 이미지 다중 업로드/순서 편집
│   │   │   └── SliderEditor.module.css
│   │   ├── common/
│   │   │   ├── Header.jsx            # 공통 헤더
│   │   │   ├── Header.module.css
│   │   │   └── ProtectedRoute.jsx    # 관리자 라우트 보호
│   │   └── public/
│   │       ├── PostCard.jsx          # 그리드 카드
│   │       ├── PostCard.module.css
│   │       ├── PostSlider.jsx        # 게시글 다중 이미지 슬라이더
│   │       ├── PostSlider.module.css
│   │       ├── CommentSection.jsx    # 댓글 (비밀번호 방식)
│   │       └── CommentSection.module.css
│   ├── hooks/
│   │   └── useAuth.jsx               # 인증 Context
│   ├── lib/
│   │   ├── supabase.js               # Supabase 클라이언트
│   │   ├── storage.js                # Cloudinary 업로드 / Storage 삭제 통합
│   │   ├── postCleanup.js            # 게시글 삭제 시 이미지 경로 수집
│   │   ├── siteSettings.js           # 사이트 설정 fetch/save
│   │   └── emailjs.js                # EmailJS 발송 헬퍼
│   ├── pages/
│   │   ├── Home.jsx                  # 갤러리 메인 (/artworks)
│   │   ├── About.jsx                 # 작가 소개 (/about)
│   │   ├── Contact.jsx               # 문의하기 (/contact)
│   │   ├── PostDetail.jsx            # 게시물 상세 (/post/:id)
│   │   ├── AdminLogin.jsx            # 관리자 로그인 (/admin/login)
│   │   ├── AdminDashboard.jsx        # 관리 대시보드 (/admin)
│   │   ├── AdminPostEditor.jsx       # 게시물 작성/수정 (/admin/new, /admin/edit/:id)
│   │   ├── AdminSiteSettings.jsx     # 사이트 설정 (/admin/site-settings)
│   │   └── AdminGalleryOrder.jsx     # 갤러리 순서 변경 (/admin/gallery-order)
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── supabase_schema.sql               # DB 초기화 SQL (전체 스키마)
├── supabase_migration_display_order.sql
├── supabase_migration_is_hidden.sql
├── supabase_migration_post_password.sql
├── supabase_site_settings.sql
├── vercel.json                       # SPA rewrites + Cron 설정
├── .env.example
└── package.json
```

---

## 🔑 기능 요약

| 기능 | 설명 |
|------|------|
| 갤러리 뷰 | 인스타그램 스타일 그리드 (`/artworks`) |
| 작가 소개 | 관리자가 편집 가능한 About 페이지 |
| 문의하기 | EmailJS 기반 컨택트 폼 (수신 메일 주소는 관리자 설정) |
| 게시물 상세 | 단일/다중(슬라이더) 이미지 + HTML 컨텐츠 + 댓글 |
| 관리자 로그인 | Supabase Auth (이메일/비밀번호) |
| 이미지 업로드 | Cloudinary Unsigned Upload (자동 최적화 `f_auto,q_auto`) |
| HTML 에디터 | TipTap (Bold, Italic, Underline, 정렬, 링크, 이미지, 목록 등) |
| 슬라이더 게시물 | 여러 장의 이미지를 순서대로 업로드/편집 |
| 비공개 게시글 | `is_hidden` — 비로그인 방문자에게 노출되지 않음 (RLS) |
| 게시글별 비밀번호 | 게시물 단위로 비밀번호 설정, `verify_post_password` RPC로 검증 |
| 갤러리 순서 변경 | `@dnd-kit` 드래그&드롭으로 노출 순서 편집 |
| 댓글 | 비로그인 사용자 닉네임+비밀번호로 작성/삭제 |
| 댓글 관리 | 관리자는 모든 댓글 즉시 삭제 가능 |
| 사이트 설정 | 작가명, About 본문, 문의 수신 메일, 인트로 문구 편집 |
| 이미지 정리 | 게시글 삭제 시 본문/슬라이더/대표 이미지의 Cloudinary 리소스 자동 삭제 |
| Supabase 깨우기 | 매주 1회 Vercel Cron이 `/api/keep-alive` 호출 → 무료 플랜 자동 일시정지 방지 |

---

## 🗄 데이터베이스 개요

| 테이블 | 용도 |
|--------|------|
| `posts` | 게시글 (제목, 본문 HTML, 대표 이미지, 슬라이더 이미지 JSONB, 노출 순서, 비공개 여부, 비밀번호 여부) |
| `post_passwords` | 게시글별 평문 비밀번호 (관리자만 조회/변경, RPC로 검증) |
| `comments` | 닉네임 + 비밀번호 해시 + 본문 |
| `site_settings` | 단일 row(`id=1`)로 작가명/소개/문의 메일 등 보관 |
| `storage.buckets / artblog-images` | (구버전 호환용) Supabase Storage 이미지 버킷 |

RLS 정책 요약:
- `posts` 읽기: `is_hidden=false` 이거나 인증된 사용자만
- 쓰기/수정/삭제: 인증된 사용자만
- `comments` 읽기/쓰기: 누구나, 삭제: 인증된 사용자만
- `post_passwords`: 인증된 사용자만 조회/변경, 비공개 검증은 `verify_post_password(uuid, text)` SECURITY DEFINER 함수로 anon에게도 노출

---

## 🔧 커스터마이징

### 블로그 이름 변경
- 관리자 로그인 → **사이트 설정** 에서 작가명/소개/문의 메일을 직접 편집
- 정적 변경이 필요하면:
  - `src/components/common/Header.jsx`
  - `index.html` → `<title>`

### 색상 테마 / 폰트 변경
`src/styles/global.css` 의 `:root` 변수 수정:
```css
--accent: #c9a84c;  /* 포인트 색상 */
--bg: #0e0e0e;      /* 배경색 */
```

폰트는 `index.html` 의 Google Fonts (`Fraunces`, `Instrument Serif`, `Noto Serif KR`, `Noto Sans KR`, `IBM Plex Mono`) 로 로드됩니다.

### 커스텀 도메인 연결
Vercel 대시보드 → 프로젝트 → **Domains** → 도메인 추가

### Keep-Alive 주기 변경
`vercel.json` 의 `crons[].schedule` (cron 표현식) 수정. 기본값은 매주 월요일 00:00 UTC.
