'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthenticated } from '@/lib/auth';
import { Project, MonthlyData, ProjectProgress, MonthlyAgenda, Category, Tier, Status, Designer } from '@/lib/types';
import LoginModal from '@/components/LoginModal';
import CardView from '@/components/CardView';
import RoadmapView from '@/components/RoadmapView';
import Link from 'next/link';

type TabType = 'monthly' | 'roadmap';

export default function Home() {
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

  const fetchProjects = useCallback(async () => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
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
    try {
      const q = query(collection(db, 'agendas'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
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
    try {
      const q = query(
        collection(db, 'projectProgresses'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      // projectId가 있는 신규 데이터만 필터링
      const progressData = querySnapshot.docs
        .filter((doc) => doc.data().projectId)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as ProjectProgress[];
      setProjectProgresses(progressData);
    } catch (error) {
      console.error('Error fetching project progresses:', error);
    }
  }, []);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    // 한 번만 실행
    const initializeData = async () => {
      await Promise.all([
        fetchProjects(),
        fetchAgendas(),
        fetchProjectProgresses()
      ]);
    };

    initializeData();
  }, []); // 빈 의존성 배열 - 마운트 시 한 번만 실행

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CP Design
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04C] transition-colors font-medium text-sm"
                  >
                    관리자 페이지
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  로그인
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`pb-3 px-2 font-semibold transition-colors relative ${
                activeTab === 'monthly'
                  ? 'text-[#06C755]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
              {activeTab === 'monthly' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06C755]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`pb-3 px-2 font-semibold transition-colors relative ${
                activeTab === 'roadmap'
                  ? 'text-[#06C755]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Project Roadmap
              {activeTab === 'roadmap' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06C755]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {activeTab === 'monthly' ? (
          <>
            {/* Month Filter Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {monthlyData.map((data) => (
                  <button
                    key={data.month}
                    onClick={() => setSelectedMonth(data.month)}
                    className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      selectedMonth === data.month
                        ? 'bg-[#06C755] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {formatMonth(data.month)}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedMonth('all')}
                  className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                    selectedMonth === 'all'
                      ? 'bg-[#06C755] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  전체
                </button>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 16px center',
                  backgroundRepeat: 'no-repeat',
                  paddingRight: '40px'
                }}
              >
                <option value="all">Category</option>
                <option value="uiux">UI/UX</option>
                <option value="contents">Contents</option>
              </select>

              {/* Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as Tier | 'all')}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 16px center',
                  backgroundRepeat: 'no-repeat',
                  paddingRight: '40px'
                }}
              >
                <option value="all">Tier</option>
                <option value="s-tier">S Tier</option>
                <option value="ab-tier">A-B Tier</option>
                <option value="etc">etc</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Status | 'all')}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 16px center',
                  backgroundRepeat: 'no-repeat',
                  paddingRight: '40px'
                }}
              >
                <option value="all">Status</option>
                <option value="release">Release</option>
                <option value="inprogress">In Progress</option>
              </select>

              {/* Designer Filter */}
              <select
                value={selectedDesigner}
                onChange={(e) => setSelectedDesigner(e.target.value as Designer | 'all')}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 16px center',
                  backgroundRepeat: 'no-repeat',
                  paddingRight: '40px'
                }}
              >
                <option value="all">Designer</option>
                <option value="hyeri">🐰 장혜리</option>
                <option value="ayoung">🐶 김아영</option>
              </select>

              {/* Reset Button */}
              {(selectedCategory !== 'all' || selectedTier !== 'all' || selectedStatus !== 'all' || selectedDesigner !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#616161] rounded-full text-sm font-semibold transition-colors"
                >
                  초기화
                </button>
              )}
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
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#06C755] to-[#05B04C]" />
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 pl-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#06C755] to-[#05B04C] rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {formatMonth(currentAgenda.month)}
                        </h3>
                        <span className="px-3 py-1 bg-[#06C755]/10 text-[#06C755] text-xs font-bold rounded-full">
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

            {/* Content */}
            <CardView projects={filteredProjects} />
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
    </div>
  );
}
