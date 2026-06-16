'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UIUXUpdate, DESIGNERS } from '@/lib/types';

interface UIUXTimelineProps {
  updates: UIUXUpdate[];
}

export default function UIUXTimeline({ updates }: UIUXTimelineProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<UIUXUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const handleUpdateClick = (update: UIUXUpdate) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 마크다운 문법을 제거하고 일반 텍스트로 변환
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s/g, '') // 제목 (#, ##, ###)
      .replace(/\*\*(.+?)\*\*/g, '$1') // 굵은 글씨
      .replace(/\*(.+?)\*/g, '$1') // 기울임
      .replace(/~~(.+?)~~/g, '$1') // 취소선
      .replace(/`(.+?)`/g, '$1') // 인라인 코드
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 링크
      .replace(/^>\s/gm, '') // 인용구
      .replace(/^[-*+]\s/gm, '') // 리스트
      .replace(/^\d+\.\s/gm, '') // 번호 리스트
      .trim();
  };

  // 기간 목록 추출 (중복 제거)
  const periods = ['all', ...new Set(updates.map(u => u.period).filter(Boolean))];

  // 기간별 필터링
  const filteredUpdates = selectedPeriod === 'all'
    ? updates
    : updates.filter(u => u.period === selectedPeriod);

  // 상태별로 분류
  const plannedUpdates = filteredUpdates.filter(u => u.status === 'planned').sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const inProgressUpdates = filteredUpdates.filter(u => u.status === 'inprogress').sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const completedUpdates = filteredUpdates.filter(u => u.status === 'completed').sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* 기간 필터 */}
      {periods.length > 1 && (
        <div className="mb-6 flex justify-end">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#313131] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">전체</option>
            {periods.filter(p => p !== 'all').map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
      )}

      {updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          등록된 UI/UX 업데이트가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 진행 예정 컬럼 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#616161]" />
                <h3 className="text-sm font-bold text-[#313131]">진행 예정</h3>
                <span className="text-xs text-gray-500">({plannedUpdates.length})</span>
              </div>
              <div className="space-y-3 flex-1">
                {plannedUpdates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    진행 예정 업데이트가 없습니다
                  </div>
                ) : (
                  plannedUpdates.map((update) => {
                    const designer = DESIGNERS[update.designer];
                    return (
                      <div
                        key={update.id}
                        onClick={() => handleUpdateClick(update)}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#616161] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#313131] flex-1">{update.title}</h4>
                          <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium ml-2"
                            style={{
                              backgroundColor: 'rgba(97, 97, 97, 0.1)',
                              color: '#616161'
                            }}>
                            예정
                          </span>
                        </div>

                        {update.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{stripMarkdown(update.description)}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{designer.emoji}</span>
                            <span>{designer.name}</span>
                          </div>
                          {update.previewUrl && (
                            <a
                              href={update.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#616161] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {update.previewLabel || '바로가기'}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 진행중 컬럼 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#FF9D00]" />
                <h3 className="text-sm font-bold text-[#313131]">진행중</h3>
                <span className="text-xs text-gray-500">({inProgressUpdates.length})</span>
              </div>
              <div className="space-y-3 flex-1">
                {inProgressUpdates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    진행중인 업데이트가 없습니다
                  </div>
                ) : (
                  inProgressUpdates.map((update) => {
                    const designer = DESIGNERS[update.designer];
                    return (
                      <div
                        key={update.id}
                        onClick={() => handleUpdateClick(update)}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#FF9D00] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#313131] flex-1">{update.title}</h4>
                          <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium ml-2"
                            style={{
                              backgroundColor: 'rgba(255, 157, 0, 0.1)',
                              color: '#FF9D00'
                            }}>
                            ver. {update.version || '1'}
                          </span>
                        </div>

                        {update.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{stripMarkdown(update.description)}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{designer.emoji}</span>
                            <span>{designer.name}</span>
                          </div>
                          {update.previewUrl && (
                            <a
                              href={update.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#FF9D00] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {update.previewLabel || '바로가기'}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 완료 컬럼 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#00BC7D]" />
                <h3 className="text-sm font-bold text-[#313131]">완료</h3>
                <span className="text-xs text-gray-500">({completedUpdates.length})</span>
              </div>
              <div className="space-y-3 flex-1">
                {completedUpdates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    완료된 업데이트가 없습니다
                  </div>
                ) : (
                  completedUpdates.map((update) => {
                    const designer = DESIGNERS[update.designer];
                    return (
                      <div
                        key={update.id}
                        onClick={() => handleUpdateClick(update)}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#00BC7D] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#313131] flex-1">{update.title}</h4>
                          <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium ml-2"
                            style={{
                              backgroundColor: 'rgba(0, 188, 125, 0.1)',
                              color: '#00BC7D'
                            }}>
                            {formatDate(update.date)}
                          </span>
                        </div>

                        {update.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{stripMarkdown(update.description)}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{designer.emoji}</span>
                            <span>{designer.name}</span>
                          </div>
                          {update.previewUrl && (
                            <a
                              href={update.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#00BC7D] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {update.previewLabel || '바로가기'}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedUpdate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#313131]">{selectedUpdate.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span>{DESIGNERS[selectedUpdate.designer].emoji}</span>
                    <span>{DESIGNERS[selectedUpdate.designer].name}</span>
                    <span>•</span>
                    <span>
                      {selectedUpdate.status === 'completed'
                        ? formatDate(selectedUpdate.date)
                        : selectedUpdate.status === 'planned'
                        ? '예정'
                        : `ver. ${selectedUpdate.version || '1'} (진행중)`
                      }
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 링크 버튼들 */}
              {(selectedUpdate.previewUrl || selectedUpdate.figmaUrl) && (
                <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                  {selectedUpdate.previewUrl && (
                    <a
                      href={selectedUpdate.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                      style={{
                        color: selectedUpdate.status === 'planned'
                          ? '#616161'
                          : selectedUpdate.status === 'inprogress'
                          ? '#FF9D00'
                          : '#00BC7D'
                      }}
                    >
                      {selectedUpdate.previewLabel || '바로가기'}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {selectedUpdate.figmaUrl && (
                    <a
                      href={selectedUpdate.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:underline"
                    >
                      Figma에서 보기
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedUpdate.description && (
                <div className="mb-8">
                  <div className="prose prose-sm max-w-none text-gray-700" style={{ lineHeight: '1.8' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedUpdate.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* 피그마 Embed */}
              {selectedUpdate.figmaEmbedUrl && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Figma 미리보기</h3>
                  <div className="w-full h-[600px] rounded-lg border border-gray-200 overflow-hidden">
                    <iframe
                      src={selectedUpdate.figmaEmbedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  </div>
                </div>
              )}

              {/* AS-IS / TO-BE */}
              {selectedUpdate.status === 'completed' && (selectedUpdate.asIsImage || selectedUpdate.asIsText || selectedUpdate.asIsLinks || selectedUpdate.toBeImage || selectedUpdate.toBeText || selectedUpdate.toBeLinks) && (
                <div className="border-t border-gray-200 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(selectedUpdate.asIsImage || selectedUpdate.asIsText || selectedUpdate.asIsLinks) && (
                      <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">AS-IS</h3>
                        </div>
                        {selectedUpdate.asIsImage && (
                          <img
                            src={selectedUpdate.asIsImage}
                            alt="AS-IS"
                            className="w-full rounded-lg mb-4 shadow-sm"
                          />
                        )}
                        {selectedUpdate.asIsText && (
                          <div className="prose prose-sm max-w-none text-gray-600 mb-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {selectedUpdate.asIsText}
                            </ReactMarkdown>
                          </div>
                        )}
                        {selectedUpdate.asIsLinks && selectedUpdate.asIsLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedUpdate.asIsLinks.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                              >
                                {link.label}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(selectedUpdate.toBeImage || selectedUpdate.toBeText || selectedUpdate.toBeLinks) && (
                      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xs font-bold text-[#00BC7D] uppercase tracking-wider">TO-BE</h3>
                      </div>
                      {selectedUpdate.toBeImage && (
                        <img
                          src={selectedUpdate.toBeImage}
                          alt="TO-BE"
                          className="w-full rounded-lg mb-4 shadow-sm"
                        />
                      )}
                      {selectedUpdate.toBeText && (
                        <div className="prose prose-sm max-w-none text-gray-600 mb-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedUpdate.toBeText}
                          </ReactMarkdown>
                        </div>
                      )}
                      {selectedUpdate.toBeLinks && selectedUpdate.toBeLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedUpdate.toBeLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#00BC7D] hover:underline"
                            >
                              {link.label}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 진행중인 UI */}
              {selectedUpdate.status === 'inprogress' && selectedUpdate.currentImage && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">현재 진행중인 UI</h3>
                  <img
                    src={selectedUpdate.currentImage}
                    alt="Current UI"
                    className="w-full rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
