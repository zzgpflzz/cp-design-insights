'use client';

import { Project } from '@/lib/types';
import { useMemo, useState } from 'react';

interface ProjectCalendarViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

interface CalendarEvent {
  project: Project;
  isStart: boolean;
  isEnd: boolean;
  layer: number;
}

export default function ProjectCalendarView({ projects, onProjectClick }: ProjectCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 현재 월의 캘린더 데이터 생성
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { days, startDate, endDate };
  }, [currentMonth]);

  // 각 날짜 칸에 표시할 프로젝트 계산
  const cellEvents = useMemo(() => {
    const { days, startDate, endDate } = calendarData;
    const eventsMap = new Map<number, CalendarEvent[]>();

    days.forEach((day, dayIndex) => {
      eventsMap.set(dayIndex, []);
    });

    // releaseDate가 있는 프로젝트만 캘린더에 표시
    const projectsWithDate = projects.filter(p => p.releaseDate);

    projectsWithDate.forEach(project => {
      if (!project.releaseDate) return;

      const releaseDate = new Date(project.releaseDate);
      releaseDate.setHours(0, 0, 0, 0);

      // 캘린더 범위 밖이면 제외
      if (releaseDate < startDate || releaseDate > endDate) return;

      // 해당 날짜 찾기
      const dayIndex = days.findIndex(d =>
        d.getFullYear() === releaseDate.getFullYear() &&
        d.getMonth() === releaseDate.getMonth() &&
        d.getDate() === releaseDate.getDate()
      );

      if (dayIndex !== -1) {
        eventsMap.get(dayIndex)?.push({
          project,
          isStart: true,
          isEnd: true,
          layer: 0 // 나중에 계산
        });
      }
    });

    // 각 주(row)별로 레이어 계산
    const rows = Math.ceil(days.length / 7);
    for (let row = 0; row < rows; row++) {
      const weekStart = row * 7;
      const weekEnd = Math.min(weekStart + 7, days.length);

      // 이번 주의 모든 이벤트 수집
      const weekEvents: CalendarEvent[] = [];
      for (let i = weekStart; i < weekEnd; i++) {
        const cellEventsList = eventsMap.get(i) || [];
        weekEvents.push(...cellEventsList);
      }

      // 레이어 할당 (중복 방지)
      weekEvents.sort((a, b) => {
        const aDate = new Date(a.project.releaseDate!).getTime();
        const bDate = new Date(b.project.releaseDate!).getTime();
        return aDate - bDate;
      });

      let currentLayer = 0;
      weekEvents.forEach(event => {
        event.layer = currentLayer;
        currentLayer++;
      });
    }

    return eventsMap;
  }, [projects, calendarData]);

  // 상태별 컬러
  const getStatusColor = (project: Project) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = project.releaseDate ? new Date(project.releaseDate) : null;
    releaseDate?.setHours(0, 0, 0, 0);

    const isReleased = releaseDate && releaseDate <= today;

    if (isReleased || project.status === 'release') {
      return {
        bg: 'rgba(0, 188, 125, 0.08)',
        border: '#00BC7D',
        text: '#00875A',
        hover: 'rgba(0, 188, 125, 0.12)'
      };
    } else {
      return {
        bg: 'rgba(255, 157, 0, 0.08)',
        border: '#FF9D00',
        text: '#CC7A00',
        hover: 'rgba(255, 157, 0, 0.12)'
      };
    }
  };

  // 월 이동
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 현재 월인지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#313131] mb-1">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h2>
          <p className="text-sm text-gray-600">프로젝트 릴리즈 캘린더</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            오늘
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm" style={{ overflow: 'visible' }}>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-sm font-semibold ${
                idx === 0 ? 'text-red-600' : idx === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7" style={{ overflow: 'visible' }}>
          {calendarData.days.map((date, dayIndex) => {
            const isCurrentDate = isToday(date);
            const isInCurrentMonth = isCurrentMonth(date);
            const events = cellEvents.get(dayIndex) || [];
            const maxLayer = events.length > 0 ? Math.max(...events.map(e => e.layer)) : -1;

            // 상단 줄 판별
            const isTopRow = dayIndex < 7;

            return (
              <div
                key={dayIndex}
                className={`min-h-[140px] border-r border-b border-gray-100 ${
                  !isInCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${dayIndex % 7 === 6 ? 'border-r-0' : ''} flex flex-col relative`}
                style={{ position: 'relative', overflow: 'visible' }}
              >
                {/* 날짜 숫자 - 오른쪽 상단에 작게 */}
                <div className="absolute top-1.5 right-2 z-10">
                  <span
                    className={`inline-flex items-center justify-center font-medium ${
                      isCurrentDate
                        ? 'w-5 h-5 rounded-full bg-[#313131] text-white text-[10px] font-semibold'
                        : !isInCurrentMonth
                        ? 'text-gray-300 text-[11px]'
                        : dayIndex % 7 === 0
                        ? 'text-red-400 text-[11px]'
                        : dayIndex % 7 === 6
                        ? 'text-blue-400 text-[11px]'
                        : 'text-gray-400 text-[11px]'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* 일정 바 영역 */}
                <div className="pt-8 px-0 pb-2 flex-1 flex flex-col gap-2" style={{ overflow: 'visible' }}>
                  {Array.from({ length: maxLayer + 1 }, (_, layer) => {
                    const eventInLayer = events.find(e => e.layer === layer);

                    if (!eventInLayer) {
                      return null;
                    }

                    const colors = getStatusColor(eventInLayer.project);

                    return (
                      <div
                        key={layer}
                        className="relative group cursor-pointer"
                        style={{
                          height: '24px',
                          position: 'relative',
                          overflow: 'visible'
                        }}
                        onClick={() => onProjectClick(eventInLayer.project)}
                      >
                        {/* 일정 바 */}
                        <div
                          className="h-full flex items-center text-[11px] font-medium truncate transition-all px-2 rounded"
                          style={{
                            backgroundColor: colors.bg,
                            borderLeft: `3px solid ${colors.border}`,
                            color: colors.text,
                            marginLeft: '2px',
                            marginRight: '2px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.hover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.bg;
                          }}
                        >
                          <span className="truncate leading-tight font-semibold">
                            {eventInLayer.project.title}
                          </span>
                        </div>

                        {/* 호버 툴팁 */}
                        <div
                          className="hidden group-hover:block absolute z-[9999] pointer-events-none"
                          style={{
                            left: '50%',
                            ...(isTopRow
                              ? {
                                  top: '100%',
                                  transform: 'translateX(-50%)',
                                  marginTop: '10px',
                                }
                              : {
                                  bottom: '100%',
                                  transform: 'translateX(-50%)',
                                  marginBottom: '10px',
                                }),
                          }}
                        >
                          <div
                            className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200"
                            style={{
                              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                              minWidth: '220px',
                              maxWidth: '320px',
                            }}
                          >
                            {/* 툴팁 내용 */}
                            <div className="px-4 py-3">
                              {/* 프로젝트 제목 */}
                              <div
                                className="font-bold text-[14px] text-gray-900 mb-2"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                {eventInLayer.project.title}
                              </div>

                              {/* 설명 */}
                              {eventInLayer.project.description && (
                                <div className="text-gray-600 text-[12px] mb-2.5">
                                  {eventInLayer.project.description}
                                </div>
                              )}

                              {/* 구분선 */}
                              <div className="border-t border-gray-200 mb-2.5" />

                              {/* 릴리즈 날짜 */}
                              <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  릴리즈: {new Date(eventInLayer.project.releaseDate!).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              {/* 디자이너 */}
                              <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-2">
                                <span>
                                  {eventInLayer.project.designer === 'hyeri' ? '🐰 장혜리' : '🐶 김아영'}
                                </span>
                              </div>
                            </div>

                            {/* 화살표 */}
                            <div
                              className="absolute left-1/2 -translate-x-1/2"
                              style={{
                                ...(isTopRow
                                  ? {
                                      bottom: '100%',
                                      borderLeft: '7px solid transparent',
                                      borderRight: '7px solid transparent',
                                      borderBottom: '7px solid rgba(255, 255, 255, 0.95)',
                                      filter: 'drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.05))',
                                    }
                                  : {
                                      top: '100%',
                                      borderLeft: '7px solid transparent',
                                      borderRight: '7px solid transparent',
                                      borderTop: '7px solid rgba(255, 255, 255, 0.95)',
                                      filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))',
                                    }),
                                width: 0,
                                height: 0,
                              }}
                            />
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
          <div className="w-3 h-3 rounded-full bg-[#00BC7D]" />
          <span className="text-xs text-gray-700">릴리즈 완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF9D00]" />
          <span className="text-xs text-gray-700">릴리즈 예정</span>
        </div>
      </div>
    </div>
  );
}
