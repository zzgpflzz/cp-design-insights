# CP Design Monthly Insights

디자인 파트의 월간 작업물을 보고하고 아카이빙하는 웹 애플리케이션입니다.

## 주요 기능

- 📅 **월별 아카이빙**: 매달 진행한 작업물을 월별로 분류하여 관리
- 🎨 **디자이너 구분**: 장혜리, 김아영 디자이너별 작업물 표시 (이모지 캐릭터)
- 🏷️ **상태 관리**: Release / In Progress 상태로 구분
- 📂 **카테고리**: UI/UX / Contents 카테고리 분류
- 🔗 **링크 연결**: 각 작업물에 외부 링크 연결 가능
- 🛠️ **관리자 페이지**: 프로젝트 추가, 수정, 삭제 기능

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Hosting**: Vercel (권장)

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
4. 배포

```bash
npm run build
```

## 개선 사항 제안

- [ ] Firebase Authentication 추가 (관리자 로그인)
- [ ] 이미지 업로드 기능 (Firebase Storage)
- [ ] 프로젝트 검색 기능
- [ ] 통계 대시보드 (월별 작업량 등)
- [ ] 다크 모드 지원
- [ ] 반응형 디자인 개선

## 라이선스

MIT

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
