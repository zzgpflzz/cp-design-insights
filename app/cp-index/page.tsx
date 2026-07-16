'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Section = 'design' | 'operations' | 'development';

interface LinkItem {
  title: string;
  url: string;
  description?: string;
  openInNewTab?: boolean;
}

interface SectionConfig {
  label: string;
  part: string;
  accentColor: string;
  accentBg: string;
  icon: React.ReactNode;
  items: LinkItem[];
}

const CORRECT_PASSWORD = 'commerce2026';
const SESSION_KEY = 'cp_index_auth';

export default function IndexHub(): React.ReactNode {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 스토리지에서 인증 상태 확인
    const authStatus = sessionStorage.getItem(SESSION_KEY);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // 인증되지 않은 경우 비밀번호 입력 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#111] mb-2">Commerce Platform</h1>
              <p className="text-sm text-gray-500">접근하려면 비밀번호를 입력하세요</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#111] text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                확인
              </button>
            </form>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            비밀번호는 브라우저 세션 동안 유지됩니다
          </p>
        </div>
      </div>
    );
  }

  // 인증된 경우 메인 콘텐츠 표시
  const handleNavigation = (url: string, forceNewTab?: boolean) => {
    if (url.startsWith('http') || forceNewTab) {
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
        { title: '디자인 대시보드', url: 'https://cp-design-insights.vercel.app', description: '컨텐츠/UIUX/TF 업무 대시보드', openInNewTab: false },
        { title: 'AX 디자인 md파일 v.1', url: '/design-guidelines.html', description: '디자인 시스템 및 컴포넌트 가이드', openInNewTab: true },
        { title: '앱 구축 대시보드', url: 'https://git-dev.linecorp.com/pages/lf-commerce/lfsq-app-dashboard/260609_app_dash.html', description: '앱 구축 현황 및 진행 대시보드' },
        { title: 'Pipey v.1', url: '#', description: 'Pipey 서비스 대시보드 (준비중)' },
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
        { title: 'CS 대시보드', url: '/cs-logs', description: 'CS 문의 및 응대 기록 (HTML 업로드)' },
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
        { title: 'JIRA', url: 'https://jira.workers-hub.com/projects/IPXCP/issues/IPXCP-372?filter=allopenissues', description: '이슈 트래킹 및 개발 현황' },
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
                        onClick={() => !isDisabled && handleNavigation(item.url, item.openInNewTab)}
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
