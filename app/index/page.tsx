'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Section = 'design' | 'development' | 'operations';

interface LinkItem {
  title: string;
  url: string;
  description?: string;
}

interface SectionConfig {
  title: string;
  icon: JSX.Element;
  bgColor: string;
  items: LinkItem[];
}

export default function IndexHub() {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavigation = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url !== '#') {
      router.push(url);
    }
  };

  const sectionData: Record<Section, SectionConfig> = {
    design: {
      title: 'Design',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      items: [
        { title: '디자인 캘린더', url: '/playground', description: '프로젝트 타임라인 및 로드맵' },
        { title: 'UI 가이드라인', url: '#', description: '디자인 시스템 및 컴포넌트 가이드' },
        { title: '피그마 디자인', url: 'https://figma.com', description: '실시간 디자인 파일' },
        { title: '브랜드 에셋', url: '#', description: '로고, 컬러, 타이포그래피' },
        { title: '디자인 아카이브', url: '#', description: '과거 프로젝트 참고 자료' },
      ],
    },
    development: {
      title: 'Development',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      bgColor: 'bg-emerald-50',
      items: [
        { title: 'GitHub 레포', url: 'https://github.com', description: '소스코드 및 이슈 트래킹' },
        { title: '배포 로그', url: '#', description: '최근 배포 히스토리' },
        { title: 'API 문서', url: '#', description: 'REST API 엔드포인트 가이드' },
        { title: '마이그레이션 현황', url: '#', description: 'DB 스키마 변경 이력' },
        { title: '개발 환경 설정', url: '#', description: '로컬 개발 가이드' },
      ],
    },
    operations: {
      title: 'Operations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      items: [
        { title: '구글 시트 대시보드', url: '#', description: '팀 운영 지표 및 KPI' },
        { title: '셀픽(Sellpick) 관리', url: '#', description: '상품 관리 및 재고 현황' },
        { title: '정산 관리', url: '#', description: '매출 및 정산 데이터' },
        { title: '고객 지원 로그', url: '#', description: 'CS 문의 및 응대 기록' },
        { title: '운영 가이드', url: '#', description: '내부 프로세스 문서' },
      ],
    },
  };

  const getIconColor = (sectionKey: Section) => {
    if (sectionKey === 'design') return 'text-blue-600';
    if (sectionKey === 'development') return 'text-emerald-600';
    return 'text-amber-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CP Design Hub</h1>
              <p className="text-xs text-slate-500 mt-1">팀 리소스 통합 인덱스</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">
            Welcome to Team Hub
          </h2>
          <p className="text-slate-600 text-lg">
            디자인부터 운영까지, 모든 리소스를 한 곳에서
          </p>
        </div>

        {/* Grid Layout - 3 Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {(Object.keys(sectionData) as Section[]).map((sectionKey) => {
            const section = sectionData[sectionKey];
            const iconColor = getIconColor(sectionKey);

            return (
              <div
                key={sectionKey}
                className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center ${iconColor}`}>
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{section.title}</h3>
                </div>

                {/* Links List */}
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => handleNavigation(item.url)}
                        onMouseEnter={() => setHoveredItem(`${sectionKey}-${idx}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className="w-full text-left group"
                      >
                        <div
                          className={`p-4 rounded-lg transition-all duration-200 ${
                            hoveredItem === `${sectionKey}-${idx}`
                              ? 'bg-slate-100 translate-x-1'
                              : 'bg-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-sm font-semibold transition-colors ${
                                hoveredItem === `${sectionKey}-${idx}`
                                  ? 'text-slate-900'
                                  : 'text-slate-700'
                              }`}
                            >
                              {item.title}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-all ${
                                hoveredItem === `${sectionKey}-${idx}`
                                  ? 'text-slate-900 translate-x-1'
                                  : 'text-slate-400'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                          {item.description && (
                            <p
                              className={`text-xs transition-colors leading-relaxed ${
                                hoveredItem === `${sectionKey}-${idx}`
                                  ? 'text-slate-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="mb-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Quick Stats</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                Total Projects
              </div>
              <div className="text-3xl font-bold text-slate-900">24</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                In Progress
              </div>
              <div className="text-3xl font-bold text-[#FF9D00]">8</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                Released
              </div>
              <div className="text-3xl font-bold text-[#00BC7D]">16</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                Team Members
              </div>
              <div className="text-3xl font-bold text-slate-900">6</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors underline-offset-4 hover:underline font-medium"
              >
                Main Site
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => router.push('/playground')}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors underline-offset-4 hover:underline font-medium"
              >
                Playground
              </button>
            </div>
            <div className="text-xs text-slate-500">
              © 2026 CP Design Team. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
