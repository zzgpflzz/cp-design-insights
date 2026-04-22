'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthenticated } from '@/lib/auth';
import { Project, MonthlyData, ProjectProgress, MonthlyAgenda, Category, Tier, Status, Designer } from '@/lib/types';
import LoginModal from '@/components/LoginModal';
import RoadmapView from '@/components/RoadmapView';

type TabType = 'monthly' | 'roadmap';

interface ProjectInsight {
  views: number;
  ctr: number;
  avgTime: string;
  label: string;
  labelEmoji: string;
  aiComment: string;
}

export default function Playground() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [projects, setProjects] = useState<Project[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [agendas, setAgendas] = useState<MonthlyAgenda[]>([]);
  const [projectProgresses, setProjectProgresses] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);

  // Development-only access check
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [router]);

  const fetchProjects = useCallback(async () => {
    console.log('🔵 fetchProjects started');
    const startTime = performance.now();
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log(`✅ Projects fetched: ${querySnapshot.docs.length} docs in ${(performance.now() - startTime).toFixed(2)}ms`);

      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Project[];
      setProjects(projectsData);

      // 월별 데이터 그룹화
      const grouped = projectsData.reduce((acc, project) => {
        const existingMonth = acc.find((m) => m.month === project.month);
        if (existingMonth) {
          existingMonth.projects.push(project);
        } else {
          acc.push({ month: project.month, projects: [project] });
        }
        return acc;
      }, [] as MonthlyData[]);

      // 월 순서대로 정렬 (최신순)
      grouped.sort((a, b) => b.month.localeCompare(a.month));
      setMonthlyData(grouped);

      // 최초 진입 시 가장 최신 월 선택 (setSelectedMonth 제거 - 초기값은 state 선언에서 설정)
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAgendas = useCallback(async () => {
    console.log('🔵 fetchAgendas started');
    const startTime = performance.now();
    try {
      const q = query(collection(db, 'agendas'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log(`✅ Agendas fetched: ${querySnapshot.docs.length} docs in ${(performance.now() - startTime).toFixed(2)}ms`);

      const agendasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as MonthlyAgenda[];
      setAgendas(agendasData);
    } catch (error) {
      console.error('Error fetching agendas:', error);
    }
  }, []);

  const fetchProjectProgresses = useCallback(async () => {
    console.log('🔵 fetchProjectProgresses started');
    const startTime = performance.now();
    try {
      const q = query(
        collection(db, 'projectProgresses'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      console.log(`✅ ProjectProgresses fetched: ${querySnapshot.docs.length} docs in ${(performance.now() - startTime).toFixed(2)}ms`);

      // projectId가 있는 신규 데이터만 필터링
      const progressData = querySnapshot.docs
        .filter((doc) => doc.data().projectId)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as ProjectProgress[];

      console.log(`✅ Filtered to ${progressData.length} items with projectId`);
      setProjectProgresses(progressData);
    } catch (error) {
      console.error('Error fetching project progresses:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🚀 Component mounted - starting data fetch');
    const mountTime = performance.now();

    setIsLoggedIn(isAuthenticated());

    // 한 번만 실행
    const initializeData = async () => {
      const startTime = performance.now();
      await Promise.all([
        fetchProjects(),
        fetchAgendas(),
        fetchProjectProgresses()
      ]);
      console.log(`✅ All data loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
      console.log(`✅ Total time from mount: ${(performance.now() - mountTime).toFixed(2)}ms`);
    };

    initializeData();
  }, []); // 빈 의존성 배열 - 마운트 시 한 번만 실행

  // 리렌더링 감지
  useEffect(() => {
    console.log('🔄 Component re-rendered');
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    router.push('/admin');
  };

  const formatMonth = useCallback((month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${parseInt(monthNum)}월`;
  }, []);

  // 필터링된 프로젝트 (useMemo로 최적화)
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (selectedMonth !== 'all' && project.month !== selectedMonth) return false;
      if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
      if (selectedTier !== 'all' && project.tier !== selectedTier) return false;
      if (selectedStatus !== 'all' && project.status !== selectedStatus) return false;
      if (selectedDesigner !== 'all' && project.designer !== selectedDesigner) return false;
      return true;
    });
  }, [projects, selectedMonth, selectedCategory, selectedTier, selectedStatus, selectedDesigner]);

  // 선택된 월의 아젠다 (useMemo로 최적화)
  const currentAgenda = useMemo(() => {
    return selectedMonth !== 'all'
      ? agendas.find(agenda => agenda.month === selectedMonth)
      : null;
  }, [agendas, selectedMonth]);

  const resetFilters = useCallback(() => {
    setSelectedMonth('all');
    setSelectedCategory('all');
    setSelectedTier('all');
    setSelectedStatus('all');
    setSelectedDesigner('all');
  }, []);

  // 목업 인사이트 데이터 생성
  const generateMockInsight = (project: Project): ProjectInsight => {
    const ctr = Math.random() * 15; // 0-15% CTR
    const views = Math.floor(Math.random() * 10000) + 1000;
    const avgMinutes = Math.floor(Math.random() * 10) + 1;
    const avgSeconds = Math.floor(Math.random() * 60);

    let label = '';
    let labelEmoji = '';
    let aiComment = '';

    if (ctr >= 10) {
      label = 'TOP TIER';
      labelEmoji = '🔥';
      aiComment = '이 프로젝트는 사용자 참여도가 매우 높습니다. 현재의 디자인 전략을 다른 프로젝트에도 적용해보세요.';
    } else if (ctr >= 5) {
      label = 'PERFORMING WELL';
      labelEmoji = '✨';
      aiComment = '안정적인 성과를 보이고 있습니다. CTA 버튼의 위치를 상단으로 이동하면 더 나은 결과를 얻을 수 있습니다.';
    } else if (ctr >= 3) {
      label = 'AVERAGE';
      labelEmoji = '📊';
      aiComment = '평균적인 성과입니다. 시각적 계층 구조를 개선하고 주요 액션 버튼의 대비를 높여보세요.';
    } else {
      label = 'NEED REVISION';
      labelEmoji = '🛠';
      aiComment = '이 프로젝트는 시각적 주목도는 높으나 실제 클릭으로 이어지는 CTA가 약합니다. 버튼 컬러를 #313131로 변경해보세요.';
    }

    return {
      views,
      ctr: parseFloat(ctr.toFixed(2)),
      avgTime: `${avgMinutes}분 ${avgSeconds}초`,
      label,
      labelEmoji,
      aiComment
    };
  };

  // 랜덤 이모지 생성
  const getRandomEmoji = () => {
    const emojis = ['(^Д^)/', '(⌐■_■)', '(◕‿◕)', '(づ｡◕‿‿◕｡)づ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(｡♥‿♥｡)', '(✿◠‿◠)'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  // 프로젝트 클릭 핸들러
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsInsightOpen(true);
  };

  // 팝업 닫기
  const closeInsight = () => {
    setIsInsightOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Development Badge */}
      <div className="fixed bottom-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg">
        🚧 PLAYGROUND MODE
      </div>

      {/* Awwwards-style GNB */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <h1 className="text-xl font-bold text-[#313131]">
                CP Design.
              </h1>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'monthly'
                      ? 'text-[#313131]'
                      : 'text-gray-400 hover:text-[#313131]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'roadmap'
                      ? 'text-[#313131]'
                      : 'text-gray-400 hover:text-[#313131]'
                  }`}
                >
                  Project Roadmap
                </button>
              </nav>
            </div>

            {/* Right: Login Button */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2 bg-[#313131] text-white rounded-md text-xs font-medium hover:bg-[#1a1a1a] transition-all duration-200"
                >
                  Admin
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2 bg-[#313131] text-white rounded-md text-xs font-medium hover:bg-[#1a1a1a] transition-all duration-200"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {activeTab === 'monthly' ? (
          <>
            {/* Month Filter Buttons - Awwwards Style */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {monthlyData.map((data) => (
                  <button
                    key={data.month}
                    onClick={() => setSelectedMonth(data.month)}
                    className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedMonth === data.month
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white border-0 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    {formatMonth(data.month)}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedMonth('all')}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedMonth === 'all'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white border-0 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  전체
                </button>
              </div>
            </div>

            {/* Awwwards-style Filter Bar */}
            <div className="mb-8 bg-[#F5F5F5] rounded-[12px] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
              {/* Left: Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Filter */}
                <div className="relative group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                    className="px-4 py-2 pr-9 bg-white hover:bg-gray-50 border-0 rounded-md text-xs font-medium text-[#1a1a1a] appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300 hover:shadow-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <option value="all">Category</option>
                    <option value="uiux">UI/UX</option>
                    <option value="contents">Contents</option>
                  </select>
                </div>

                {/* Tier Filter */}
                <div className="relative group">
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as Tier | 'all')}
                    className="px-4 py-2 pr-9 bg-white hover:bg-gray-50 border-0 rounded-md text-xs font-medium text-[#1a1a1a] appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300 hover:shadow-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <option value="all">Tier</option>
                    <option value="s-tier">S Tier</option>
                    <option value="ab-tier">A-B Tier</option>
                    <option value="etc">etc</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative group">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as Status | 'all')}
                    className="px-4 py-2 pr-9 bg-white hover:bg-gray-50 border-0 rounded-md text-xs font-medium text-[#1a1a1a] appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300 hover:shadow-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <option value="all">Status</option>
                    <option value="release">Release</option>
                    <option value="inprogress">In Progress</option>
                  </select>
                </div>

                {/* Designer Filter with emoji icon */}
                <div className="relative group">
                  <select
                    value={selectedDesigner}
                    onChange={(e) => setSelectedDesigner(e.target.value as Designer | 'all')}
                    className="px-4 py-2 pr-9 bg-white hover:bg-gray-50 border-0 rounded-md text-xs font-medium text-[#1a1a1a] appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300 hover:shadow-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <option value="all">Designer</option>
                    <option value="hyeri">🐰 장혜리</option>
                    <option value="ayoung">🐶 김아영</option>
                  </select>
                </div>
              </div>

              {/* Right: Reset & Count Badge */}
              <div className="flex items-center gap-3">
                {/* Active Filter Count Badge */}
                {(() => {
                  const activeFilters = [
                    selectedCategory !== 'all',
                    selectedTier !== 'all',
                    selectedStatus !== 'all',
                    selectedDesigner !== 'all'
                  ].filter(Boolean).length;

                  return activeFilters > 0 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full">
                      <span className="text-xs font-medium">{activeFilters}</span>
                    </div>
                  ) : null;
                })()}

                {/* Reset Button */}
                {(selectedCategory !== 'all' || selectedTier !== 'all' || selectedStatus !== 'all' || selectedDesigner !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-white hover:bg-gray-50 border-0 text-[#666] rounded-md text-xs font-medium transition-all duration-200 hover:shadow-sm flex items-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Project Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                총 <span className="font-bold text-gray-900">{filteredProjects.length}</span>개의 프로젝트
              </p>
            </div>

            {/* Monthly Agenda */}
            {currentAgenda && (
              <div className="mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#313131] to-[#1a1a1a]" />
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 pl-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#313131] to-[#1a1a1a] rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {formatMonth(currentAgenda.month)}
                        </h3>
                        <span className="px-3 py-1 bg-[#313131]/10 text-[#313131] text-xs font-bold rounded-full">
                          AGENDA
                        </span>
                      </div>
                      <div className="space-y-3">
                        {currentAgenda.content.split('\n\n').map((section, index) => (
                          <div key={index} className="pl-4 border-l-2 border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                              {section}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content - 클릭 가능한 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const categoryLabel = project.category === 'uiux' ? 'UI/UX' : 'CONTENTS';
                const categoryStyle = project.category === 'uiux'
                  ? { backgroundColor: 'rgba(248, 59, 170, 0.08)', color: '#F83BAA', borderColor: 'rgba(248, 59, 170, 0.2)' }
                  : { backgroundColor: 'rgba(0, 166, 255, 0.08)', color: '#00A6FF', borderColor: 'rgba(0, 166, 255, 0.2)' };

                const tierLabel = project.tier === 's-tier' ? 'S TIER' : project.tier === 'ab-tier' ? 'A-B TIER' : 'ETC';
                const tierStyle = project.tier === 's-tier'
                  ? { backgroundColor: 'rgba(87, 180, 0, 0.08)', color: '#57B400', borderColor: 'rgba(87, 180, 0, 0.2)' }
                  : project.tier === 'ab-tier'
                  ? { backgroundColor: 'rgba(130, 128, 255, 0.08)', color: '#8280FF', borderColor: 'rgba(130, 128, 255, 0.2)' }
                  : { backgroundColor: 'rgba(136, 136, 136, 0.08)', color: '#888888', borderColor: 'rgba(136, 136, 136, 0.2)' };

                const statusStyle = project.status === 'release'
                  ? { backgroundColor: 'rgba(0, 188, 125, 0.08)', color: '#00BC7D', borderColor: 'rgba(0, 188, 125, 0.2)' }
                  : { backgroundColor: 'rgba(255, 157, 0, 0.08)', color: '#FF9D00', borderColor: 'rgba(255, 157, 0, 0.2)' };

                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    {/* 상단: 제목 + 뱃지들 */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 leading-snug flex-1">{project.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium border-[0.5px]"
                          style={categoryStyle}
                        >
                          {categoryLabel}
                        </span>
                        {project.tier && (
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-medium border-[0.5px]"
                            style={tierStyle}
                          >
                            {tierLabel}
                          </span>
                        )}
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium border-[0.5px]"
                          style={statusStyle}
                        >
                          {project.status === 'release' ? 'RELEASE' : 'IN PROGRESS'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{project.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {project.designer === 'hyeri' ? '🐰 장혜리' : '🐶 김아영'}
                      </div>
                      <div className="text-sm font-semibold text-[#313131]">
                        자세히 보기 →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <RoadmapView projectProgresses={projectProgresses} />
        )}
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLogin}
        />
      )}

      {/* 인사이트 대시보드 팝업 - 90% 높이 */}
      {isInsightOpen && selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeInsight}
        >
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Drawer/Modal */}
          <div
            className="relative w-full max-w-2xl h-[90vh] bg-[#FAFAFA] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-[#313131]">{selectedProject.title}</h2>
                <p className="text-sm text-gray-600 mt-1">디자인 인사이트 대시보드</p>
              </div>
              <button
                onClick={closeInsight}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#313131" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* 썸네일 또는 이모지 */}
              <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300">
                {selectedProject.link ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-sm text-gray-600">미리보기 썸네일</p>
                    <p className="text-xs text-gray-400 mt-2">{selectedProject.link}</p>
                  </div>
                ) : (
                  <div className="text-9xl">{getRandomEmoji()}</div>
                )}
              </div>

              {/* 성과 지표 */}
              {(() => {
                const insight = generateMockInsight(selectedProject);
                return (
                  <>
                    {/* 라벨 */}
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-white rounded-full text-sm font-bold border-2 border-[#313131]">
                        {insight.labelEmoji} {insight.label}
                      </span>
                    </div>

                    {/* 숫자 대시보드 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-2 font-medium">조회수</div>
                        <div className="text-3xl font-bold text-[#313131]">{insight.views.toLocaleString()}</div>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-2 font-medium">클릭률</div>
                        <div className="text-3xl font-bold text-[#313131]">{insight.ctr}%</div>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-2 font-medium">체류시간</div>
                        <div className="text-2xl font-bold text-[#313131]">{insight.avgTime}</div>
                      </div>
                    </div>

                    {/* AI 인사이트 댓글 */}
                    <div className="bg-white rounded-xl p-6 border-l-4 border-[#313131] shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#313131] flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" stroke="white" strokeWidth="2"/>
                            <path d="M7 9V9.01M13 9V9.01M7 13C7 13 8 14 10 14C12 14 13 13 13 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-[#313131] mb-2">AI 인사이트</div>
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.aiComment}</p>
                        </div>
                      </div>
                    </div>

                    {/* 프로젝트 상세 정보 */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-sm text-[#313131] mb-4">프로젝트 정보</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">담당자</span>
                          <span className="font-medium">{selectedProject.designer === 'hyeri' ? '🐰 장혜리' : '🐶 김아영'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">카테고리</span>
                          <span className="font-medium">{selectedProject.category === 'uiux' ? 'UI/UX' : 'Contents'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">상태</span>
                          <span className="font-medium">{selectedProject.status === 'release' ? 'Release' : 'In Progress'}</span>
                        </div>
                        {selectedProject.link && (
                          <div className="pt-3 border-t border-gray-200">
                            <a
                              href={selectedProject.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#313131] hover:underline font-medium flex items-center gap-2"
                            >
                              프로젝트 바로가기 →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 */}
      <style jsx>{`
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
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
