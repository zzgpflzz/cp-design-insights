# CP Design Monthly Insights

디자인 파트의 월간 작업물을 보고하고 아카이빙하는 웹 애플리케이션입니다.

## 주요 기능

### 📊 코어 기능
- 📅 **월별 아카이빙**: 매달 진행한 작업물을 월별로 분류하여 관리
- 🎨 **디자이너 구분**: 장혜리, 김아영 디자이너별 작업물 표시 (이모지 캐릭터)
- 🏷️ **상태 관리**: Release / In Progress 상태로 구분
- 📂 **카테고리**: UI/UX / Contents 카테고리 분류
- 🔗 **링크 연결**: 각 작업물에 외부 링크 연결 가능
- 🛠️ **관리자 페이지**: 프로젝트 추가, 수정, 삭제 기능

### 📈 인사이트 대시보드 (v1.0.0)
- **동적 월별 인사이트**: 필터 선택 시 실시간 데이터 집계 및 분석
- **3-Tier 전문가 리뷰**: PM, UIUX, Product 관점의 프로페셔널 코멘트
- **2단 분할 레이아웃**: 우선순위 태스크 + 시각화된 주요 지표
- **실시간 성과 분석**: 평균 CTR, 총 조회수, 프로젝트 현황 자동 계산
- **90vh 인사이트 모달**: 프로젝트별 상세 분석 대시보드
- **필터 동기화**: 월별, 카테고리, Tier, Status, Designer 필터 완전 연동

## 기술 스택

- **Frontend**: Next.js 16.2.3, React 19.2.4, TypeScript
- **Styling**: Tailwind CSS 4.0
- **Typography**: Pretendard Variable (via jsDelivr CDN)
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Performance**: useMemo, useCallback hooks for optimization

## 프로젝트 구조

```
cp-design-insights/
├── app/
│   ├── page.tsx              # 프론트 페이지 (프로젝트 목록)
│   ├── admin/
│   │   └── page.tsx          # 어드민 페이지 (프로젝트 관리)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── DesignerBadge.tsx     # 디자이너 뱃지 컴포넌트
│   └── ProjectCard.tsx       # 프로젝트 카드 컴포넌트
├── lib/
│   ├── firebase.ts           # Firebase 설정
│   └── types.ts              # TypeScript 타입 정의
└── .env.example              # 환경 변수 예시
```

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
cd cp-design-insights
npm install
```

### 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화
   - 테스트 모드로 시작 (나중에 규칙 설정 필요)
3. 프로젝트 설정에서 웹 앱 추가
4. Firebase 구성 정보 복사

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 Firebase 구성 정보 입력:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### 필수 환경 변수 목록

현재 프로덕션 환경(Vercel)에서 필요한 환경 변수:

| 변수명 | 용도 | 필수 여부 |
|--------|------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 인증 키 | ✅ 필수 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 | ✅ 필수 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | ✅ 필수 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 | ✅ 필수 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | ✅ 필수 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 앱 ID | ✅ 필수 |

> **⚠️ 보안 주의**: 실제 값은 절대 Git에 커밋하지 마세요. `.env.local`은 `.gitignore`에 포함되어 있습니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 사용 방법

### 프론트 페이지 (/)

- 월별로 프로젝트 확인
- Release / In Progress 상태 필터링
- UI/UX, Contents 카테고리별 구분
- 디자이너별 작업물 확인

### 관리자 페이지 (/admin)

1. **프로젝트 추가**
   - 제목, 설명, 링크(선택) 입력
   - 디자이너 선택 (장혜리 🎨 / 김아영 🖌️)
   - 월, 상태, 카테고리 선택
   - "추가하기" 버튼 클릭

2. **프로젝트 수정**
   - 등록된 프로젝트 목록에서 "수정" 버튼 클릭
   - 정보 수정 후 "수정하기" 버튼 클릭

3. **프로젝트 삭제**
   - 등록된 프로젝트 목록에서 "삭제" 버튼 클릭
   - 확인 후 삭제

## 디자이너 정보

| 디자이너 | 이모지 | 색상 |
|---------|--------|------|
| 장혜리   | 🎨     | 보라색 |
| 김아영   | 🖌️     | 파란색 |

## Firebase 보안 규칙 (권장)

Firestore 보안 규칙을 설정하여 데이터를 보호하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 프로젝트 컬렉션
    match /projects/{projectId} {
      // 모든 사용자가 읽기 가능
      allow read: if true;
      
      // 인증된 사용자만 쓰기 가능 (추후 Firebase Auth 설정 필요)
      allow write: if request.auth != null;
    }
  }
}
```

## 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정 (Firebase 구성)
   - Vercel Dashboard → 프로젝트 → Settings → Environment Variables
   - 위의 필수 환경 변수 6개 모두 입력
4. 배포

```bash
npm run build
```

**현재 프로덕션 URL**: https://cp-design-insights.vercel.app/

## 버전 관리 및 백업

### 안정 버전 복원 방법

현재 프로젝트는 안정적인 버전을 태그와 백업 브랜치로 보존하고 있습니다.

#### 태그로 복원
```bash
# 사용 가능한 태그 확인
git tag -l

# 특정 태그로 체크아웃
git checkout v1.0.0-stable-dashboard

# 새 브랜치로 복원 (수정 작업 시)
git checkout -b restore-from-v1 v1.0.0-stable-dashboard
```

#### 백업 브랜치로 복원
```bash
# 백업 브랜치 확인
git branch -a | grep backup

# 백업 브랜치로 전환
git checkout backup/stable-insight-v1

# main에 병합 (조심!)
git checkout main
git merge backup/stable-insight-v1
```

### 주요 안정 버전

| 버전 | 태그 | 브랜치 | 설명 |
|------|------|--------|------|
| v1.0.0 | `v1.0.0-stable-dashboard` | `backup/stable-insight-v1` | 월별 인사이트 대시보드 + Pretendard 폰트 통일 |

**복원 권장 시나리오**:
- 코드 수정 후 버그가 발생했을 때
- 새 기능 추가 전 안정 버전 확인이 필요할 때
- 디자인/로직이 꼬여서 처음부터 다시 시작하고 싶을 때

## 📊 Google Sheets 통합 관리

CSV 파일을 Google Sheets로 중앙 관리하고 Firebase와 자동 동기화할 수 있습니다.

### 설정 방법

자세한 설정 방법은 [Google Sheets 설정 가이드](./docs/GOOGLE_SHEETS_SETUP.md)를 참고하세요.

### 사용 명령어

```bash
# CSV 파일을 Google Sheets로 업로드
npm run sheets:upload-csv

# Google Sheets 데이터를 Firebase로 동기화
npm run sheets:sync

# 전체 동기화 (CSV → Google Sheets → Firebase)
npm run sheets:full-sync
```

### 워크플로우

```
CSV 파일 (세션 데이터)
    ↓
[npm run sheets:upload-csv]
    ↓
Google Sheets (중앙 관리)
    ↓
[npm run sheets:sync]
    ↓
Firebase (프로덕션)
    ↓
웹 대시보드
```

### 장점

1. **중앙 관리**: Google Sheets에서 모든 세션 데이터를 한눈에 관리
2. **협업**: 팀원들과 실시간으로 데이터 공유 및 수정
3. **히스토리**: Google Sheets의 버전 관리 기능 활용
4. **유연성**: 스프레드시트에서 수식, 차트 등 활용 가능
5. **자동화**: 스크립트로 간편하게 동기화

## 개선 사항 제안

- [x] Google Sheets 통합 관리 시스템
- [ ] Firebase Authentication 추가 (관리자 로그인)
- [ ] 이미지 업로드 기능 (Firebase Storage)
- [ ] 프로젝트 검색 기능
- [ ] 통계 대시보드 (월별 작업량 등)
- [ ] 다크 모드 지원
- [ ] 반응형 디자인 개선
- [ ] GitHub Actions 자동 동기화
- [ ] Slack 알림 추가

## 라이선스

MIT

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
