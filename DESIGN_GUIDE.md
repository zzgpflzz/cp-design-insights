# CP Design Insights - 디자인 가이드

> **CP Design Insights 프로젝트의 공식 디자인 시스템 가이드입니다.**

## 📐 디자인 철학

- **미니멀리즘**: 불필요한 요소를 제거하고 핵심에 집중
- **명확성**: 정보 계층이 명확하고 읽기 쉬운 UI
- **일관성**: 모든 요소에 일관된 디자인 언어 적용
- **반응성**: 다양한 디바이스에서 최적화된 경험 제공

---

## 🎨 컬러 시스템

### Primary Colors

| Color Name | Hex | RGB | 용도 |
|-----------|-----|-----|------|
| **Black** | `#313131` | rgb(49, 49, 49) | 주요 텍스트, CTA 버튼, 강조 |
| **Gray Dark** | `#1a1a1a` | rgb(26, 26, 26) | 호버 상태, 어두운 배경 |
| **Gray** | `#666666` | rgb(102, 102, 102) | 보조 텍스트 |
| **Gray Light** | `#F5F5F5` | rgb(245, 245, 245) | 필터바 배경, 서브 배경 |
| **White** | `#FFFFFF` | rgb(255, 255, 255) | 카드 배경, 메인 배경 |
| **Background** | `#FAFAFA` | rgb(250, 250, 250) | 페이지 배경 |

### Semantic Colors

#### Status Colors
| Color | Hex | 용도 |
|-------|-----|------|
| **Release (Green)** | `#00BC7D` | 릴리즈 완료 상태 |
| **In Progress (Orange)** | `#FF9D00` | 진행 중 상태 |
| **Success** | `#57B400` | 성공, 긍정적 지표 |

#### Category Colors
| Color | Hex | 용도 |
|-------|-----|------|
| **UI/UX (Pink)** | `#F83BAA` | UI/UX 카테고리 |
| **Contents (Blue)** | `#00A6FF` | Contents 카테고리, PM 관점 |

#### Tier Colors
| Color | Hex | 용도 |
|-------|-----|------|
| **S-Tier (Lime)** | `#57B400` | S등급 프로젝트 |
| **AB-Tier (Purple)** | `#8280FF` | A-B등급 프로젝트 |
| **ETC (Gray)** | `#888888` | 기타 프로젝트 |

### Color Usage Guidelines

#### 1. 배경 계층 구조
```css
/* Level 1: 페이지 배경 */
background: #FAFAFA;

/* Level 2: 카드/컴포넌트 배경 */
background: #FFFFFF;

/* Level 3: 강조 영역 */
background: #F5F5F5;
```

#### 2. 텍스트 계층 구조
```css
/* Primary: 제목, 중요 정보 */
color: #313131;

/* Secondary: 보조 설명 */
color: #666666;

/* Tertiary: 비활성 상태 */
color: #888888;
```

#### 3. 상태별 컬러
```css
/* 릴리즈 완료 */
.release {
  background: rgba(0, 188, 125, 0.08);
  border-color: #00BC7D;
  color: #00875A;
}

/* 진행 중 */
.in-progress {
  background: rgba(255, 157, 0, 0.08);
  border-color: #FF9D00;
  color: #CC7A00;
}
```

---

## 📝 타이포그래피

### 폰트 패밀리

```css
font-family: "Pretendard Variable", "Pretendard", -apple-system, 
             BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", 
             "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", 
             "Malgun Gothic", sans-serif;
```

**주요 폰트**: Pretendard Variable (가변 폰트)
- CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`

### 폰트 크기 시스템

| 사용처 | Font Size | Font Weight | Line Height |
|--------|-----------|-------------|-------------|
| **Page Title** | 24px (1.5rem) | 700 (Bold) | 1.2 |
| **Section Title** | 18px (1.125rem) | 700 (Bold) | 1.3 |
| **Card Title** | 18px (1.125rem) | 700 (Bold) | 1.4 |
| **Body Large** | 15px | 500 (Medium) | 1.6 |
| **Body** | 14px (0.875rem) | 500 (Medium) | 1.6 |
| **Body Small** | 12px (0.75rem) | 500 (Medium) | 1.5 |
| **Caption** | 10px (0.625rem) | 500 (Medium) | 1.4 |
| **Button** | 12px (0.75rem) | 500-600 (Medium-Semibold) | 1 |

### 텍스트 스타일 예제

```css
/* 페이지 타이틀 */
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #313131;
  letter-spacing: -0.02em;
}

/* 카드 타이틀 */
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #313131;
  line-height: 1.4;
}

/* 본문 텍스트 */
.body-text {
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  line-height: 1.6;
}

/* 캡션/라벨 */
.caption {
  font-size: 10px;
  font-weight: 500;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 🧱 컴포넌트

### 1. 버튼 (Buttons)

#### Primary Button
```css
.btn-primary {
  padding: 8px 20px;
  background: #313131;
  color: #FFFFFF;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1a1a1a;
}
```

#### Filter Button (선택되지 않음)
```css
.btn-filter {
  padding: 8px 16px;
  background: #FFFFFF;
  border: 0;
  color: #1a1a1a;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-filter:hover {
  background: #F5F5F5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### Filter Button (선택됨)
```css
.btn-filter-active {
  padding: 8px 20px;
  background: #000000;
  color: #FFFFFF;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
```

### 2. 카드 (Cards)

#### Project Card
```css
.project-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s;
  cursor: pointer;
}

.project-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

#### Stats Card
```css
.stats-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E5E5;
  padding: 24px;
}
```

### 3. 배지 (Badges)

#### 카테고리 배지
```css
/* UI/UX */
.badge-uiux {
  background: rgba(248, 59, 170, 0.08);
  color: #F83BAA;
  border: 0.5px solid rgba(248, 59, 170, 0.2);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

/* Contents */
.badge-contents {
  background: rgba(0, 166, 255, 0.08);
  color: #00A6FF;
  border: 0.5px solid rgba(0, 166, 255, 0.2);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
```

#### 상태 배지
```css
/* Release */
.badge-release {
  background: rgba(0, 188, 125, 0.08);
  color: #00BC7D;
  border: 0.5px solid rgba(0, 188, 125, 0.2);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

/* In Progress */
.badge-inprogress {
  background: rgba(255, 157, 0, 0.08);
  color: #FF9D00;
  border: 0.5px solid rgba(255, 157, 0, 0.2);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
```

### 4. 모달 (Modals)

#### 인사이트 대시보드 모달
```css
.insight-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.insight-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
}

.insight-modal-content {
  position: relative;
  width: 100%;
  max-width: 672px; /* 42rem */
  height: 90vh;
  background: #FAFAFA;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

### 5. 필터바 (Filter Bar)

```css
.filter-bar {
  background: #F5F5F5;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-select {
  padding: 8px 16px;
  padding-right: 36px;
  background: #FFFFFF;
  border: 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  background: #F5F5F5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

---

## 📏 간격 시스템 (Spacing)

### Padding/Margin Scale

| Name | Size | Usage |
|------|------|-------|
| `xs` | 4px | 아주 작은 간격 |
| `sm` | 8px | 작은 간격, 뱃지 내부 |
| `md` | 12px | 중간 간격, 필터바 |
| `lg` | 16px | 큰 간격, 섹션 |
| `xl` | 24px | 매우 큰 간격, 카드 내부 |
| `2xl` | 32px | 섹션 사이 |
| `3xl` | 40px | 페이지 섹션 |

### Grid Gaps

```css
/* 카드 그리드 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

/* Stats 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
```

---

## 🔲 레이아웃

### Container

```css
.container {
  max-width: 1280px; /* 80rem */
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 640px) {
  .container {
    padding: 0 32px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 40px;
  }
}
```

### GNB (Global Navigation Bar)

```css
.gnb {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
}

.gnb-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

## 🎭 인터랙션

### Hover Effects

```css
/* 카드 호버 */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 버튼 호버 */
.btn:hover {
  background: #1a1a1a;
}

/* 링크 호버 */
.link:hover {
  text-decoration: underline;
}
```

### Transitions

```css
/* 기본 트랜지션 */
transition: all 0.2s ease;

/* 느린 트랜지션 (카드) */
transition: all 0.3s ease;

/* 모달 애니메이션 */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🖼️ 아이콘

### 아이콘 시스템

- **스타일**: Heroicons (Outline)
- **크기**: 16px, 20px, 24px
- **색상**: 부모 요소의 텍스트 색상 상속

```html
<!-- 캘린더 아이콘 -->
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>

<!-- 화살표 아이콘 -->
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M9 5l7 7-7 7" />
</svg>
```

---

## 📱 반응형 디자인

### Breakpoints

| Name | Size | Device |
|------|------|--------|
| `sm` | 640px | 태블릿 세로 |
| `md` | 768px | 태블릿 가로 |
| `lg` | 1024px | 작은 데스크톱 |
| `xl` | 1280px | 데스크톱 |

### 반응형 그리드

```css
/* 모바일: 1열 */
.project-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* 태블릿: 2열 */
@media (min-width: 768px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 데스크톱: 3열 */
@media (min-width: 1024px) {
  .project-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## ✨ UI 패턴

### 1. 인사이트 카드 (Accordion)

```css
.insight-accordion-trigger {
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 24px;
  text-align: left;
  transition: all 0.2s;
}

.insight-accordion-trigger:hover {
  border-color: #313131;
}

.insight-accordion-content {
  margin-top: 16px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 24px;
}
```

### 2. 전문가 코멘트 박스

```css
/* PM 코멘트 */
.comment-pm {
  background: rgba(0, 166, 255, 0.05);
  border-left: 4px solid #00A6FF;
  border-radius: 8px;
  padding: 16px;
}

/* UIUX 코멘트 */
.comment-uiux {
  background: rgba(248, 59, 170, 0.05);
  border-left: 4px solid #F83BAA;
  border-radius: 8px;
  padding: 16px;
}
```

### 3. 프로그레스 바

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: #F5F5F5;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #00A6FF;
  border-radius: 999px;
  transition: width 0.3s ease;
}
```

---

## 🎯 사용 예시

### 프로젝트 카드 구현

```tsx
<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
  {/* 릴리즈 날짜 */}
  <div className="mb-3">
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium bg-[#F5F5F5] text-[#666666]">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs">2025-06-01</span>
    </div>
  </div>

  {/* 제목 + 뱃지 */}
  <div className="mb-4">
    <h3 className="text-lg font-bold text-gray-900 mb-3">프로젝트 제목</h3>
    <div className="flex flex-wrap gap-2">
      <span className="text-xs px-2.5 py-1 rounded-full font-medium" 
            style={{background: 'rgba(248, 59, 170, 0.08)', color: '#F83BAA', border: '0.5px solid rgba(248, 59, 170, 0.2)'}}>
        UI/UX
      </span>
      <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{background: 'rgba(0, 188, 125, 0.08)', color: '#00BC7D', border: '0.5px solid rgba(0, 188, 125, 0.2)'}}>
        RELEASE
      </span>
    </div>
  </div>

  {/* 설명 */}
  <p className="text-gray-600 text-sm mb-5 line-clamp-2">프로젝트 설명...</p>

  {/* 하단 */}
  <div className="flex items-center justify-between">
    <div className="text-sm text-gray-600">🐰 장혜리</div>
    <div className="text-sm font-semibold text-[#313131]">자세히 보기 →</div>
  </div>
</div>
```

---

## 📦 디자인 토큰 (Design Tokens)

### CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #313131;
  --color-background: #FAFAFA;
  --color-card: #FFFFFF;
  --color-text: #313131;
  --color-text-secondary: #666666;
  --color-border: #E5E5E5;
  
  /* Status */
  --color-release: #00BC7D;
  --color-inprogress: #FF9D00;
  
  /* Category */
  --color-uiux: #F83BAA;
  --color-contents: #00A6FF;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.1);
}
```

---

## 🚀 베스트 프랙티스

### 1. 일관성 유지
- 모든 컴포넌트에서 동일한 간격 시스템 사용
- 색상은 정의된 팔레트에서만 선택
- 폰트 크기는 타이포그래피 스케일을 따름

### 2. 접근성
- 텍스트와 배경 간 충분한 대비율 확보 (WCAG AA 기준)
- 호버/포커스 상태 명확히 표시
- 키보드 네비게이션 지원

### 3. 성능
- 불필요한 애니메이션 최소화
- 이미지 최적화 (WebP, lazy loading)
- CSS 변수 활용으로 리렌더링 최소화

### 4. 반응형
- 모바일 우선(Mobile-first) 접근
- 터치 타겟 크기 최소 44x44px
- 적절한 breakpoint 사용

---

## 📚 참고 자료

- **폰트**: [Pretendard](https://github.com/orioncactus/pretendard)
- **아이콘**: [Heroicons](https://heroicons.com/)
- **색상 이론**: [Material Design Color System](https://m2.material.io/design/color/the-color-system.html)
- **타이포그래피**: [Practical Typography](https://practicaltypography.com/)

---

## 🔄 업데이트 이력

- **2025-05-22**: 초기 디자인 가이드 작성
  - 컬러 시스템 정의
  - 타이포그래피 스케일 확립
  - 주요 컴포넌트 스타일 문서화
