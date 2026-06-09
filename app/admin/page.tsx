'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthenticated } from '@/lib/auth';
import { Project, Designer, Status, Category, Tier, DESIGNERS, MonthlyAgenda, ProjectProgress, RoadmapProject } from '@/lib/types';

type AdminTabType = 'insights' | 'project';

export default function AdminPage() {
  const router = useRouter();
  const [adminTab, setAdminTab] = useState<AdminTabType>('insights');
  const [projects, setProjects] = useState<Project[]>([]);
  const [agendas, setAgendas] = useState<MonthlyAgenda[]>([]);
  const [roadmapProjects, setRoadmapProjects] = useState<RoadmapProject[]>([]);
  const [projectProgresses, setProjectProgresses] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<MonthlyAgenda | null>(null);
  const [editingRoadmapProject, setEditingRoadmapProject] = useState<RoadmapProject | null>(null);
  const [editingProgress, setEditingProgress] = useState<ProjectProgress | null>(null);
  const [selectedRoadmapProjectId, setSelectedRoadmapProjectId] = useState<string>('');
  const [calViewMonth, setCalViewMonth] = useState<Date>(new Date());

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [designer, setDesigner] = useState<Designer>('hyeri');
  const [status, setStatus] = useState<Status>('release');
  const [category, setCategory] = useState<Category>('uiux');
  const [tier, setTier] = useState<Tier>('s-tier');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [releaseDate, setReleaseDate] = useState('');
  const [hasDetail, setHasDetail] = useState(false);
  const [detailContent, setDetailContent] = useState('');
  const [detailImages, setDetailImages] = useState('');

  // 아젠다 Form state
  const [agendaMonth, setAgendaMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [agendaContent, setAgendaContent] = useState('');

  // 로드맵 프로젝트 Form state
  const [roadmapProjectName, setRoadmapProjectName] = useState('');
  const [roadmapDesigner, setRoadmapDesigner] = useState<Designer>('hyeri');
  const [roadmapDescription, setRoadmapDescription] = useState('');
  const [roadmapStartDate, setRoadmapStartDate] = useState('');
  const [roadmapEndDate, setRoadmapEndDate] = useState('');

  // 프로젝트 진행 작업 Form state
  const [progressTaskName, setProgressTaskName] = useState('');
  const [progressStatus, setProgressStatus] = useState<'nextup' | 'inprogress' | 'completed' | 'pending' | 'paused'>('inprogress');
  const [progressDescription, setProgressDescription] = useState('');
  const [progressStartDate, setProgressStartDate] = useState('');
  const [progressEndDate, setProgressEndDate] = useState('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

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

  const fetchRoadmapProjects = useCallback(async () => {
    try {
      const q = query(collection(db, 'roadmapProjects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as RoadmapProject[];
      setRoadmapProjects(projectsData);
    } catch (error) {
      console.error('Error fetching roadmap projects:', error);
    }
  }, []);

  const fetchProjectProgresses = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'projectProgresses'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
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
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    const initializeData = async () => {
      await Promise.all([
        fetchProjects(),
        fetchAgendas(),
        fetchRoadmapProjects(),
        fetchProjectProgresses()
      ]);
    };

    initializeData();
  }, [router, fetchProjects, fetchAgendas, fetchRoadmapProjects, fetchProjectProgresses]);

  // 대시보드 요약 지표
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalProjects = projects.length;
    const currentMonthProjects = projects.filter(p => p.month === currentMonth).length;
    const inProgressCount = projects.filter(p => p.status === 'inprogress').length;

    // 이번 달 릴리즈 예정 건수
    const currentMonthReleases = projects.filter(p => {
      if (!p.releaseDate) return false;
      const releaseMonth = p.releaseDate.substring(0, 7); // YYYY-MM
      return releaseMonth === currentMonth && p.status === 'inprogress';
    }).length;

    return {
      totalProjects,
      currentMonthProjects,
      inProgressCount,
      currentMonthReleases
    };
  }, [projects]);

  // 캘린더 뷰용 — 현재 calViewMonth 기준으로 날짜 배열 생성
  const calendarGrid = useMemo(() => {
    const year = calViewMonth.getFullYear();
    const month = calViewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [calViewMonth]);

  const projectsByDate = useMemo(() => {
    const map = new Map<string, Project[]>();
    projects.forEach((p) => {
      const key = p.releaseDate || `${p.month}-01`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [projects]);

  const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setDesigner('hyeri');
    setStatus('release');
    setCategory('uiux');
    setTier('s-tier');
    const now = new Date();
    setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    setReleaseDate('');
    setHasDetail(false);
    setDetailContent('');
    setDetailImages('');
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const projectData: any = {
        title,
        description,
        designer,
        status,
        category,
        tier,
        month,
        hasDetail,
        createdAt: new Date(),
      };

      if (link && link.trim()) {
        projectData.link = link;
      }

      if (releaseDate && releaseDate.trim()) {
        projectData.releaseDate = releaseDate;
      }

      if (hasDetail && detailContent) {
        projectData.detailContent = detailContent;
      }

      if (hasDetail && detailImages) {
        const imageArray = detailImages.split('\n').filter(url => url.trim());
        if (imageArray.length > 0) {
          projectData.detailImages = imageArray;
        }
      }

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), projectData);
        alert('프로젝트가 수정되었습니다!');
      } else {
        await addDoc(collection(db, 'projects'), projectData);
        alert('프로젝트가 추가되었습니다!');
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error adding/updating project:', error);
      alert('프로젝트 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setLink(project.link || '');
    setDesigner(project.designer);
    setStatus(project.status);
    setCategory(project.category);
    setTier(project.tier || 's-tier');
    setMonth(project.month);
    setReleaseDate(project.releaseDate || '');
    setHasDetail(project.hasDetail || false);
    setDetailContent(project.detailContent || '');
    setDetailImages(project.detailImages?.join('\n') || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'projects', id));
      alert('프로젝트가 삭제되었습니다.');
      fetchProjects();
      if (editingProject?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAgendaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const agendaData = {
        month: agendaMonth,
        content: agendaContent,
        createdAt: new Date(),
      };

      if (editingAgenda) {
        await updateDoc(doc(db, 'agendas', editingAgenda.id), agendaData);
        alert('아젠다가 수정되었습니다!');
      } else {
        await addDoc(collection(db, 'agendas'), agendaData);
        alert('아젠다가 추가되었습니다!');
      }

      setAgendaMonth(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      });
      setAgendaContent('');
      setEditingAgenda(null);
      fetchAgendas();
    } catch (error) {
      console.error('Error adding/updating agenda:', error);
      alert('아젠다 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgendaEdit = (agenda: MonthlyAgenda) => {
    setEditingAgenda(agenda);
    setAgendaMonth(agenda.month);
    setAgendaContent(agenda.content);
  };

  const handleAgendaDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'agendas', id));
      alert('아젠다가 삭제되었습니다.');
      fetchAgendas();
    } catch (error) {
      console.error('Error deleting agenda:', error);
      alert('아젠다 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleRoadmapProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const projectData: any = {
        projectName: roadmapProjectName,
        designer: roadmapDesigner,
        description: roadmapDescription,
        startDate: roadmapStartDate,
        endDate: roadmapEndDate,
        createdAt: new Date(),
      };

      if (editingRoadmapProject) {
        await updateDoc(doc(db, 'roadmapProjects', editingRoadmapProject.id), projectData);
        alert('로드맵 프로젝트가 수정되었습니다!');
      } else {
        const docRef = await addDoc(collection(db, 'roadmapProjects'), projectData);
        setSelectedRoadmapProjectId(docRef.id);
        alert('로드맵 프로젝트가 추가되었습니다!');
      }

      setRoadmapProjectName('');
      setRoadmapDesigner('hyeri');
      setRoadmapDescription('');
      setRoadmapStartDate('');
      setRoadmapEndDate('');
      setEditingRoadmapProject(null);
      fetchRoadmapProjects();
    } catch (error) {
      console.error('Error adding/updating roadmap project:', error);
      alert('로드맵 프로젝트 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoadmapProjectId) {
      alert('프로젝트를 먼저 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedProject = roadmapProjects.find(p => p.id === selectedRoadmapProjectId);
      if (!selectedProject) {
        alert('프로젝트를 찾을 수 없습니다.');
        return;
      }

      const progressData: any = {
        projectId: selectedRoadmapProjectId,
        projectName: selectedProject.projectName,
        designer: selectedProject.designer,
        taskName: progressTaskName,
        status: progressStatus,
        startDate: progressStartDate,
        endDate: progressEndDate,
        progress: progressPercent,
        createdAt: new Date(),
      };

      if (progressDescription) progressData.description = progressDescription;

      if (editingProgress) {
        await updateDoc(doc(db, 'projectProgresses', editingProgress.id), progressData);
        alert('프로젝트 작업이 수정되었습니다!');
      } else {
        await addDoc(collection(db, 'projectProgresses'), progressData);
        alert('프로젝트 작업이 추가되었습니다!');
      }

      setProgressTaskName('');
      setProgressStatus('inprogress');
      setProgressDescription('');
      setProgressStartDate('');
      setProgressEndDate('');
      setProgressPercent(0);
      setEditingProgress(null);
      fetchProjectProgresses();
    } catch (error) {
      console.error('Error adding/updating project progress:', error);
      alert('프로젝트 작업 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoadmapProjectEdit = (project: RoadmapProject) => {
    setEditingRoadmapProject(project);
    setRoadmapProjectName(project.projectName);
    setRoadmapDesigner(project.designer);
    setRoadmapDescription(project.description || '');
    setRoadmapStartDate(project.startDate || '');
    setRoadmapEndDate(project.endDate || '');
  };

  const handleRoadmapProjectDelete = async (id: string) => {
    if (!confirm('프로젝트를 삭제하시겠습니까? 연결된 모든 작업도 함께 삭제됩니다.')) return;

    try {
      const relatedProgresses = projectProgresses.filter(p => p.projectId === id);
      for (const progress of relatedProgresses) {
        await deleteDoc(doc(db, 'projectProgresses', progress.id));
      }

      await deleteDoc(doc(db, 'roadmapProjects', id));
      alert('프로젝트가 삭제되었습니다.');
      fetchRoadmapProjects();
      fetchProjectProgresses();
    } catch (error) {
      console.error('Error deleting roadmap project:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleProgressEdit = (progress: ProjectProgress) => {
    setEditingProgress(progress);
    setSelectedRoadmapProjectId(progress.projectId);
    setProgressTaskName(progress.taskName);
    setProgressStatus(progress.status);
    setProgressDescription(progress.description || '');
    setProgressStartDate(progress.startDate);
    setProgressEndDate(progress.endDate);
    setProgressPercent(progress.progress || 0);
  };

  const handleProgressDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'projectProgresses', id));
      alert('프로젝트 작업이 삭제되었습니다.');
      fetchProjectProgresses();
    } catch (error) {
      console.error('Error deleting project progress:', error);
      alert('프로젝트 작업 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatMonth = useCallback((month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${parseInt(monthNum)}월`;
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-[#313131]">CP Design Admin.</h1>

              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setAdminTab('insights')}
                  className={`text-sm font-medium transition-colors ${
                    adminTab === 'insights'
                      ? 'text-[#313131]'
                      : 'text-gray-400 hover:text-[#313131]'
                  }`}
                >
                  Monthly Insights
                </button>
                <button
                  onClick={() => setAdminTab('project')}
                  className={`text-sm font-medium transition-colors ${
                    adminTab === 'project'
                      ? 'text-[#313131]'
                      : 'text-gray-400 hover:text-[#313131]'
                  }`}
                >
                  Pipeline Projects
                </button>
              </nav>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-[#313131] text-white rounded-md text-xs font-medium hover:bg-[#1a1a1a] transition-all duration-200"
            >
              프론트 보기
            </a>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-xs text-gray-600 mb-2 font-medium">총 프로젝트 수</div>
            <div className="text-3xl font-bold text-[#313131]">{dashboardStats.totalProjects}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-xs text-gray-600 mb-2 font-medium">이번 달 프로젝트</div>
            <div className="text-3xl font-bold text-[#313131]">{dashboardStats.currentMonthProjects}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-xs text-gray-600 mb-2 font-medium">진행 중</div>
            <div className="text-3xl font-bold text-[#FF9D00]">{dashboardStats.inProgressCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-xs text-gray-600 mb-2 font-medium">이번 달 릴리즈 예정</div>
            <div className="text-3xl font-bold text-[#00BC7D]">{dashboardStats.currentMonthReleases}</div>
          </div>
        </div>

        {/* Content */}
        {adminTab === 'insights' && (
          <div className="space-y-8">
            {/* Monthly Agenda Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#313131] mb-6">
                {editingAgenda ? '✏️ 월별 아젠다 수정' : '📌 월별 주요 아젠다 추가'}
              </h2>
              <form onSubmit={handleAgendaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    월 *
                  </label>
                  <input
                    type="month"
                    value={agendaMonth}
                    onChange={(e) => setAgendaMonth(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주요 아젠다 내용 *
                  </label>
                  <textarea
                    value={agendaContent}
                    onChange={(e) => setAgendaContent(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                    placeholder="이번 달의 주요 아젠다를 입력하세요"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#313131] text-white py-2.5 px-4 rounded-lg hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? '저장 중...' : editingAgenda ? '수정하기' : '추가하기'}
                  </button>
                  {editingAgenda && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAgenda(null);
                        const now = new Date();
                        setAgendaMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                        setAgendaContent('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-[#313131] mb-4">등록된 아젠다 ({agendas.length})</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {agendas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      등록된 아젠다가 없습니다.
                    </div>
                  ) : (
                    agendas.map((agenda) => (
                      <div
                        key={agenda.id}
                        className="bg-[#FAFAFA] rounded-lg p-4 hover:shadow-md transition-all border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-semibold text-[#313131]">
                            {formatMonth(agenda.month)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAgendaEdit(agenda)}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleAgendaDelete(agenda.id)}
                              className="px-3 py-1.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{agenda.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 2단 레이아웃: 캘린더 뷰 + 수정 폼 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 좌측: 캘린더 뷰 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {/* 캘린더 헤더 */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#313131]">
                    {calViewMonth.getFullYear()}년 {calViewMonth.getMonth() + 1}월
                    <span className="text-sm font-normal text-gray-400 ml-2">({projects.length}개 프로젝트)</span>
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalViewMonth(new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCalViewMonth(new Date())}
                      className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      오늘
                    </button>
                    <button
                      onClick={() => setCalViewMonth(new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 mb-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <div
                      key={d}
                      className={`text-center text-xs font-semibold py-1.5 ${
                        i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {calendarGrid.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} className="bg-white min-h-[72px]" />;
                    }
                    const key = toKey(date);
                    const dayProjects = projectsByDate.get(key) || [];
                    const isToday = toKey(date) === toKey(new Date());
                    const isSun = date.getDay() === 0;
                    const isSat = date.getDay() === 6;

                    return (
                      <div
                        key={key}
                        className="bg-white min-h-[72px] p-1.5 flex flex-col gap-0.5"
                      >
                        <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                          isToday
                            ? 'bg-[#313131] text-white'
                            : isSun
                            ? 'text-red-400'
                            : isSat
                            ? 'text-blue-400'
                            : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        {dayProjects.slice(0, 2).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleEdit(p)}
                            title={p.title}
                            className={`text-[9px] font-medium px-1 py-0.5 rounded truncate cursor-pointer leading-tight ${
                              editingProject?.id === p.id
                                ? 'bg-[#313131] text-white'
                                : p.status === 'release'
                                ? 'bg-[#00BC7D]/10 text-[#00875A]'
                                : p.status === 'review'
                                ? 'bg-[#8280FF]/10 text-[#5B57CC]'
                                : p.status === 'pending'
                                ? 'bg-gray-100 text-gray-500'
                                : p.status === 'cancelled'
                                ? 'bg-red-50 text-red-400'
                                : 'bg-[#FF9D00]/10 text-[#CC7A00]'
                            }`}
                          >
                            {p.title}
                          </div>
                        ))}
                        {dayProjects.length > 2 && (
                          <div className="text-[9px] text-gray-400 font-medium px-1">
                            +{dayProjects.length - 2}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 범례 */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#00BC7D]/20" />
                    <span className="text-xs text-gray-500">Release</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#FF9D00]/20" />
                    <span className="text-xs text-gray-500">In Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
                    <span className="text-xs text-gray-500">Pending</span>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">클릭하면 수정됩니다</span>
                </div>
              </div>

              {/* 우측: 수정/추가 폼 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#313131]">
                    {editingProject ? '✏️ 프로젝트 수정' : '➕ 새 프로젝트 추가'}
                  </h2>
                  {editingProject && (
                    <button
                      onClick={resetForm}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      새로 만들기
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프로젝트 제목 *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      placeholder="예: 새로운 대시보드 디자인"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명 *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      placeholder="프로젝트에 대한 간단한 설명"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      링크 (선택)
                    </label>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        디자이너 *
                      </label>
                      <select
                        value={designer}
                        onChange={(e) => setDesigner(e.target.value as Designer)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      >
                        <option value="hyeri">{DESIGNERS.hyeri.emoji} {DESIGNERS.hyeri.name}</option>
                        <option value="ayoung">{DESIGNERS.ayoung.emoji} {DESIGNERS.ayoung.name}</option>
                        <option value="unassigned">{DESIGNERS.unassigned.emoji} {DESIGNERS.unassigned.name}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        상태 *
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Status)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      >
                        <option value="release">✅ Release</option>
                        <option value="inprogress">🔄 In Progress</option>
                        <option value="review">👀 Review</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        카테고리 *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      >
                        <option value="uiux">UI/UX</option>
                        <option value="contents">Contents</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        우선순위 *
                      </label>
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as Tier)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      >
                        <option value="s-tier">S Tier</option>
                        <option value="ab-tier">A-B Tier</option>
                        <option value="etc">etc</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        월 *
                      </label>
                      <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        릴리즈 예정일
                      </label>
                      <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={hasDetail}
                        onChange={(e) => setHasDetail(e.target.checked)}
                        className="w-4 h-4 text-[#313131] border-gray-300 rounded focus:ring-[#313131]"
                      />
                      <span className="text-sm font-medium text-gray-700">상세 페이지 생성</span>
                    </label>

                    {hasDetail && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            상세 내용
                          </label>
                          <textarea
                            value={detailContent}
                            onChange={(e) => setDetailContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                            placeholder="프로젝트 상세 설명"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            이미지 URL (한 줄에 하나씩)
                          </label>
                          <textarea
                            value={detailImages}
                            onChange={(e) => setDetailImages(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Floating Save Button */}
                  <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 px-6 -mb-6 pb-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#313131] text-white py-3 px-4 rounded-lg hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
                    >
                      {isSubmitting ? '저장 중...' : editingProject ? '✓ 수정 완료' : '+ 프로젝트 추가'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Projects Tab */}
        {adminTab === 'project' && (
          <div className="space-y-8">
            {/* 로드맵 프로젝트 등록 */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#313131] mb-6">
                {editingRoadmapProject ? '✏️ 프로젝트 수정' : '📊 로드맵 프로젝트 등록'}
              </h2>
              <form onSubmit={handleRoadmapProjectSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프로젝트명 *
                    </label>
                    <input
                      type="text"
                      value={roadmapProjectName}
                      onChange={(e) => setRoadmapProjectName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      placeholder="예: LFSQ 커뮤니티 앱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      담당 디자이너 *
                    </label>
                    <select
                      value={roadmapDesigner}
                      onChange={(e) => setRoadmapDesigner(e.target.value as Designer)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                    >
                      <option value="hyeri">{DESIGNERS.hyeri.emoji} {DESIGNERS.hyeri.name}</option>
                      <option value="ayoung">{DESIGNERS.ayoung.emoji} {DESIGNERS.ayoung.name}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프로젝트 시작일
                    </label>
                    <input
                      type="date"
                      value={roadmapStartDate}
                      onChange={(e) => setRoadmapStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프로젝트 종료일
                    </label>
                    <input
                      type="date"
                      value={roadmapEndDate}
                      onChange={(e) => setRoadmapEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    프로젝트 설명
                  </label>
                  <textarea
                    value={roadmapDescription}
                    onChange={(e) => setRoadmapDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                    placeholder="프로젝트 간단 설명"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#313131] text-white py-2.5 px-4 rounded-lg hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? '저장 중...' : editingRoadmapProject ? '수정하기' : '프로젝트 등록'}
                  </button>
                  {editingRoadmapProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoadmapProject(null);
                        setRoadmapProjectName('');
                        setRoadmapDesigner('hyeri');
                        setRoadmapDescription('');
                        setRoadmapStartDate('');
                        setRoadmapEndDate('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 프로젝트별 작업 관리 */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#313131] mb-6">
                프로젝트별 작업 관리
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작업을 추가할 프로젝트 선택 *
                </label>
                <select
                  value={selectedRoadmapProjectId}
                  onChange={(e) => setSelectedRoadmapProjectId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-[#313131] font-medium"
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {roadmapProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName} ({DESIGNERS[project.designer].name})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoadmapProjectId && (
                <form onSubmit={handleProgressSubmit} className="space-y-4 p-6 bg-[#FAFAFA] rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-[#313131] mb-4">
                    {editingProgress ? '작업 수정' : '새 작업 추가'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        작업명 *
                      </label>
                      <input
                        type="text"
                        value={progressTaskName}
                        onChange={(e) => setProgressTaskName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                        placeholder="예: 레퍼런스 서치"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        상태 *
                      </label>
                      <select
                        value={progressStatus}
                        onChange={(e) => setProgressStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      >
                        <option value="nextup">Next Up</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작일 *
                      </label>
                      <input
                        type="date"
                        value={progressStartDate}
                        onChange={(e) => setProgressStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료일 *
                      </label>
                      <input
                        type="date"
                        value={progressEndDate}
                        onChange={(e) => setProgressEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상세 설명
                    </label>
                    <textarea
                      value={progressDescription}
                      onChange={(e) => setProgressDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                      placeholder="작업 간단 설명"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      진척률 (%)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={progressPercent}
                        onChange={(e) => setProgressPercent(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#313131]"
                      />
                      <div className="flex-shrink-0 w-16">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={progressPercent}
                          onChange={(e) => setProgressPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full px-2 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#313131] focus:border-transparent"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#313131] to-[#1a1a1a] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#313131] text-white py-2.5 px-4 rounded-lg hover:bg-[#1a1a1a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isSubmitting ? '저장 중...' : editingProgress ? '작업 수정' : '작업 추가'}
                    </button>
                    {editingProgress && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProgress(null);
                          setProgressTaskName('');
                          setProgressStatus('inprogress');
                          setProgressDescription('');
                          setProgressStartDate('');
                          setProgressEndDate('');
                          setProgressPercent(0);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* 등록된 프로젝트 목록 */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#313131] mb-6">
                등록된 프로젝트 ({roadmapProjects.length})
              </h2>

              {roadmapProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  등록된 프로젝트가 없습니다.
                </div>
              ) : (
                <div className="space-y-6">
                  {roadmapProjects.map((project) => {
                    const projectTasks = projectProgresses.filter(p => p.projectId === project.id);
                    const designerInfo = DESIGNERS[project.designer];

                    return (
                      <div key={project.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-[#FAFAFA] p-5 border-b border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-[#313131] mb-2">{project.projectName}</h3>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{designerInfo.emoji}</span>
                                  <span className="text-sm font-medium text-gray-700">{designerInfo.name}</span>
                                </div>
                                <span className="text-xs px-2.5 py-1 bg-white rounded-full text-gray-600 font-medium border border-gray-200">
                                  작업 {projectTasks.length}개
                                </span>
                              </div>
                              {project.description && (
                                <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRoadmapProjectEdit(project)}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleRoadmapProjectDelete(project.id)}
                                className="px-3 py-1.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>

                        {projectTasks.length > 0 && (
                          <div className="p-5 bg-white space-y-3">
                            {projectTasks.map((progress) => {
                              const getStatusStyle = (status: ProjectProgress['status']) => {
                                switch (status) {
                                  case 'nextup':
                                    return 'bg-[#00A6FF]/10 text-[#00A6FF]';
                                  case 'inprogress':
                                    return 'bg-[#FF9D00]/10 text-[#FF9D00]';
                                  case 'completed':
                                    return 'bg-[#00BC7D]/10 text-[#00BC7D]';
                                  case 'pending':
                                    return 'bg-[#F83BAA]/10 text-[#F83BAA]';
                                  case 'paused':
                                    return 'bg-[#888888]/10 text-[#888888]';
                                }
                              };

                              const formatDate = (dateStr: string) => {
                                const date = new Date(dateStr);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                              };

                              return (
                                <div
                                  key={progress.id}
                                  className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg hover:shadow-md transition-all border border-gray-200"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-bold text-[#313131]">{progress.taskName}</h4>
                                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusStyle(progress.status)}`}>
                                        {progress.status === 'nextup' ? 'Next Up' :
                                         progress.status === 'inprogress' ? 'In Progress' :
                                         progress.status === 'completed' ? 'Completed' :
                                         progress.status === 'pending' ? 'Pending' : 'Paused'}
                                      </span>
                                      <span className="text-xs px-2.5 py-1 bg-white rounded-full text-gray-600 font-medium border border-gray-200">
                                        {progress.progress || 0}%
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-gray-600">
                                        {formatDate(progress.startDate)} ~ {formatDate(progress.endDate)}
                                      </span>
                                      {progress.description && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-sm text-gray-600 line-clamp-1">{progress.description}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleProgressEdit(progress)}
                                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => handleProgressDelete(progress.id)}
                                      className="px-3 py-1.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
