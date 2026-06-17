# Google Sheets 통합 관리 시스템 설정 가이드

## 📋 개요

CSV 파일 → Google Sheets → Firebase로 자동 동기화하는 시스템입니다.

## 🚀 설정 방법

### 1. Google Cloud Project 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: `cp-design-insights` (또는 원하는 이름)

### 2. Google Sheets API 활성화

1. Google Cloud Console에서 "API 및 서비스" → "라이브러리" 이동
2. "Google Sheets API" 검색
3. "사용 설정" 클릭

### 3. 서비스 계정 생성

1. "API 및 서비스" → "사용자 인증 정보" 이동
2. "사용자 인증 정보 만들기" → "서비스 계정" 선택
3. 서비스 계정 이름: `sheets-sync-service` (또는 원하는 이름)
4. 역할: "편집자" 또는 "기본" 선택
5. "완료" 클릭

### 4. 서비스 계정 키 생성

1. 생성한 서비스 계정 클릭
2. "키" 탭 선택
3. "키 추가" → "새 키 만들기"
4. 키 유형: **JSON** 선택
5. "만들기" 클릭하면 JSON 파일 다운로드됨

### 5. JSON 키 파일 저장

다운로드한 JSON 파일을 프로젝트 루트에 저장:
```bash
mv ~/Downloads/프로젝트명-xxxxx.json ./google-credentials.json
```

**중요:** `.gitignore`에 이 파일이 포함되어 있는지 확인하세요!

### 6. Google Sheets 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: "CP Design 세션 데이터" (또는 원하는 이름)
4. URL에서 스프레드시트 ID 복사
   - 예: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - `[SPREADSHEET_ID]` 부분을 복사

### 7. 서비스 계정에 권한 부여

1. Google Sheets에서 "공유" 버튼 클릭
2. 서비스 계정 이메일 입력
   - JSON 파일의 `client_email` 값 (예: `sheets-sync-service@프로젝트명.iam.gserviceaccount.com`)
3. 권한: "편집자" 선택
4. "공유" 클릭

### 8. 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# Google Sheets 설정
GOOGLE_SHEETS_ID=여기에_스프레드시트_ID_입력
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# 기존 Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... (기존 설정 유지)
```

## 💻 사용 방법

### CSV 파일을 Google Sheets로 업로드

```bash
npm run sheets:upload-csv
```

### Google Sheets 데이터를 Firebase로 동기화

```bash
npm run sheets:sync
```

### 전체 동기화 (CSV → Google Sheets → Firebase)

```bash
npm run sheets:full-sync
```

## 📊 워크플로우

```
CSV 파일
    ↓
[npm run sheets:upload-csv]
    ↓
Google Sheets (중앙 관리)
    ↓
[npm run sheets:sync]
    ↓
Firebase (프로덕션)
```

## ✅ 장점

1. **중앙 관리**: Google Sheets에서 모든 세션 데이터를 한눈에 관리
2. **협업**: 팀원들과 실시간으로 데이터 공유 및 수정
3. **히스토리**: Google Sheets의 버전 관리 기능 활용
4. **유연성**: 스프레드시트에서 수식, 차트 등 활용 가능
5. **자동화**: 스크립트로 간편하게 동기화

## 🔒 보안 주의사항

- `google-credentials.json` 파일은 **절대 Git에 커밋하지 마세요**
- `.gitignore`에 다음 항목 추가:
  ```
  google-credentials.json
  *-credentials.json
  ```

## 🐛 문제 해결

### "Invalid credentials" 오류

- JSON 키 파일 경로가 올바른지 확인
- `.env.local` 파일의 `GOOGLE_APPLICATION_CREDENTIALS` 경로 확인

### "Permission denied" 오류

- Google Sheets에 서비스 계정 이메일이 공유되어 있는지 확인
- 권한이 "편집자"인지 확인

### "Spreadsheet not found" 오류

- `GOOGLE_SHEETS_ID`가 올바른지 확인
- 스프레드시트가 삭제되지 않았는지 확인

## 📝 예제

### 새로운 월 데이터 추가

1. CSV 파일을 `/Users/user/Downloads/` 에 저장
2. `google-sheets-sync.ts` 파일에서 파일 경로 추가
3. `npm run sheets:full-sync` 실행
4. Google Sheets와 Firebase에 자동으로 업로드됨

## 🔄 자동화 아이디어

향후 개선 사항:
- GitHub Actions로 자동 동기화
- Cron Job으로 주기적 동기화
- Slack 알림 추가
- 데이터 검증 및 오류 리포팅
