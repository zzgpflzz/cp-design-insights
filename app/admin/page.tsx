'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthenticated } from '@/lib/auth';
import { Project, Designer, Status, Category, Tier, DESIGNERS, MonthlyAgenda, ProjectProgress, RoadmapProject } from '@/lib/types';
import DesignerBadge from '@/components/DesignerBadge';
import Link from 'next/link';

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
  const [hasDetail, setHasDetail] = useState(false);
  const [detailContent, setDetailContent] = useState('');
  const [detailImages, setDetailImages] = useState('');

  // 필터 상태
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<Tier | 'all'>('all');
  const [filterDesigner, setFilterDesigner] = useState<Designer | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

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

  useEffect(() => {
    // 인증 확인
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    fetchProjects();
    fetchAgendas();
    fetchRoadmapProjects();
    fetchProjectProgresses();
  }, [router]);

  const fetchProjects = async () => {
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
  };

  const fetchAgendas = async () => {
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

  const fetchRoadmapProjects = async () => {
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
  };

  const fetchProjectProgresses = async () => {
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
      // 프로젝트에 속한 모든 작업 삭제
      const relatedProgresses = projectProgresses.filter(p => p.projectId === id);
      for (const progress of relatedProgresses) {
        await deleteDoc(doc(db, 'projectProgresses', progress.id));
      }

      // 프로젝트 삭제
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

      // 선택 필드는 값이 있을 때만 추가
      if (link && link.trim()) {
        projectData.link = link;
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
        // 수정
        await updateDoc(doc(db, 'projects', editingProject.id), projectData);
        alert('프로젝트가 수정되었습니다!');
      } else {
        // 새로 추가
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
    setHasDetail(project.hasDetail || false);
    setDetailContent(project.detailContent || '');
    setDetailImages(project.detailImages?.join('\n') || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'projects', id));
      alert('프로젝트가 삭제되었습니다.');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${parseInt(monthNum)}월`;
  };

  // 필터링된 프로젝트
  const filteredProjects = projects.filter(project => {
    if (filterMonth !== 'all' && project.month !== filterMonth) return false;
    if (filterTier !== 'all' && project.tier !== filterTier) return false;
    if (filterDesigner !== 'all' && project.designer !== filterDesigner) return false;
    if (filterStatus !== 'all' && project.status !== filterStatus) return false;
    return true;
  });

  // 사용 가능한 월 목록
  const availableMonths = Array.from(new Set(projects.map(p => p.month))).sort((a, b) => b.localeCompare(a));

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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">관리자 페이지</h1>
              <p className="text-base text-gray-600">프로젝트 추가 및 관리</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04C] transition-colors font-medium flex items-center gap-2"
            >
              프론트 새창보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* 탭 */}
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setAdminTab('insights')}
              className={`pb-3 px-2 font-semibold transition-colors relative ${
                adminTab === 'insights'
                  ? 'text-[#06C755]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly Insights 관리
              {adminTab === 'insights' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06C755]" />
              )}
            </button>
            <button
              onClick={() => setAdminTab('project')}
              className={`pb-3 px-2 font-semibold transition-colors relative ${
                adminTab === 'project'
                  ? 'text-[#06C755]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Project 관리
              {adminTab === 'project' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06C755]" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 space-y-8">
        {/* Monthly Insights 관리 탭 */}
        {adminTab === 'insights' && (
          <>
            {/* 월별 아젠다 관리 섹션 */}
            <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingAgenda ? '✏️ 월별 아젠다 수정' : '📌 월별 주요 아젠다 추가'}
          </h2>
          <form onSubmit={handleAgendaSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  월 *
                </label>
                <input
                  type="month"
                  value={agendaMonth}
                  onChange={(e) => setAgendaMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                placeholder="이번 달의 주요 아젠다를 입력하세요"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#06C755] text-white py-2.5 px-4 rounded-lg hover:bg-[#05B04C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
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

          {/* 등록된 아젠다 목록 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">등록된 아젠다 ({agendas.length})</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {agendas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  등록된 아젠다가 없습니다.
                </div>
              ) : (
                agendas.map((agenda) => (
                  <div
                    key={agenda.id}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#06C755]">
                          {formatMonth(agenda.month)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAgendaEdit(agenda)}
                          className="px-3 py-1.5 bg-white border border-[#616161] text-[#616161] hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleAgendaDelete(agenda.id)}
                          className="px-3 py-1.5 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProject ? '✏️ 프로젝트 수정' : '➕ 새 프로젝트 추가'}
            </h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  >
                    <option value="hyeri">{DESIGNERS.hyeri.emoji} {DESIGNERS.hyeri.name}</option>
                    <option value="ayoung">{DESIGNERS.ayoung.emoji} {DESIGNERS.ayoung.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    월 *
                  </label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태 *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  >
                    <option value="release">Release</option>
                    <option value="inprogress">In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  >
                    <option value="uiux">UI/UX</option>
                    <option value="contents">Contents</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위 *
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as Tier)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                >
                  <option value="s-tier">S Tier (최우선)</option>
                  <option value="ab-tier">A-B Tier (보통)</option>
                  <option value="etc">etc (기타)</option>
                </select>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={hasDetail}
                    onChange={(e) => setHasDetail(e.target.checked)}
                    className="w-4 h-4 text-[#06C755] border-gray-300 rounded focus:ring-[#06C755]"
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
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                        placeholder="프로젝트에 대한 상세 설명을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이미지 URL (한 줄에 하나씩)
                      </label>
                      <textarea
                        value={detailImages}
                        onChange={(e) => setDetailImages(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">각 이미지 URL을 새 줄에 입력하세요</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#06C755] text-white py-2.5 px-4 rounded-lg hover:bg-[#05B04C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? '저장 중...' : editingProject ? '수정하기' : '추가하기'}
                </button>
                {editingProject && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Projects List Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📋 등록된 프로젝트 ({filteredProjects.length}/{projects.length})
              </h2>

              {/* 필터 영역 */}
              <div className="flex flex-wrap gap-3">
                {/* 월 필터 */}
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '40px'
                  }}
                >
                  <option value="all">전체 월</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{formatMonth(month)}</option>
                  ))}
                </select>

                {/* 티어 필터 */}
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value as Tier | 'all')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '40px'
                  }}
                >
                  <option value="all">전체 Tier</option>
                  <option value="s-tier">S Tier</option>
                  <option value="ab-tier">A-B Tier</option>
                  <option value="etc">etc</option>
                </select>

                {/* 디자이너 필터 */}
                <select
                  value={filterDesigner}
                  onChange={(e) => setFilterDesigner(e.target.value as Designer | 'all')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '40px'
                  }}
                >
                  <option value="all">전체 Designer</option>
                  <option value="hyeri">🐰 장혜리</option>
                  <option value="ayoung">🐶 김아영</option>
                </select>

                {/* 상태 필터 */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-[#616161] appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#06C755]/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '40px'
                  }}
                >
                  <option value="all">전체 Status</option>
                  <option value="release">Release</option>
                  <option value="inprogress">In Progress</option>
                </select>

                {/* 필터 초기화 */}
                {(filterMonth !== 'all' || filterTier !== 'all' || filterDesigner !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterMonth('all');
                      setFilterTier('all');
                      setFilterDesigner('all');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#616161] rounded-full text-sm font-semibold transition-colors"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {projects.length === 0 ? '아직 등록된 프로젝트가 없습니다.' : '필터 조건에 맞는 프로젝트가 없습니다.'}
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{project.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="px-3 py-1.5 bg-white border border-[#616161] text-[#616161] hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-3 py-1.5 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {project.hasDetail && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                          📄 상세 페이지
                        </span>
                      )}
                      <DesignerBadge designer={project.designer} size="sm" />
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white text-gray-700 font-medium">
                        {formatMonth(project.month)}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          project.status === 'release'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {project.status === 'release' ? 'Release' : 'In Progress'}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          project.category === 'uiux'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        {project.category === 'uiux' ? 'UI/UX' : 'Contents'}
                      </span>
                      {project.tier && (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            project.tier === 's-tier'
                              ? 'bg-rose-50 text-rose-700'
                              : project.tier === 'ab-tier'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {project.tier === 's-tier' ? 'S Tier' : project.tier === 'ab-tier' ? 'A-B Tier' : 'etc'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {/* Project 관리 탭 */}
        {adminTab === 'project' && (
          <div className="space-y-8">
            {/* 1. 프로젝트 등록 섹션 */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    >
                      <option value="hyeri">{DESIGNERS.hyeri.emoji} {DESIGNERS.hyeri.name}</option>
                      <option value="ayoung">{DESIGNERS.ayoung.emoji} {DESIGNERS.ayoung.name}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프로젝트 시작일 (선택)
                    </label>
                    <input
                      type="date"
                      value={roadmapStartDate}
                      onChange={(e) => setRoadmapStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프로젝트 종료일 (선택)
                    </label>
                    <input
                      type="date"
                      value={roadmapEndDate}
                      onChange={(e) => setRoadmapEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    프로젝트 설명 (선택)
                  </label>
                  <textarea
                    value={roadmapDescription}
                    onChange={(e) => setRoadmapDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                    placeholder="프로젝트에 대한 간단한 설명"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#06C755] text-white py-2.5 px-4 rounded-lg hover:bg-[#05B04C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
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

            {/* 2. 프로젝트별 작업 관리 */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                프로젝트별 작업 관리
              </h2>

              {/* 프로젝트 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작업을 추가할 프로젝트 선택 *
                </label>
                <select
                  value={selectedRoadmapProjectId}
                  onChange={(e) => setSelectedRoadmapProjectId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-[#06C755] font-medium"
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {roadmapProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName} ({DESIGNERS[project.designer].name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 작업 추가 폼 */}
              {selectedRoadmapProjectId && (
                <form onSubmit={handleProgressSubmit} className="space-y-4 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상세 설명 (선택)
                    </label>
                    <textarea
                      value={progressDescription}
                      onChange={(e) => setProgressDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                      placeholder="작업에 대한 간단한 설명을 입력하세요"
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
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#06C755]"
                      />
                      <div className="flex-shrink-0 w-16">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={progressPercent}
                          onChange={(e) => setProgressPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full px-2 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#06C755] to-[#05B04C] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#06C755] text-white py-2.5 px-4 rounded-lg hover:bg-[#05B04C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
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

            {/* 3. 프로젝트 목록 (계층적 구조) */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                        {/* 프로젝트 헤더 */}
                        <div className="bg-gray-50 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{project.projectName}</h3>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{designerInfo.emoji}</span>
                                  <span className="text-sm font-medium text-gray-700">{designerInfo.name}</span>
                                </div>
                                <span className="text-xs px-2.5 py-1 bg-white rounded-full text-gray-600 font-medium">
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
                                className="px-3 py-1.5 bg-white border border-[#616161] text-[#616161] hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleRoadmapProjectDelete(project.id)}
                                className="px-3 py-1.5 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 프로젝트 작업 목록 */}
                        {projectTasks.length > 0 && (
                          <div className="p-5 bg-white space-y-3">
                            {projectTasks.map((progress) => {
                              const formatDate = (dateStr: string) => {
                                const date = new Date(dateStr);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                              };

                              return (
                                <div
                                  key={progress.id}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-bold text-gray-900">{progress.taskName}</h4>
                                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                        progress.status === 'nextup' ? 'bg-blue-50 text-blue-700' :
                                        progress.status === 'inprogress' ? 'bg-orange-50 text-orange-600' :
                                        progress.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                        progress.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                        'bg-gray-50 text-gray-700'
                                      }`}>
                                        {progress.status === 'nextup' ? 'Next Up' :
                                         progress.status === 'inprogress' ? 'In Progress' :
                                         progress.status === 'completed' ? 'Completed' :
                                         progress.status === 'pending' ? 'Pending' : 'Paused'}
                                      </span>
                                      <span className="text-xs px-2.5 py-1 bg-white rounded-full text-gray-600 font-medium">
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
                                      className="px-3 py-1.5 bg-white border border-[#616161] text-[#616161] hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => handleProgressDelete(progress.id)}
                                      className="px-3 py-1.5 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
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
      </main>
    </div>
  );
}
