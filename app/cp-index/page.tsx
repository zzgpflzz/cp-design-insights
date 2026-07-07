'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type Section = 'design' | 'operations' | 'development';

interface LinkItem {
  title: string;
  url: string;
  description?: string;
}

interface SectionConfig {
  label: string;
  part: string;
  accentColor: string;
  accentBg: string;
  icon: React.ReactNode;
  items: LinkItem[];
}

export default function IndexHub(): React.ReactNode {
  const router = useRouter();

  const handleNavigation = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url !== '#') {
      router.push(url);
    }
  };

  const sections: Record<Section, SectionConfig> = {
    design: {
      label: 'Design',
      part: '디자인 파트',
      accentColor: '#F83BAA',
      accentBg: 'rgba(248, 59, 170, 0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      items: [
        { title: '디자인 대시보드', url: 'https://cp-design-insights.vercel.app', description: '프로젝트 타임라인 및 로드맵' },
        { title: 'UI 가이드라인', url: '/design-guidelines.html', description: '디자인 시스템 및 컴포넌트 가이드' },
        { title: '앱 구축 대시보드', url: 'https://git-dev.linecorp.com/login?return_to=https%3A%2F%2Fgit-dev.linecorp.com%2Fpages%2Flf-commerce%2Flf-commerce-app-dashboard%2F', description: '앱 구축 현황 및 진행 대시보드' },
        { title: '브랜드 에셋', url: '#', description: '로고, 컬러, 타이포그래피' },
        { title: '디자인 아카이브', url: '#', description: '과거 프로젝트 참고 자료' },
      ],
    },
    operations: {
      label: 'Operations',
      part: '운영 파트',
      accentColor: '#FF9D00',
      accentBg: 'rgba(255, 157, 0, 0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      items: [
        { title: '운영 대시보드', url: 'https://lfsq-dashboard-cp-online.myshopify.com/password', description: '팀 운영 지표 및 KPI' },
        { title: '고객 지원 로그', url: '/cs-logs', description: 'CS 문의 및 응대 기록 (HTML 업로드)' },
      ],
    },
    development: {
      label: 'Development',
      part: '개발 파트',
      accentColor: '#00A6FF',
      accentBg: 'rgba(0, 166, 255, 0.08)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      items: [
        { title: '개발 대시보드', url: 'https://jira.workers-hub.com/projects/IPXCP/issues/IPXCP-372?filter=allopenissues', description: '이슈 트래킹 및 개발 현황' },
        { title: '배포 로그', url: '#', description: '최근 배포 히스토리' },
        { title: 'API 문서', url: '#', description: 'REST API 엔드포인트 가이드' },
        { title: '마이그레이션 현황', url: '#', description: 'DB 스키마 변경 이력' },
        { title: '개발 환경 설정', url: '#', description: '로컬 개발 가이드' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* GNB */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-[#111]">Commerce Platform</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">CP 파트별 인덱스</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 pb-12">
        {/* Section Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(Object.keys(sections) as Section[]).map((sectionKey) => {
            const section = sections[sectionKey];
            return (
              <div
                key={sectionKey}
                className="bg-white rounded-2xl overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="px-7 py-6"
                  style={{ borderLeft: `3px solid ${section.accentColor}` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: section.accentBg, color: section.accentColor }}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#111]">{section.label}</div>
                      <div className="text-xs text-gray-400">{section.part}</div>
                    </div>
                  </div>
                </div>

                {/* Link List */}
                <ul className="pb-2">
                  {section.items.map((item, idx) => {
                    const isDisabled = item.url === '#';
                    return (
                    <li key={idx}>
                      <button
                        onClick={() => !isDisabled && handleNavigation(item.url)}
                        disabled={isDisabled}
                        className={`w-full text-left px-7 py-4 transition-colors group ${isDisabled ? 'cursor-not-allowed opacity-35' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#111]">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-0.5 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {!isDisabled && (
                            <svg
                              className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-xs text-gray-400 text-right">
            © 2026 CP Design Team.
          </div>
        </div>
      </footer>
    </div>
  );
}
