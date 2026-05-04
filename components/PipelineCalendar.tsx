'use client';

import { ProjectProgress, DESIGNERS } from '@/lib/types';
import { useMemo } from 'react';

interface PipelineCalendarProps {
  projectProgresses: ProjectProgress[];
}

export default function PipelineCalendar({ projectProgresses }: PipelineCalendarProps) {
  // 프로젝트별로 그룹화
  const progressByProject = useMemo(() => {
    return projectProgresses
      .filter(progress => progress.projectId)
      .reduce((acc, progress) => {
        if (!acc[progress.projectName]) {
          acc[progress.projectName] = [];
        }
        acc[progress.projectName].push(progress);
        return acc;
      }, {} as Record<string, ProjectProgress[]>);
  }, [projectProgresses]);

  // 전체 날짜 범위 계산
  const { minDate, maxDate, dateRange } = useMemo(() => {
    if (projectProgresses.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), dateRange: [] };
    }

    let min = new Date(projectProgresses[0].startDate);
    let max = new Date(projectProgresses[0].endDate);

    projectProgresses.forEach(progress => {
      const start = new Date(progress.startDate);
      const end = new Date(progress.endDate);
      if (start < min) min = start;
      if (end > max) max = end;
    });

    // 날짜 범위를 주 단위로 생성
    const weeks: Date[] = [];
    const current = new Date(min);
    current.setDate(current.getDate() - current.getDay()); // 주의 시작일(일요일)로 설정

    while (current <= max) {
      weeks.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return { minDate: min, maxDate: max, dateRange: weeks };
  }, [projectProgresses]);

  // 날짜를 캘린더 상의 위치(%)로 변환
  const getPosition = (date: string) => {
    const d = new Date(date);
    const total = maxDate.getTime() - minDate.getTime();
    const current = d.getTime() - minDate.getTime();
    return (current / total) * 100;
  };

  // 기간을 너비(%)로 변환
  const getWidth = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = maxDate.getTime() - minDate.getTime();
    const duration = end.getTime() - start.getTime();
    return (duration / total) * 100;
  };

  // 날짜 포맷팅
  const formatWeek = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 상태별 컬러
  const getStatusColor = (status: ProjectProgress['status']) => {
    switch (status) {
      case 'nextup':
        return { bg: '#00A6FF', text: 'white' };
      case 'inprogress':
        return { bg: '#FF9D00', text: 'white' };
      case 'completed':
        return { bg: '#00BC7D', text: 'white' };
      case 'pending':
        return { bg: '#F83BAA', text: 'white' };
      case 'paused':
        return { bg: '#888888', text: 'white' };
    }
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
        <h2 className="text-2xl font-bold text-[#313131] mb-2">Pipeline Calendar</h2>
        <p className="text-sm text-gray-600">프로젝트별 타임라인 및 진행 현황</p>
      </div>

      {/* 캘린더 컨테이너 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 상단 날짜 헤더 */}
        <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-300">
          <div className="flex">
            {/* 왼쪽 프로젝트명 열 */}
            <div className="w-64 flex-shrink-0 px-6 py-4 bg-[#FAFAFA] border-r-2 border-gray-300">
              <span className="text-sm font-bold text-[#313131]">프로젝트</span>
            </div>

            {/* 날짜 눈금 */}
            <div className="flex-1 relative px-6 py-4 bg-[#FAFAFA]">
              <div className="flex justify-between">
                {dateRange.map((week, idx) => (
                  <div key={idx} className="text-xs text-gray-600 font-medium">
                    {formatWeek(week)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 프로젝트 행들 */}
        <div>
          {Object.entries(progressByProject).map(([projectName, progresses], idx) => {
            const designers = Array.from(new Set(progresses.map(p => p.designer)));

            return (
              <div
                key={projectName}
                className={`flex border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* 왼쪽: 프로젝트명 */}
                <div className="w-64 flex-shrink-0 px-6 py-6 border-r border-gray-200">
                  <h3 className="text-sm font-bold text-[#313131] mb-2">{projectName}</h3>
                  <div className="flex items-center gap-2">
                    {designers.map(designer => (
                      <div key={designer} className="flex items-center gap-1">
                        <span className="text-xs">{DESIGNERS[designer].emoji}</span>
                        <span className="text-xs text-gray-600">{DESIGNERS[designer].name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 오른쪽: 타임라인 막대 */}
                <div className="flex-1 relative px-6 py-4" style={{ minHeight: '80px' }}>
                  {/* 세로 그리드 라인 */}
                  {dateRange.map((_, idx) => {
                    const position = (idx / (dateRange.length - 1)) * 100;
                    return (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 w-px bg-gray-200"
                        style={{ left: `calc(1.5rem + ${position}% * (100% - 3rem) / 100)` }}
                      />
                    );
                  })}

                  {/* 작업 막대들 */}
                  {progresses.map((progress) => {
                    const left = getPosition(progress.startDate);
                    const width = getWidth(progress.startDate, progress.endDate);
                    const colors = getStatusColor(progress.status);

                    return (
                      <div
                        key={progress.id}
                        className="absolute rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: colors.bg,
                          height: '36px',
                          minWidth: '60px',
                        }}
                      >
                        <div className="h-full px-3 flex items-center justify-between gap-2">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{ color: colors.text }}
                          >
                            {progress.taskName}
                          </span>
                          {progress.progress !== undefined && (
                            <span
                              className="text-xs font-bold flex-shrink-0"
                              style={{ color: colors.text }}
                            >
                              {progress.progress}%
                            </span>
                          )}
                        </div>

                        {/* 호버 툴팁 */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                          <div className="bg-[#313131] text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                            <div className="font-bold mb-1">{progress.taskName}</div>
                            <div className="text-gray-300">
                              {new Date(progress.startDate).toLocaleDateString('ko-KR')} ~{' '}
                              {new Date(progress.endDate).toLocaleDateString('ko-KR')}
                            </div>
                            {progress.description && (
                              <div className="text-gray-300 mt-1">{progress.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-white rounded-lg border border-gray-200">
        <span className="text-xs font-semibold text-gray-600">상태:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#00A6FF]" />
          <span className="text-xs text-gray-700">Next Up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#FF9D00]" />
          <span className="text-xs text-gray-700">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#00BC7D]" />
          <span className="text-xs text-gray-700">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#F83BAA]" />
          <span className="text-xs text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#888888]" />
          <span className="text-xs text-gray-700">Paused</span>
        </div>
      </div>
    </div>
  );
}
