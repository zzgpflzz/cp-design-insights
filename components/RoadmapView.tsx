'use client';

import { ProjectProgress, DESIGNERS } from '@/lib/types';
import { useState } from 'react';

interface RoadmapViewProps {
  projectProgresses: ProjectProgress[];
}

export default function RoadmapView({ projectProgresses }: RoadmapViewProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // 프로젝트별로 그룹화 (projectId가 있는 신규 데이터만)
  const progressByProject = projectProgresses
    .filter(progress => progress.projectId)
    .reduce((acc, progress) => {
      if (!acc[progress.projectName]) {
        acc[progress.projectName] = [];
      }
      acc[progress.projectName].push(progress);
      return acc;
    }, {} as Record<string, ProjectProgress[]>);

  const toggleProject = (projectName: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getStatusInfo = (status: ProjectProgress['status']) => {
    switch (status) {
      case 'nextup':
        return { label: 'Next Up', color: 'bg-blue-100 text-blue-700', border: 'border-l-blue-500', dot: 'bg-blue-500' };
      case 'inprogress':
        return { label: 'In Progress', color: 'bg-orange-50 text-orange-600', border: 'border-l-orange-500', dot: 'bg-orange-500' };
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-500', dot: 'bg-emerald-500' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-50 text-yellow-600', border: 'border-l-yellow-500', dot: 'bg-yellow-500' };
      case 'paused':
        return { label: 'Paused', color: 'bg-gray-100 text-gray-700', border: 'border-l-gray-400', dot: 'bg-gray-400' };
    }
  };

  const getProjectStats = (progresses: ProjectProgress[]) => {
    const total = progresses.length;
    const completed = progresses.filter(p => p.status === 'completed').length;
    const inProgress = progresses.filter(p => p.status === 'inprogress').length;
    const nextUp = progresses.filter(p => p.status === 'nextup').length;
    const pending = progresses.filter(p => p.status === 'pending').length;
    const paused = progresses.filter(p => p.status === 'paused').length;

    // 전체 프로젝트의 평균 진척률 계산
    const totalProgress = progresses.reduce((sum, p) => sum + (p.progress || 0), 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return { total, completed, inProgress, nextUp, pending, paused, averageProgress };
  };

  if (projectProgresses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        등록된 프로젝트 로드맵이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Roadmap</h2>
        <p className="text-sm text-gray-600">프로젝트별 작업 진행 현황</p>
      </div>

      {/* 프로젝트별 아코디언 */}
      <div className="space-y-4">
        {Object.entries(progressByProject).map(([projectName, progresses], projectIndex) => {
          const isExpanded = expandedProjects.has(projectName);
          const stats = getProjectStats(progresses);
          const designers = Array.from(new Set(progresses.map(p => p.designer)));

          return (
            <div key={projectName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
              {/* 프로젝트 헤더 (클릭 가능) */}
              <button
                onClick={() => toggleProject(projectName)}
                className="w-full flex items-center gap-6 p-5 hover:bg-gray-50 transition-colors relative z-10"
              >
                {/* 순번 */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-gray-500 text-sm font-semibold">#{projectIndex + 1}</span>
                </div>

                {/* 프로젝트 이름 */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{projectName}</h3>
                    {stats.inProgress > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full font-semibold">
                        In Progress
                      </span>
                    )}
                    {stats.nextUp > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        Next Up
                      </span>
                    )}
                    {stats.pending > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                        Pending
                      </span>
                    )}
                    {stats.paused > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                        Paused
                      </span>
                    )}
                    {stats.completed > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">총 {stats.total}개 작업</span>
                  </div>
                </div>

                {/* 담당 디자이너들 */}
                <div className="flex items-center gap-2">
                  {designers.map(designer => (
                    <div key={designer} className="flex items-center gap-1.5">
                      <span className="text-lg">{DESIGNERS[designer].emoji}</span>
                      <span className="text-sm text-gray-600">{DESIGNERS[designer].name}</span>
                    </div>
                  ))}
                </div>

                {/* 화살표 아이콘 */}
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* 프로그레스 바 (하단 보더) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                <div
                  className="h-full bg-gradient-to-r from-[#313131] to-[#1a1a1a] transition-all duration-500"
                  style={{ width: `${stats.averageProgress}%` }}
                />
              </div>

              {/* 작업 로드맵 (펼쳐졌을 때) */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="space-y-3">
                    {progresses.map((progress, taskIndex) => {
                      const statusInfo = getStatusInfo(progress.status);
                      const designerInfo = DESIGNERS[progress.designer];

                      return (
                        <div
                          key={progress.id}
                          className={`flex items-center gap-6 bg-white rounded-lg p-3 border-l-4 ${statusInfo.border} hover:shadow-md transition-all`}
                        >
                          {/* 작업 순번 */}
                          <div className="flex-shrink-0 w-8 text-center">
                            <span className="text-gray-400 text-xs font-semibold">{taskIndex + 1}</span>
                          </div>

                          {/* 상태 도트 */}
                          <div className="flex-shrink-0">
                            <span className={`w-3 h-3 rounded-full ${statusInfo.dot} inline-block`} />
                          </div>

                          {/* 작업명 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{progress.taskName}</h4>
                            {progress.description && (
                              <p className="text-sm text-gray-600 truncate mt-1">{progress.description}</p>
                            )}
                          </div>

                          {/* 기간 */}
                          <div className="flex-shrink-0 w-36">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(progress.startDate)} ~ {formatDate(progress.endDate)}</span>
                            </div>
                          </div>

                          {/* 상태 */}
                          <div className="flex-shrink-0 w-28">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* 담당자 */}
                          <div className="flex-shrink-0 w-24 flex items-center gap-1.5">
                            <span className="text-sm">{designerInfo.emoji}</span>
                            <span className="text-sm text-gray-700">{designerInfo.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
