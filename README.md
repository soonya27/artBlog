# 🎨 ArtBlog — 개인 그림 갤러리 블로그

인스타그램 스타일의 개인 그림 업로드 블로그입니다.  
관리자 로그인, 이미지 업로드, HTML 에디터, 비밀번호 댓글 기능을 갖추고 있습니다.

---

## 🛠 기술 스택

| 영역 | 기술 | 비용 |
|------|------|------|
| Frontend | React + Vite | 무료 |
| Backend/DB | Supabase (PostgreSQL) | 무료 (500MB DB, 1GB Storage) |
| 배포 | Vercel 또는 Netlify | 무료 |
| 에디터 | TipTap (오픈소스) | 무료 |

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
5. **Project Settings > API** 에서 아래 두 값 복사:
   - `Project URL`
   - `anon public` key

### 3단계 — 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3-1단계 — EmailJS 문의 메일 설정

1. [https://www.emailjs.com](https://www.emailjs.com) 에서 계정 생성
2. Email Service 연결
3. Email Template 생성
4. 템플릿 변수에 `name`, `email`, `title`, `message`, `submitted_at`, `contact_email` 사용
5. EmailJS 템플릿의 `To Email` 필드에 `{{contact_email}}` 입력
6. Dashboard에서 `Service ID`, `Template ID`, `Public Key`를 `.env`에 입력

수신 이메일 주소는 관리자 화면의 사이트 설정에서 변경하며, 일반 방문자에게는 `contact` 페이지에서 표시만 됩니다.

### 4단계 — 관리자 계정 생성

Supabase 대시보드 → **Authentication > Users** 탭 → **Add user** 클릭  
이메일과 비밀번호를 입력하여 관리자 계정 생성

### 5단계 — 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속  
관리자 로그인: `/admin/login`

---

## 🚀 무료 배포 방법

### Vercel 배포 (권장)

1. [https://vercel.com](https://vercel.com) 가입 (GitHub 연동)
2. 프로젝트를 GitHub에 push
3. Vercel 대시보드 → **New Project** → GitHub 레포 선택
4. **Environment Variables** 섹션에 `.env` 값 입력:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy** 클릭 → 완료! 🎉

### Netlify 배포

1. [https://netlify.com](https://netlify.com) 가입
2. **Add new site > Import from Git** 선택
3. Build command: `npm run build`
4. Publish directory: `dist`
5. **Environment variables** 에 위 두 값 입력
6. Deploy!

---

## 📁 프로젝트 구조

```
artblog/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── RichEditor.jsx     # TipTap HTML 에디터
│   │   │   └── RichEditor.module.css
│   │   ├── common/
│   │   │   ├── Header.jsx         # 공통 헤더
│   │   │   ├── Header.module.css
│   │   │   └── ProtectedRoute.jsx # 관리자 라우트 보호
│   │   └── public/
│   │       ├── PostCard.jsx       # 그리드 카드
│   │       ├── PostCard.module.css
│   │       ├── CommentSection.jsx # 댓글 (비밀번호 방식)
│   │       └── CommentSection.module.css
│   ├── hooks/
│   │   └── useAuth.jsx            # 인증 Context
│   ├── lib/
│   │   └── supabase.js            # Supabase 클라이언트
│   ├── pages/
│   │   ├── Home.jsx               # 갤러리 메인
│   │   ├── PostDetail.jsx         # 게시물 상세
│   │   ├── AdminLogin.jsx         # 관리자 로그인
│   │   ├── AdminDashboard.jsx     # 관리 대시보드
│   │   └── AdminPostEditor.jsx    # 게시물 작성/수정
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── supabase_schema.sql            # DB 초기화 SQL
├── .env.example
└── package.json
```

---

## 🔑 기능 요약

| 기능 | 설명 |
|------|------|
| 갤러리 뷰 | 인스타그램 3열 그리드 |
| 게시물 상세 | 이미지 + HTML 컨텐츠 + 댓글 |
| 관리자 로그인 | Supabase Auth (이메일/비밀번호) |
| 이미지 업로드 | Supabase Storage (최대 10MB) |
| HTML 에디터 | TipTap (Bold, Italic, 정렬, 링크, 목록 등) |
| 댓글 | 비로그인 사용자 닉네임+비밀번호로 작성/삭제 |
| 댓글 관리 | 관리자는 모든 댓글 즉시 삭제 가능 |

---

## 🔧 커스터마이징

### 블로그 이름 변경
- `src/components/common/Header.jsx` → `logoText` 변경
- `src/pages/Home.jsx` → `profileName`, `profileBio` 변경
- `index.html` → `<title>` 변경

### 색상 테마 변경
`src/styles/global.css` 의 `:root` 변수 수정:
```css
--accent: #c9a84c;  /* 포인트 색상 */
--bg: #0e0e0e;      /* 배경색 */
```

### 커스텀 도메인 연결
Vercel 대시보드 → 프로젝트 → **Domains** → 도메인 추가
