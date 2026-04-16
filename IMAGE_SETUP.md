# 프로필 이미지 설정 가이드

## 현재 상태

임시 SVG 이미지가 생성되어 있습니다:
- `/public/images/profile/hyeri.svg` (장혜리 - 족제비 이모지)
- `/public/images/profile/ayoung.svg` (김아영 - 시바견 이모지)

## 실제 이미지로 교체

공유해주신 귀여운 캐릭터 이미지로 교체하려면:

### 저장 위치
```
cp-design-insights/
└── public/
    └── images/
        └── profile/
            ├── hyeri.svg    (장혜리 프로필)
            └── ayoung.svg   (김아영 프로필)
```

## 이미지 교체 방법

### 방법 1: 직접 파일 교체
1. 공유해주신 이미지를 다운로드:
   - 첫 번째 이미지(족제비/고슴도치 캐릭터) → 장혜리
   - 두 번째 이미지(고양이/타피오카 캐릭터) → 김아영

2. 파일을 PNG 또는 JPG로 저장

3. 파일명을 다음과 같이 변경:
   - `hyeri.svg` (또는 `hyeri.png`, `hyeri.jpg`)
   - `ayoung.svg` (또는 `ayoung.png`, `ayoung.jpg`)

4. `public/images/profile/` 폴더에 복사하여 기존 파일 덮어쓰기

5. 파일 형식이 다르면 `lib/types.ts` 파일에서 확장자 수정:
   ```typescript
   profileImage: '/images/profile/hyeri.png', // .svg → .png로 변경
   ```

### 방법 2: 터미널에서 저장
```bash
cd public/images/profile

# 다운로드한 이미지를 이 폴더로 이동
mv ~/Downloads/your-image.png hyeri.png
mv ~/Downloads/your-image2.png ayoung.png
```

## 이미지 권장 사양

- **형식**: PNG, JPG, SVG 모두 가능
- **크기**: 100x100px ~ 300x300px (정사각형 권장)
- **배경**: 투명 또는 단색
- **용량**: 500KB 이하 권장

## 표시 크기

- **Small (sm)**: 20x20px - 카드형 뷰
- **Medium (md)**: 24x24px - 기본
- **Large (lg)**: 28x28px - 큰 화면

이미지는 자동으로 원형으로 크롭되어 표시됩니다.
