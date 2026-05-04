'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthenticated } from '@/lib/auth';
import { Project, MonthlyData, ProjectProgress, MonthlyAgenda, Category, Tier, Status, Designer } from '@/lib/types';
import LoginModal from '@/components/LoginModal';
import PipelineCalendar from '@/components/PipelineCalendar';
import { loadAnalyticsData, getProjectAnalytics, AggregatedAnalytics } from '@/lib/analyticsData';

type TabType = 'monthly' | 'roadmap';

interface ProjectInsight {
  views: number;
  ctr: number;
  avgTime: string;
  label: string;
  labelEmoji: string;
  aiComment: string;
  pmInsight: string;
  uiuxInsight: string;
  productInsight: string;
  agenda: string[];
  topMetric: { name: string; value: number; color: string }[];
}

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
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'recent-release' | 'upcoming-release'>('default');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<Map<string, AggregatedAnalytics>>(new Map());

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

      // 월별 데이터 그룹화 (releaseDate 기준, 없으면 month 사용)
      const grouped = projectsData.reduce((acc, project) => {
        const projectMonth = project.releaseDate
          ? project.releaseDate.substring(0, 7) // YYYY-MM
          : project.month;

        const existingMonth = acc.find((m) => m.month === projectMonth);
        if (existingMonth) {
          existingMonth.projects.push(project);
        } else {
          acc.push({ month: projectMonth, projects: [project] });
        }
        return acc;
      }, [] as MonthlyData[]);

      // 월 순서대로 정렬 (최신순)
      grouped.sort((a, b) => b.month.localeCompare(a.month));
      setMonthlyData(grouped);

      // 최초 진입 시 가장 최신 월 자동 선택
      if (grouped.length > 0 && !selectedMonth) {
        setSelectedMonth(grouped[0].month);
      }
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
        fetchProjectProgresses(),
        loadAnalyticsData().then(setAnalyticsData)
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

  // 프로젝트의 실제 상태 계산 (릴리즈 날짜 기준 자동 전환)
  const getActualStatus = useCallback((project: Project): Status => {
    if (!project.releaseDate) {
      return project.status;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(project.releaseDate);
    releaseDate.setHours(0, 0, 0, 0);

    // 릴리즈 날짜가 지났으면 자동으로 Release로 전환
    if (releaseDate <= today && project.status === 'inprogress') {
      return 'release';
    }

    return project.status;
  }, []);

  // 프로젝트의 월 추출 (releaseDate 우선, 없으면 month 사용)
  const getProjectMonth = useCallback((project: Project): string => {
    if (project.releaseDate) {
      return project.releaseDate.substring(0, 7); // YYYY-MM
    }
    return project.month;
  }, []);

  // 필터링 및 정렬된 프로젝트 (useMemo로 최적화)
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const projectMonth = getProjectMonth(project);
      const actualStatus = getActualStatus(project);

      if (selectedMonth && selectedMonth !== 'all' && projectMonth !== selectedMonth) return false;
      if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
      if (selectedTier !== 'all' && project.tier !== selectedTier) return false;
      if (selectedStatus !== 'all' && actualStatus !== selectedStatus) return false;
      if (selectedDesigner !== 'all' && project.designer !== selectedDesigner) return false;
      return true;
    });

    // 정렬 적용
    if (sortBy === 'recent-release') {
      // 최근 릴리즈 순 (릴리즈된 프로젝트 중 releaseDate가 최신인 순)
      filtered = [...filtered].sort((a, b) => {
        const aStatus = getActualStatus(a);
        const bStatus = getActualStatus(b);
        if (aStatus === 'release' && bStatus !== 'release') return -1;
        if (aStatus !== 'release' && bStatus === 'release') return 1;
        if (a.releaseDate && b.releaseDate) {
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }
        if (a.releaseDate) return -1;
        if (b.releaseDate) return 1;
        return 0;
      });
    } else if (sortBy === 'upcoming-release') {
      // 릴리즈 임박 순 (In Progress 중 releaseDate가 가까운 순)
      filtered = [...filtered].sort((a, b) => {
        const today = new Date().getTime();
        const aStatus = getActualStatus(a);
        const bStatus = getActualStatus(b);
        if (aStatus === 'inprogress' && bStatus !== 'inprogress') return -1;
        if (aStatus !== 'inprogress' && bStatus === 'inprogress') return 1;
        if (a.releaseDate && b.releaseDate) {
          const diffA = Math.abs(new Date(a.releaseDate).getTime() - today);
          const diffB = Math.abs(new Date(b.releaseDate).getTime() - today);
          return diffA - diffB;
        }
        if (a.releaseDate) return -1;
        if (b.releaseDate) return 1;
        return 0;
      });
    }

    return filtered;
  }, [projects, selectedMonth, selectedCategory, selectedTier, selectedStatus, selectedDesigner, sortBy, getActualStatus, getProjectMonth]);

  // 월별 요약 지표 계산 (실제 분석 데이터 포함)
  const monthlyStats = useMemo(() => {
    let totalSessions = 0;
    let projectsWithData = 0;

    projects.forEach(project => {
      const analytics = getProjectAnalytics(analyticsData, project.link);
      if (analytics) {
        totalSessions += analytics.views;
        projectsWithData++;
      }
    });

    if (!selectedMonth || selectedMonth === 'all') {
      return {
        totalProjects: projects.length,
        monthProjects: 0,
        inProgressCount: projects.filter(p => getActualStatus(p) === 'inprogress').length,
        releaseCount: projects.filter(p => getActualStatus(p) === 'release').length,
        totalSessions,
        projectsWithData,
      };
    }

    const monthProjects = projects.filter(p => getProjectMonth(p) === selectedMonth);
    let monthSessions = 0;
    let monthProjectsWithData = 0;

    monthProjects.forEach(project => {
      const analytics = getProjectAnalytics(analyticsData, project.link);
      if (analytics) {
        monthSessions += analytics.views;
        monthProjectsWithData++;
      }
    });

    return {
      totalProjects: projects.length,
      monthProjects: monthProjects.length,
      inProgressCount: monthProjects.filter(p => getActualStatus(p) === 'inprogress').length,
      releaseCount: monthProjects.filter(p => getActualStatus(p) === 'release').length,
      totalSessions: monthSessions,
      projectsWithData: monthProjectsWithData,
    };
  }, [projects, selectedMonth, getActualStatus, getProjectMonth, analyticsData]);

  // 선택된 월의 아젠다 (useMemo로 최적화)
  const currentAgenda = useMemo(() => {
    return selectedMonth !== 'all'
      ? agendas.find(agenda => agenda.month === selectedMonth)
      : null;
  }, [agendas, selectedMonth]);

  const resetFilters = useCallback(() => {
    // 최신 월로 리셋
    if (monthlyData.length > 0) {
      setSelectedMonth(monthlyData[0].month);
    }
    setSelectedCategory('all');
    setSelectedTier('all');
    setSelectedStatus('all');
    setSelectedDesigner('all');
    setSortBy('default');
  }, [monthlyData]);

  // 인사이트 데이터 생성 (실제 분석 데이터 우선, 없으면 목업)
  const generateMockInsight = useCallback((project: Project): ProjectInsight => {
    // 실제 분석 데이터 가져오기
    const realAnalytics = getProjectAnalytics(analyticsData, project.link);

    const views = realAnalytics?.views || Math.floor(Math.random() * 10000) + 1000;
    const avgTime = realAnalytics?.avgTime || `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

    // CTR은 조회수 기반으로 추정 (실제 데이터가 없으므로)
    const ctr = realAnalytics ? Math.min(views / 1000, 15) : Math.random() * 15;

    const avgMinutes = parseInt(avgTime.split(':')[0]);

    let label = '';
    let labelEmoji = '';
    let aiComment = '';
    let pmInsight = '';
    let uiuxInsight = '';
    let productInsight = '';
    let agenda: string[] = [];

    if (ctr >= 10) {
      label = 'TOP TIER';
      labelEmoji = '🔥';
      aiComment = '현재 CTR 10% 이상의 탁월한 성과를 기록 중입니다.';
      pmInsight = '사용자 참여도가 매우 높으며, 목표 전환율을 150% 초과 달성했습니다.';
      uiuxInsight = '시각적 계층 구조와 CTA 배치가 효과적으로 작동하고 있습니다. 현재 디자인 패턴을 다른 프로젝트에도 적용할 것을 권장합니다.';
      productInsight = '이번 분기 핵심 지표를 달성했으며, 다음 스프린트에서 A/B 테스트를 통한 추가 최적화를 제안합니다.';
      agenda = [
        'A/B 테스트로 추가 최적화 가능성 탐색',
        '성공 패턴을 다른 프로젝트에 적용',
        '사용자 피드백 수집 및 분석'
      ];
    } else if (ctr >= 5) {
      label = 'PERFORMING WELL';
      labelEmoji = '✨';
      aiComment = '안정적인 성과를 보이고 있으나, 개선 여지가 있습니다.';
      pmInsight = 'CTR이 안정적이나, 체류시간 대비 전환율이 낮은 편입니다.';
      uiuxInsight = 'CTA 버튼의 위치를 상단으로 이동하고, 시각적 대비를 강화하면 클릭률을 7-8%p 개선할 수 있습니다.';
      productInsight = '다음 스프린트에서 정보 아키텍처 개선을 통해 사용자 여정(User Journey)을 단순화할 것을 제안합니다.';
      agenda = [
        'CTA 버튼 위치 및 디자인 개선',
        '정보 아키텍처 재설계 검토',
        '사용자 이탈 구간 분석'
      ];
    } else if (ctr >= 3) {
      label = 'AVERAGE';
      labelEmoji = '📊';
      aiComment = '평균적인 성과이나, 뚜렷한 개선 포인트가 존재합니다.';
      pmInsight = '현재 CTR은 평균 수준이며, 사용자 유입은 충분하나 전환으로 이어지지 않고 있습니다.';
      uiuxInsight = '시각적 계층 구조가 명확하지 않아 사용자가 핵심 액션을 찾기 어려워하고 있습니다. 주요 버튼의 대비를 높이고, 불필요한 요소를 제거하세요.';
      productInsight = '컨텐츠 우선순위를 재정의하고, 핵심 가치 제안(Value Proposition)을 명확히 전달할 필요가 있습니다.';
      agenda = [
        '시각적 계층 구조 명확화',
        '불필요한 UI 요소 제거',
        '핵심 가치 제안 재정의'
      ];
    } else {
      label = 'NEED REVISION';
      labelEmoji = '🛠';
      aiComment = '시각적 주목도는 높으나, 실제 클릭으로 이어지지 않고 있습니다.';
      pmInsight = 'CTR 3% 미만으로 목표 대비 50% 수준입니다. 썸네일의 클릭은 발생하지만, 상세 페이지에서 즉시 이탈이 발생하고 있습니다.';
      uiuxInsight = '상세 페이지의 정보 계층(Hierarchy)이 복잡하여 사용자 혼란을 야기하고 있습니다. CTA 버튼 컬러를 #313131로 변경하고, 주요 액션을 폴드 상단으로 이동하세요.';
      productInsight = '긴급 재설계가 필요합니다. 다음 스프린트에서 정보 구조 전면 재검토와 사용자 테스트를 진행할 것을 강력히 권장합니다.';
      agenda = [
        '긴급: 정보 구조 전면 재설계',
        'CTA 디자인 및 배치 개선',
        '사용자 테스트 진행 (최소 5명)',
        '경쟁사 벤치마킹 분석'
      ];
    }

    // 미니 차트 데이터
    const topMetric = [
      { name: '조회수', value: views, color: '#313131' },
      { name: 'CTR', value: ctr, color: '#00A6FF' },
      { name: '체류시간', value: avgMinutes, color: '#57B400' }
    ];

    return {
      views,
      ctr: parseFloat(ctr.toFixed(2)),
      avgTime,
      label,
      labelEmoji,
      aiComment,
      pmInsight,
      uiuxInsight,
      productInsight,
      agenda,
      topMetric
    };
  }, [analyticsData]);

  // 랜덤 이모지 생성
  const getRandomEmoji = () => {
    const emojis = ['(^Д^)/', '(⌐■_■)', '(◕‿◕)', '(づ｡◕‿‿◕｡)づ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(｡♥‿♥｡)', '(✿◠‿◠)'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  // 월간 통합 인사이트 생성 (필터링된 프로젝트 기반)
  const generateMonthlyInsight = useCallback((projects: Project[]) => {
    if (projects.length === 0) {
      return {
        avgCtr: 0,
        totalViews: 0,
        avgTime: '0분 0초',
        inProgressCount: 0,
        releaseCount: 0,
        isInProgressDominant: false,
        monthlyComment: '',
        pmComment: '',
        uiuxComment: '',
        priorities: []
      };
    }

    // 각 프로젝트의 목업 데이터 생성 및 집계
    const insights = projects.map(p => generateMockInsight(p));
    const avgCtr = insights.reduce((sum, i) => sum + i.ctr, 0) / insights.length;
    const totalViews = insights.reduce((sum, i) => sum + i.views, 0);
    const inProgressCount = projects.filter(p => p.status === 'inprogress').length;
    const releaseCount = projects.filter(p => p.status === 'release').length;
    const isInProgressDominant = inProgressCount > releaseCount;

    // 월간 코멘트 생성
    let monthlyComment = '';
    let pmComment = '';
    let uiuxComment = '';
    let priorities: string[] = [];

    if (isInProgressDominant) {
      // In Progress 중심 월
      monthlyComment = `이번 달은 ${inProgressCount}개의 프로젝트가 진행 중이며, 다음 달 릴리즈를 목표로 활발한 개발이 진행되고 있습니다.`;
      pmComment = '릴리즈 일정 준수를 위해 우선순위 관리가 중요합니다. 주간 체크인을 통해 블로커를 사전에 제거하세요.';
      uiuxComment = '디자인 QA와 프로토타입 검증에 충분한 시간을 할애하여, 릴리즈 후 재작업을 최소화하세요.';
      priorities = [
        '주간 체크인 및 블로커 제거',
        '디자인 QA 및 프로토타입 검증',
        '크로스 브라우저 테스트 준비',
        '릴리즈 노트 작성 시작'
      ];
    } else if (avgCtr >= 8) {
      // 고성과 월
      monthlyComment = `이번 달은 평균 CTR ${avgCtr.toFixed(1)}%로 목표를 크게 초과 달성했습니다. 전월 대비 UI 디자인의 통일성이 높아져 사용자 체류시간이 평균 10% 상승했습니다.`;
      pmComment = '목표를 150% 초과 달성했으며, 현재 전략이 효과적으로 작동하고 있습니다. 다음 분기에도 이 방향을 유지하세요.';
      uiuxComment = '시각적 일관성과 CTA 배치가 매우 효과적입니다. 이번 달의 디자인 패턴을 다른 프로젝트에도 확산할 것을 권장합니다.';
      priorities = [
        '성공 패턴 문서화 및 확산',
        'A/B 테스트로 추가 최적화',
        '사용자 피드백 심층 분석',
        '다음 분기 목표 상향 조정 검토'
      ];
    } else if (avgCtr >= 5) {
      // 안정 월
      monthlyComment = `이번 달은 평균 CTR ${avgCtr.toFixed(1)}%로 안정적인 성과를 보였습니다. 전반적으로 양호하나, 일부 개선 여지가 있습니다.`;
      pmComment = '목표 달성률 85% 수준으로 안정적이나, 10-15% 추가 개선 가능성이 있습니다.';
      uiuxComment = '정보 계층 구조를 명확히 하고, CTA 버튼의 시각적 대비를 강화하면 CTR을 7-8%p 개선할 수 있습니다.';
      priorities = [
        'CTA 버튼 디자인 및 배치 개선',
        '정보 아키텍처 재검토',
        '사용자 이탈 구간 분석',
        '경쟁사 벤치마킹'
      ];
    } else {
      // 개선 필요 월
      monthlyComment = `이번 달은 평균 CTR ${avgCtr.toFixed(1)}%로 목표에 미달했습니다. 사용자 유입은 충분하나 전환으로 이어지지 않고 있습니다.`;
      pmComment = '긴급 개선이 필요합니다. CTR이 목표 대비 60% 수준이며, 사용자 여정의 근본적인 재검토가 필요합니다.';
      uiuxComment = '시각적 계층이 불명확하여 사용자가 핵심 액션을 찾기 어려워하고 있습니다. 정보 구조 전면 재설계를 권장합니다.';
      priorities = [
        '긴급: 정보 구조 전면 재설계',
        '사용자 테스트 진행 (최소 5명)',
        'CTA 디자인 대비 강화',
        '경쟁사 벤치마킹 및 분석'
      ];
    }

    return {
      avgCtr: parseFloat(avgCtr.toFixed(2)),
      totalViews,
      avgTime: `${Math.floor(Math.random() * 10) + 1}분 ${Math.floor(Math.random() * 60)}초`,
      inProgressCount,
      releaseCount,
      isInProgressDominant,
      monthlyComment,
      pmComment,
      uiuxComment,
      priorities
    };
  }, [generateMockInsight]);

  // 월별 종합 인사이트 (필터링된 프로젝트 기반) - 메모이제이션
  const monthlyInsight = useMemo(() => {
    return generateMonthlyInsight(filteredProjects);
  }, [filteredProjects, generateMonthlyInsight]);

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
                  Pipeline Calendar
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
            {/* 월별 요약 지표 카드 */}
            {selectedMonth && selectedMonth !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-xs text-gray-600 mb-2 font-medium">해당 월 프로젝트</div>
                  <div className="text-3xl font-bold text-[#313131]">{monthlyStats.monthProjects}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-xs text-gray-600 mb-2 font-medium">총 세션 수</div>
                  <div className="text-3xl font-bold text-[#00A6FF]">{monthlyStats.totalSessions.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">{monthlyStats.projectsWithData}개 프로젝트 데이터</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-xs text-gray-600 mb-2 font-medium">진행 중</div>
                  <div className="text-3xl font-bold text-[#FF9D00]">{monthlyStats.inProgressCount}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-xs text-gray-600 mb-2 font-medium">릴리즈</div>
                  <div className="text-3xl font-bold text-[#00BC7D]">{monthlyStats.releaseCount}</div>
                </div>
              </div>
            )}

            {/* 이달의 종합 인사이트 - Accordion */}
            <div className="mb-10">
              <button
                onClick={() => setIsMonthlyReportOpen(!isMonthlyReportOpen)}
                className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:border-[#313131] transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#313131] mb-1 flex items-center gap-2">
                      <span className="text-xl leading-none inline-block align-middle">📊</span>
                      <span>이달의 종합 인사이트</span>
                    </h3>
                    <p className="text-sm text-gray-600">전체 프로젝트 성과 분석 및 개선 제안</p>
                  </div>
                  <svg
                    className={`w-6 h-6 text-[#313131] transition-transform ${isMonthlyReportOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isMonthlyReportOpen && (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  {monthlyInsight.avgCtr === 0 ? (
                    // 데이터 없음 상태
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">선택한 필터 조건에 해당하는 프로젝트가 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      {/* 종합 총평 */}
                      <div>
                        <h4 className="text-sm font-bold text-[#313131] mb-3">🎯 종합 총평</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {monthlyInsight.monthlyComment}
                        </p>
                      </div>

                      {/* 2단 분할 레이아웃 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 좌측: Agenda */}
                        <div>
                          <h4 className="text-sm font-bold text-[#313131] mb-3 flex items-center gap-2">
                            <span className="text-base leading-none inline-block align-middle">📋</span>
                            <span>우선순위 태스크</span>
                          </h4>
                          <ul className="space-y-2">
                            {monthlyInsight.priorities.map((priority, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-[#313131] font-bold">{idx + 1}.</span>
                                <span className="text-gray-700">{priority}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 우측: Visual Screen (미니 차트) */}
                        <div>
                          <h4 className="text-sm font-bold text-[#313131] mb-3 flex items-center gap-2">
                            <span className="text-base leading-none inline-block align-middle">📈</span>
                            <span>주요 지표</span>
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">평균 CTR</span>
                                <span className="font-bold text-[#313131]">{monthlyInsight.avgCtr}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00A6FF]" style={{ width: `${Math.min(monthlyInsight.avgCtr * 6.67, 100)}%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">총 조회수</span>
                                <span className="font-bold text-[#313131]">{monthlyInsight.totalViews.toLocaleString()}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#57B400]" style={{ width: '85%' }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">프로젝트 현황</span>
                                <span className="font-bold text-[#313131]">
                                  {monthlyInsight.isInProgressDominant ?
                                    `진행중 ${monthlyInsight.inProgressCount}` :
                                    `릴리즈 ${monthlyInsight.releaseCount}`}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#313131]" style={{ width: `${monthlyInsight.isInProgressDominant ? (monthlyInsight.inProgressCount / (monthlyInsight.inProgressCount + monthlyInsight.releaseCount)) * 100 : (monthlyInsight.releaseCount / (monthlyInsight.inProgressCount + monthlyInsight.releaseCount)) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PM/UIUX 전문가 관점 */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-bold text-[#313131] mb-3 flex items-center gap-2">
                          <span className="text-base leading-none inline-block align-middle">💬</span>
                          <span>전문가 관점</span>
                        </h4>
                        <div className="space-y-3">
                          {/* PM Comment */}
                          <div className="bg-[#00A6FF]/5 rounded-lg p-4 border-l-4 border-[#00A6FF]">
                            <div className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#00A6FF] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                                PM
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-700 leading-relaxed">{monthlyInsight.pmComment}</p>
                              </div>
                            </div>
                          </div>

                          {/* UIUX Comment */}
                          <div className="bg-[#F83BAA]/5 rounded-lg p-4 border-l-4 border-[#F83BAA]">
                            <div className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#F83BAA] flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">
                                UX
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-700 leading-relaxed">{monthlyInsight.uiuxComment}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 월별 필터 버튼 */}
            <div className="mb-4">
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
            <div className="mb-6 bg-[#F5F5F5] rounded-[12px] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
              {/* Left: Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sort Filter */}
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'default' | 'recent-release' | 'upcoming-release')}
                    className="px-4 py-2 pr-9 bg-white hover:bg-gray-50 border-0 rounded-md text-xs font-medium text-[#1a1a1a] appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300 hover:shadow-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <option value="default">기본 순서</option>
                    <option value="recent-release">최근 릴리즈 순</option>
                    <option value="upcoming-release">릴리즈 임박 순</option>
                  </select>
                </div>

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

            {/* Monthly Agenda - Accordion */}
            {currentAgenda && (
              <div className="mb-8">
                <button
                  onClick={() => setIsAgendaOpen(!isAgendaOpen)}
                  className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:border-[#313131] transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#313131] to-[#1a1a1a] rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#313131] mb-1">
                          {formatMonth(currentAgenda.month)} 아젠다
                        </h3>
                        <p className="text-sm text-gray-600">이번 달 주요 업무 계획 및 목표</p>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-[#313131] transition-transform flex-shrink-0 ${isAgendaOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isAgendaOpen && (
                  <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
                    <div className="space-y-3">
                      {currentAgenda.content.split('\n\n').map((section, index) => (
                        <div key={index} className="pl-4 border-l-2 border-[#313131]/20">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                            {section}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

                const actualStatus = getActualStatus(project);
                const statusStyle = actualStatus === 'release'
                  ? { backgroundColor: 'rgba(0, 188, 125, 0.08)', color: '#00BC7D', borderColor: 'rgba(0, 188, 125, 0.2)' }
                  : { backgroundColor: 'rgba(255, 157, 0, 0.08)', color: '#FF9D00', borderColor: 'rgba(255, 157, 0, 0.2)' };

                // 릴리즈 날짜 포맷팅
                const formatReleaseDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                };

                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    {/* 상단: 릴리즈 예정일 (모든 상태에서 동일한 스타일) */}
                    {project.releaseDate && (
                      <div className="mb-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">릴리즈: {formatReleaseDate(project.releaseDate)}</span>
                        </div>
                      </div>
                    )}

                    {/* 제목 + 뱃지들 */}
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
                          {actualStatus === 'release' ? 'RELEASE' : 'IN PROGRESS'}
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
          <PipelineCalendar projectProgresses={projectProgresses} />
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
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {/* 썸네일 */}
              {selectedProject.detailImages && selectedProject.detailImages.length > 0 && (
                <div className="w-full h-56 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={selectedProject.detailImages[0]}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 성과 지표 */}
              {(() => {
                const insight = generateMockInsight(selectedProject);
                const hasData = getProjectAnalytics(analyticsData, selectedProject.link) !== null;
                const actualStatus = getActualStatus(selectedProject);
                const isInProgress = actualStatus === 'inprogress';

                return (
                  <>
                    {/* 숫자 대시보드 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                        <div className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">세션</div>
                        {hasData ? (
                          <div className="text-2xl font-bold text-[#313131]">{insight.views.toLocaleString()}</div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="text-xl font-bold text-gray-300">–</div>
                            {isInProgress && (
                              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span>⏳</span>
                                <span>집계 예정</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                        <div className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">CTR</div>
                        {hasData ? (
                          <div className="text-2xl font-bold text-[#313131]">{insight.ctr.toFixed(2)}%</div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="text-xl font-bold text-gray-300">–</div>
                            {isInProgress && (
                              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span>⏳</span>
                                <span>집계 예정</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                        <div className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">체류시간</div>
                        {hasData ? (
                          <div className="text-xl font-bold text-[#313131]">{insight.avgTime}</div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="text-xl font-bold text-gray-300">–</div>
                            {isInProgress && (
                              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span>⏳</span>
                                <span>집계 예정</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 성과 분석 */}
                    {hasData && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-[#313131] uppercase tracking-wide">Performance Insight</h4>

                        {/* 단일 분석 카드 */}
                        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">{insight.labelEmoji}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-[#313131] mb-1">{insight.label}</div>
                              <p className="text-xs text-gray-600 leading-relaxed">{insight.aiComment}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasData && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-6 border border-gray-200">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="text-2xl">📊</div>
                          {isInProgress ? (
                            <>
                              <p className="text-sm font-semibold text-gray-700">릴리즈 후 데이터가 업데이트됩니다</p>
                              <p className="text-xs text-gray-500">프로젝트가 출시되면 실시간 성과 지표를 확인할 수 있습니다</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-gray-700">데이터 확인 중</p>
                              <p className="text-xs text-gray-500">분석 데이터를 집계하고 있습니다</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 프로젝트 정보 */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-[#313131] uppercase tracking-wide">Project Info</h4>

                      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm space-y-3">
                        {selectedProject.description && (
                          <div>
                            <div className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">설명</div>
                            <p className="text-xs text-gray-700 leading-relaxed">{selectedProject.description}</p>
                          </div>
                        )}

                        {selectedProject.releaseDate && (
                          <div>
                            <div className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">릴리즈</div>
                            <p className="text-xs text-[#313131] font-medium">{selectedProject.releaseDate}</p>
                          </div>
                        )}

                        {selectedProject.link && (
                          <div>
                            <div className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">링크</div>
                            <a
                              href={selectedProject.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#313131] hover:underline break-all"
                            >
                              {selectedProject.link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 개선 아이템 (데이터가 있을 때만) */}
                    {hasData && insight.agenda.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-[#313131] uppercase tracking-wide">Action Items</h4>
                        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                          <ul className="space-y-2">
                            {insight.agenda.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-gray-400 mt-0.5">•</span>
                                <span className="text-gray-700 leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 지표 분포 */}
                    {hasData && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-[#313131] uppercase tracking-wide">Metrics</h4>
                        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm space-y-3">
                          {insight.topMetric.map((metric, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between text-[10px] mb-1.5">
                                <span className="text-gray-500 font-medium uppercase tracking-wide">{metric.name}</span>
                                <span className="font-bold text-[#313131]">
                                  {metric.name === 'CTR' ? `${metric.value.toFixed(2)}%` : metric.value.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                                <div
                                  className="h-full"
                                  style={{
                                    backgroundColor: metric.color,
                                    width: metric.name === 'CTR' ? `${metric.value * 6.67}%` : '80%'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
