'use client';

import { ProjectProgress, DESIGNERS } from '@/lib/types';
import { useMemo, useState } from 'react';

interface ModernCalendarViewProps {
  projectProgresses: ProjectProgress[];
}

interface CellEvent {
  event: ProjectProgress;
  isStart: boolean;
  isEnd: boolean;
  layer: number;
}

export default function ModernCalendarView({ projectProgresses }: ModernCalendarViewProps) {
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

  // 각 날짜 칸에 표시할 이벤트 계산
  const cellEvents = useMemo(() => {
    const { days, startDate, endDate } = calendarData;
    const eventsMap = new Map<number, CellEvent[]>();

    days.forEach((day, dayIndex) => {
      eventsMap.set(dayIndex, []);
    });

    projectProgresses.forEach(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // 캘린더 범위 밖의 이벤트는 제외
      if (eventEnd < startDate || eventStart > endDate) return;

      const displayStart = eventStart < startDate ? startDate : eventStart;
      const displayEnd = eventEnd > endDate ? endDate : eventEnd;

      // 이벤트가 걸쳐있는 모든 날짜에 추가
      const currentDay = new Date(displayStart);
      while (currentDay <= displayEnd) {
        const dayIndex = days.findIndex(d =>
          d.getFullYear() === currentDay.getFullYear() &&
          d.getMonth() === currentDay.getMonth() &&
          d.getDate() === currentDay.getDate()
        );

        if (dayIndex !== -1) {
          const isStart = currentDay.getTime() === displayStart.getTime();
          const isEnd = currentDay.getTime() === displayEnd.getTime();

          eventsMap.get(dayIndex)?.push({
            event,
            isStart,
            isEnd,
            layer: 0 // 나중에 계산
          });
        }

        currentDay.setDate(currentDay.getDate() + 1);
      }
    });

    // 각 주(row)별로 레이어 계산
    const rows = Math.ceil(days.length / 7);
    for (let row = 0; row < rows; row++) {
      const weekStart = row * 7;
      const weekEnd = Math.min(weekStart + 7, days.length);

      // 이번 주에 걸친 모든 고유 이벤트 수집
      const weekEvents = new Map<string, { event: ProjectProgress; positions: number[] }>();

      for (let i = weekStart; i < weekEnd; i++) {
        const cellEventsList = eventsMap.get(i) || [];
        cellEventsList.forEach(ce => {
          const key = ce.event.id;
          if (!weekEvents.has(key)) {
            weekEvents.set(key, { event: ce.event, positions: [] });
          }
          weekEvents.get(key)?.positions.push(i);
        });
      }

      // 레이어 할당
      const layerAssignments = new Map<string, number>();
      const sortedEvents = Array.from(weekEvents.entries()).sort((a, b) => {
        const minA = Math.min(...a[1].positions);
        const minB = Math.min(...b[1].positions);
        return minA - minB;
      });

      sortedEvents.forEach(([eventId, { event, positions }]) => {
        const minPos = Math.min(...positions);
        const maxPos = Math.max(...positions);

        // 이미 할당된 레이어 중 겹치는 것 찾기
        const occupiedLayers = new Set<number>();
        layerAssignments.forEach((layer, otherId) => {
          if (otherId !== eventId) {
            const otherPositions = weekEvents.get(otherId)?.positions || [];
            const otherMin = Math.min(...otherPositions);
            const otherMax = Math.max(...otherPositions);

            // 겹치는지 확인
            if (!(maxPos < otherMin || minPos > otherMax)) {
              occupiedLayers.add(layer);
            }
          }
        });

        // 사용 가능한 가장 낮은 레이어 찾기
        let layer = 0;
        while (occupiedLayers.has(layer)) {
          layer++;
        }
        layerAssignments.set(eventId, layer);
      });

      // 레이어 정보 업데이트
      for (let i = weekStart; i < weekEnd; i++) {
        const cellEventsList = eventsMap.get(i) || [];
        cellEventsList.forEach(ce => {
          ce.layer = layerAssignments.get(ce.event.id) || 0;
        });
      }
    }

    return eventsMap;
  }, [projectProgresses, calendarData]);

  // 상태별 컬러 (프리미엄 파스텔 톤)
  const getStatusColor = (status: ProjectProgress['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'rgba(0, 188, 125, 0.08)',
          border: '#00BC7D',
          text: '#00875A',
          hover: 'rgba(0, 188, 125, 0.12)'
        };
      case 'nextup':
        return {
          bg: 'rgba(0, 166, 255, 0.08)',
          border: '#00A6FF',
          text: '#0077CC',
          hover: 'rgba(0, 166, 255, 0.12)'
        };
      case 'inprogress':
        return {
          bg: 'rgba(255, 157, 0, 0.08)',
          border: '#FF9D00',
          text: '#CC7A00',
          hover: 'rgba(255, 157, 0, 0.12)'
        };
      case 'pending':
        return {
          bg: 'rgba(248, 59, 170, 0.08)',
          border: '#F83BAA',
          text: '#C72E86',
          hover: 'rgba(248, 59, 170, 0.12)'
        };
      case 'paused':
        return {
          bg: 'rgba(136, 136, 136, 0.08)',
          border: '#888888',
          text: '#666666',
          hover: 'rgba(136, 136, 136, 0.12)'
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
          <p className="text-sm text-gray-600">프로젝트 캘린더 뷰</p>
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

            // 상단 줄 판별 (첫 7개 칸)
            const isTopRow = dayIndex < 7;

            return (
              <div
                key={dayIndex}
                className={`min-h-[140px] border-r border-b border-gray-100 ${
                  !isInCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${dayIndex % 7 === 6 ? 'border-r-0' : ''} flex flex-col relative`}
                style={{ position: 'relative', overflow: 'visible' }}
              >
                {/* 날짜 숫자 - 오른쪽 상단에 아주 작게 */}
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

                {/* 일정 바 영역 - 날짜 아래부터 시작 */}
                <div className="pt-8 px-0 pb-2 flex-1 flex flex-col gap-2" style={{ overflow: 'visible' }}>
                  {Array.from({ length: maxLayer + 1 }, (_, layer) => {
                    const eventInLayer = events.find(e => e.layer === layer);

                    if (!eventInLayer) {
                      return null;
                    }

                    const colors = getStatusColor(eventInLayer.event.status);
                    const { isStart, isEnd } = eventInLayer;

                    // 주말 경계 확인
                    const isWeekEnd = dayIndex % 7 === 6;
                    const isWeekStart = dayIndex % 7 === 0;

                    // 둥근 모서리 결정
                    let borderRadius = '';

                    if (isStart && isEnd) {
                      borderRadius = '5px';
                    } else if (isStart) {
                      borderRadius = isWeekEnd ? '5px' : '5px 0 0 5px';
                    } else if (isEnd) {
                      borderRadius = isWeekStart ? '5px' : '0 5px 5px 0';
                    } else {
                      if (isWeekEnd) {
                        borderRadius = '0 5px 5px 0';
                      } else if (isWeekStart) {
                        borderRadius = '5px 0 0 5px';
                      } else {
                        borderRadius = '0';
                      }
                    }

                    return (
                      <div
                        key={layer}
                        className="relative group cursor-pointer"
                        style={{
                          height: '24px',
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        {/* 일정 바 - 완전히 가로로 연결 */}
                        <div
                          className="h-full flex items-center text-[11px] font-medium truncate transition-all"
                          style={{
                            backgroundColor: colors.bg,
                            borderLeft: isStart ? `3px solid ${colors.border}` : 'none',
                            borderRadius,
                            color: colors.text,
                            paddingLeft: isStart ? '8px' : '0',
                            paddingRight: isEnd ? '8px' : '0',
                            marginLeft: isStart ? '2px' : '0',
                            marginRight: isEnd ? '2px' : '0',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.hover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.bg;
                          }}
                        >
                          {/* 시작 지점에만 텍스트 표시 */}
                          {isStart && (
                            <span className="truncate leading-tight font-semibold">
                              {eventInLayer.event.taskName}
                            </span>
                          )}
                        </div>

                        {/* 호버 툴팁 - 상단 줄은 아래로, 나머지는 위로 */}
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
                              {/* 일정 제목 - 한 줄로 */}
                              <div
                                className="font-bold text-[14px] text-gray-900 mb-2"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                {eventInLayer.event.taskName}
                              </div>

                              {/* 프로젝트명 */}
                              <div className="text-gray-600 text-[12px] mb-2.5">
                                {eventInLayer.event.projectName}
                              </div>

                              {/* 구분선 */}
                              <div className="border-t border-gray-200 mb-2.5" />

                              {/* 기간 (날짜) */}
                              <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  {new Date(eventInLayer.event.startDate).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })} ~ {new Date(eventInLayer.event.endDate).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              {/* 설명 (있을 경우) */}
                              {eventInLayer.event.description && (
                                <>
                                  <div className="border-t border-gray-200 mt-2.5 mb-2.5" />
                                  <div className="text-gray-600 text-[11px] leading-relaxed">
                                    {eventInLayer.event.description}
                                  </div>
                                </>
                              )}
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
          <span className="text-xs text-gray-700">완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF9D00]" />
          <span className="text-xs text-gray-700">진행중</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00A6FF]" />
          <span className="text-xs text-gray-700">예정</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F83BAA]" />
          <span className="text-xs text-gray-700">보류</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#888888]" />
          <span className="text-xs text-gray-700">일시정지</span>
        </div>
      </div>
    </div>
  );
}
