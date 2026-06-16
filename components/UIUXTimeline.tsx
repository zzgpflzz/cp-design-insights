'use client';

import { useState } from 'react';
import { UIUXUpdate, DESIGNERS } from '@/lib/types';

interface UIUXTimelineProps {
  updates: UIUXUpdate[];
}

export default function UIUXTimeline({ updates }: UIUXTimelineProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<UIUXUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateClick = (update: UIUXUpdate) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 날짜순으로 정렬 (최신순)
  const sortedUpdates = [...updates].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-[#313131] mb-6">UI/UX Updates</h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-gray-200" />

          {/* Timeline items */}
          <div className="space-y-6">
            {sortedUpdates.map((update, index) => {
              const designer = DESIGNERS[update.designer];
              const isCompleted = update.status === 'completed';

              return (
                <div key={update.id} className="relative pl-10">
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-1 w-[20px] h-[20px] rounded-full border-2 border-white flex items-center justify-center ${
                      isCompleted ? 'bg-[#00BC7D]' : 'bg-[#FF9D00]'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Card */}
                  <button
                    onClick={() => handleUpdateClick(update)}
                    className="w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all border border-gray-200 hover:border-[#313131]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-[#313131]">{update.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-[6px] font-medium`}
                        style={{
                          backgroundColor: isCompleted ? 'rgba(0, 188, 125, 0.1)' : 'rgba(255, 157, 0, 0.1)',
                          color: isCompleted ? '#00BC7D' : '#FF9D00'
                        }}>
                        {isCompleted ? formatDate(update.date) : `ver. ${update.version || '1'}`}
                      </span>
                    </div>

                    {update.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{update.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{designer.emoji}</span>
                      <span>{designer.name}</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {sortedUpdates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            등록된 UI/UX 업데이트가 없습니다.
          </div>
        )}
      </div>

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
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#313131]">{selectedUpdate.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{DESIGNERS[selectedUpdate.designer].emoji}</span>
                  <span>{DESIGNERS[selectedUpdate.designer].name}</span>
                  <span>•</span>
                  <span>
                    {selectedUpdate.status === 'completed'
                      ? formatDate(selectedUpdate.date)
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

            {/* Content */}
            <div className="p-6">
              {selectedUpdate.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">설명</h3>
                  <p className="text-gray-600">{selectedUpdate.description}</p>
                </div>
              )}

              {/* 링크 버튼들 */}
              <div className="mb-6 flex gap-3">
                {selectedUpdate.previewUrl && (
                  <a
                    href={selectedUpdate.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BC7D] text-white rounded-lg hover:bg-[#00A06D] transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    페이지 미리보기
                  </a>
                )}
                {selectedUpdate.figmaUrl && (
                  <a
                    href={selectedUpdate.figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#313131] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm-5-5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5-15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
                      <circle cx="14.5" cy="7.5" r="2.5"/>
                    </svg>
                    Figma에서 보기
                  </a>
                )}
              </div>

              {/* 피그마 Embed */}
              {selectedUpdate.figmaEmbedUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Figma 미리보기</h3>
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
              {selectedUpdate.status === 'completed' && (selectedUpdate.asIsImage || selectedUpdate.asIsText || selectedUpdate.toBeImage || selectedUpdate.toBeText) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(selectedUpdate.asIsImage || selectedUpdate.asIsText) && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-3">AS-IS</h3>
                      {selectedUpdate.asIsImage && (
                        <img
                          src={selectedUpdate.asIsImage}
                          alt="AS-IS"
                          className="w-full rounded-lg border border-gray-200 mb-3"
                        />
                      )}
                      {selectedUpdate.asIsText && (
                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {selectedUpdate.asIsText}
                        </div>
                      )}
                    </div>
                  )}
                  {(selectedUpdate.toBeImage || selectedUpdate.toBeText) && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-3">TO-BE</h3>
                      {selectedUpdate.toBeImage && (
                        <img
                          src={selectedUpdate.toBeImage}
                          alt="TO-BE"
                          className="w-full rounded-lg border border-gray-200 mb-3"
                        />
                      )}
                      {selectedUpdate.toBeText && (
                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {selectedUpdate.toBeText}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 진행중인 UI */}
              {selectedUpdate.status === 'inprogress' && selectedUpdate.currentImage && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">현재 진행중인 UI</h3>
                  <img
                    src={selectedUpdate.currentImage}
                    alt="Current UI"
                    className="w-full rounded-lg border border-gray-200"
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
