# 🎨 ArtBlog - 빠른 시작 가이드

## 필수 사항
- Node.js 16+ (npm 포함)
- Supabase 무료 계정

---

## 🚀 3단계 시작하기

### 1️⃣ Supabase 설정 (3분)

**① Supabase 프로젝트 생성**
- https://supabase.com 접속 → 회원가입
- "New Project" 클릭
- 프로젝트 이름 입력 & DB 비밀번호 설정
- 프로젝트 생성 완료 (약 1분)

**② DB 초기화**
- Supabase Dashboard 보기
- SQL Editor 탭 이동
- `supabase_schema.sql` 파일 전체 복사
- SQL Editor에 붙여넣기 → "Run" 클릭

**③ API 키 복사**
- Project Settings > API 탭
- 아래 두 값 복사 (메모장에):
  ```
  Project URL: https://xxxxx.supabase.co
  anon public key: eyJhbGc...
  ```

### 2️⃣ 로컬 환경 설정 (1분)

**① .env 파일 생성**

프로젝트 루트에서:
```bash
cp .env.example .env
```

**② .env 파일 수정**

텍스트 에디터로 `.env` 파일 열기:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # 위에서 복사한 URL
VITE_SUPABASE_ANON_KEY=eyJhbGc...          # 위에서 복사한 key
```

**③ 관리자 계정 생성**

Supabase Dashboard:
- Authentication > Users 탭
- Add user 클릭
- 이메일 & 비밀번호 입력 (관리자 로그인용)
- 생성

### 3️⃣ 로컬에서 실행 (1분)

```bash
# ① 의존성 설치
npm install

# ② 개발 서버 시작
npm run dev
```

🎉 완료! 브라우저에서 `http://localhost:5173` 접속

**관리자 로그인**: `/admin/login`에서 위에서 생성한 이메일/비밀번호 입력

---

## 📦 배포하기 (무료)

### Vercel 배포 (권장)

```bash
# 1. GitHub에 push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR/repo.git
git push -u origin main

# 2. https://vercel.com 접속
# 3. "New Project" → GitHub repo 선택
# 4. Environment Variables 추가:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
# 5. Deploy 클릭
```

배포 완료! 자동으로 URL 제공됨

---

## 🔧 기본 사용법

### 갤러리 편집
1. `/admin/login` → 로그인
2. "새 게시물" 클릭
3. 제목 + 이미지 + 설명 입력
4. 게시하기

### 댓글 관리
- 비로그인 사용자: 닉네임+비밀번호로 댓글 작성
- 관리자: 모든 댓글 즉시 삭제 가능

---

## 🎨 커스터마이징

### 블로그 이름
- `src/components/common/Header.jsx` → `logoText` 수정

### 색상 테마
- `src/styles/global.css` → `:root` 변수 수정

### 프로필 정보
- `src/pages/Home.jsx` → 제목/설명 수정

---

## 💬 문제 해결

**"환경변수 오류"**
- .env 파일이 있는지 확인
- 값이 올바르게 입력되었는지 확인
- 개발 서버 재시작

**"이미지 업로드 실패"**
- Supabase Storage 버킷이 생성되었는지 확인
- 스토리지 > buckets > `artblog-images` 확인

**"로그인 안 됨"**
- Supabase 관리자 계정 생성 확인
- 이메일/비밀번호 정확히 입력

---

## 📖 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [React Router 문서](https://reactrouter.com)
- [Vite 공식 문서](https://vitejs.dev)
