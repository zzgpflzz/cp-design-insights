const fs = require('fs');
const https = require('https');

async function captureDemo() {
  console.log('🔍 Fetching current page from http://localhost:3000...');

  const http = require('http');

  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000', (res) => {
      let html = '';

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        console.log('✅ HTML fetched successfully');

        // 샘플 데이터로 완성된 HTML 생성
        const completeHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CP Design - Monthly Insights</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      background-color: #FAFAFA;
      color: #1F2937;
    }

    .header {
      background: white;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem 2.5rem;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
    }

    .login-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #D1D5DB;
      color: #374151;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .login-btn:hover {
      background: #F9FAFB;
    }

    .tabs {
      display: flex;
      gap: 1.5rem;
      border-bottom: 1px solid #E5E7EB;
    }

    .tab {
      padding-bottom: 0.75rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      font-weight: 600;
      position: relative;
      cursor: pointer;
      color: #6B7280;
      transition: color 0.2s;
    }

    .tab.active {
      color: #06C755;
    }

    .tab.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #06C755;
    }

    .main {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 2.5rem;
    }

    .filters {
      margin-bottom: 1.5rem;
    }

    .month-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .filter-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #D1D5DB;
      background: white;
      color: #374151;
    }

    .filter-btn.active {
      background: #06C755;
      color: white;
      border-color: #06C755;
    }

    .filter-btn:hover:not(.active) {
      background: #F9FAFB;
    }

    .additional-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .filter-select {
      padding: 0.5rem 2.5rem 0.5rem 1rem;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #616161;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-position: right 1rem center;
      background-repeat: no-repeat;
    }

    .project-count {
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      color: #4B5563;
    }

    .project-count strong {
      font-weight: 700;
      color: #111827;
    }

    .agenda {
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
      padding-left: 2rem;
    }

    .agenda::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(to bottom, #06C755, #05B04C);
    }

    .agenda-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .agenda-icon {
      width: 3rem;
      height: 3rem;
      background: linear-gradient(to bottom right, #06C755, #05B04C);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      flex-shrink: 0;
    }

    .agenda-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }

    .agenda-badge {
      padding: 0.25rem 0.75rem;
      background: rgba(6, 199, 85, 0.1);
      color: #06C755;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 9999px;
    }

    .agenda-content {
      padding-left: 1rem;
      border-left: 2px solid #E5E7EB;
      color: #374151;
      line-height: 1.625;
      font-size: 0.9375rem;
      white-space: pre-wrap;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .project-card:hover {
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      transform: translateY(-2px);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .project-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .project-description {
      font-size: 0.875rem;
      color: #6B7280;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .project-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .badge-designer {
      background: #F3F4F6;
      color: #374151;
    }

    .badge-release {
      background: #D1FAE5;
      color: #065F46;
    }

    .badge-inprogress {
      background: #FEF3C7;
      color: #92400E;
    }

    .badge-uiux {
      background: #DBEAFE;
      color: #1E40AF;
    }

    .badge-contents {
      background: #FED7AA;
      color: #9A3412;
    }

    .badge-s-tier {
      background: #FCE7F3;
      color: #9F1239;
    }

    .badge-ab-tier {
      background: #E0E7FF;
      color: #3730A3;
    }

    @media (max-width: 768px) {
      .projects-grid {
        grid-template-columns: 1fr;
      }

      .header-container {
        padding: 1.5rem;
      }

      .main {
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-container">
      <div class="header-top">
        <h1 class="title">CP Design</h1>
        <button class="login-btn">로그인</button>
      </div>
      <div class="tabs">
        <div class="tab active">Monthly</div>
        <div class="tab">Project Roadmap</div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main">
    <!-- Filters -->
    <div class="filters">
      <div class="month-filters">
        <button class="filter-btn active">2025년 4월</button>
        <button class="filter-btn">2025년 3월</button>
        <button class="filter-btn">2025년 2월</button>
        <button class="filter-btn">전체</button>
      </div>

      <div class="additional-filters">
        <select class="filter-select">
          <option>Category</option>
          <option>UI/UX</option>
          <option>Contents</option>
        </select>
        <select class="filter-select">
          <option>Tier</option>
          <option>S Tier</option>
          <option>A-B Tier</option>
          <option>etc</option>
        </select>
        <select class="filter-select">
          <option>Status</option>
          <option>Release</option>
          <option>In Progress</option>
        </select>
        <select class="filter-select">
          <option>Designer</option>
          <option>🐰 장혜리</option>
          <option>🐶 김아영</option>
        </select>
      </div>
    </div>

    <!-- Project Count -->
    <div class="project-count">
      총 <strong>8</strong>개의 프로젝트
    </div>

    <!-- Monthly Agenda -->
    <div class="agenda">
      <div class="agenda-header">
        <div class="agenda-icon">
          <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <h3 class="agenda-title">2025년 4월</h3>
            <span class="agenda-badge">AGENDA</span>
          </div>
        </div>
      </div>
      <div class="agenda-content">신규 디자인 시스템 구축 및 통합
주요 서비스 UI/UX 개선 프로젝트 진행
사용자 경험 최적화를 위한 리서치 및 프로토타이핑</div>
    </div>

    <!-- Projects Grid -->
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">디자인 시스템 구축</h3>
            <p class="project-description">통합 디자인 시스템 구축 및 컴포넌트 라이브러리 개발</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐰 장혜리</span>
          <span class="badge badge-release">Release</span>
          <span class="badge badge-uiux">UI/UX</span>
          <span class="badge badge-s-tier">S Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">메인 페이지 리뉴얼</h3>
            <p class="project-description">사용자 경험 개선을 위한 메인 페이지 전면 리뉴얼</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐶 김아영</span>
          <span class="badge badge-inprogress">In Progress</span>
          <span class="badge badge-uiux">UI/UX</span>
          <span class="badge badge-s-tier">S Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">모바일 앱 프로토타입</h3>
            <p class="project-description">신규 모바일 앱 사용자 흐름 설계 및 프로토타이핑</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐰 장혜리</span>
          <span class="badge badge-inprogress">In Progress</span>
          <span class="badge badge-uiux">UI/UX</span>
          <span class="badge badge-ab-tier">A-B Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">브랜드 가이드라인 제작</h3>
            <p class="project-description">통합 브랜드 아이덴티티 및 가이드라인 문서화</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐶 김아영</span>
          <span class="badge badge-release">Release</span>
          <span class="badge badge-contents">Contents</span>
          <span class="badge badge-s-tier">S Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">대시보드 개선</h3>
            <p class="project-description">관리자 대시보드 UI/UX 개선 및 신규 기능 추가</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐰 장혜리</span>
          <span class="badge badge-release">Release</span>
          <span class="badge badge-uiux">UI/UX</span>
          <span class="badge badge-ab-tier">A-B Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">아이콘 세트 제작</h3>
            <p class="project-description">서비스 전반에 사용할 커스텀 아이콘 세트 디자인</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐶 김아영</span>
          <span class="badge badge-inprogress">In Progress</span>
          <span class="badge badge-contents">Contents</span>
          <span class="badge badge-ab-tier">A-B Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">온보딩 플로우 개선</h3>
            <p class="project-description">신규 사용자 온보딩 경험 최적화</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐰 장혜리</span>
          <span class="badge badge-release">Release</span>
          <span class="badge badge-uiux">UI/UX</span>
          <span class="badge badge-s-tier">S Tier</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-title">사용자 리서치 리포트</h3>
            <p class="project-description">Q1 사용자 경험 조사 및 인사이트 도출</p>
          </div>
        </div>
        <div class="project-badges">
          <span class="badge badge-designer">🐶 김아영</span>
          <span class="badge badge-release">Release</span>
          <span class="badge badge-contents">Contents</span>
          <span class="badge badge-ab-tier">A-B Tier</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    // 간단한 인터랙션 추가
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });

    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', function() {
        alert('프로젝트 상세 페이지 (개발 중)');
      });
    });
  </script>
</body>
</html>`;

        // 바탕화면에 저장
        const desktopPath = require('path').join(require('os').homedir(), 'Desktop', 'CP_Design_Insights_Demo.html');
        fs.writeFileSync(desktopPath, completeHtml, 'utf-8');

        console.log(`✅ Demo HTML saved to: ${desktopPath}`);
        console.log(`📊 File size: ${(Buffer.byteLength(completeHtml) / 1024).toFixed(2)} KB`);

        resolve(desktopPath);
      });
    }).on('error', reject);
  });
}

captureDemo()
  .then(path => {
    console.log('\n🎉 Success! You can now open the file:');
    console.log(`   ${path}`);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
