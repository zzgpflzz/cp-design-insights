'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TFTask, TFName, TF_NAMES, DESIGNERS } from '@/lib/types';

interface TFTimelineProps {
  tasks: TFTask[];
}

export default function TFTimeline({ tasks }: TFTimelineProps) {
  const [selectedTask, setSelectedTask] = useState<TFTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTF, setSelectedTF] = useState<TFName | 'all'>('all');

  const handleTaskClick = (task: TFTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // TF 목록
  const tfNames: (TFName | 'all')[] = ['all', 'lfsq', 'ax'];

  // TF별 필터링
  const filteredTasks = selectedTF === 'all'
    ? tasks
    : tasks.filter(t => t.tfName === selectedTF);

  // 상태별로 분류
  const plannedTasks = filteredTasks.filter(t => t.status === 'planned').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const activeTasks = filteredTasks.filter(t => t.status === 'active').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: TFTask['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(0, 188, 125, 0.1)', color: '#00BC7D', text: '완료' };
      case 'active':
        return { bg: 'rgba(255, 157, 0, 0.1)', color: '#FF9D00', text: '진행중' };
      case 'planned':
        return { bg: 'rgba(97, 97, 97, 0.1)', color: '#616161', text: '예정' };
    }
  };

  const getTFColor = (tfName: TFName) => {
    return TF_NAMES[tfName].color;
  };

  return (
    <>
      {/* TF 필터 */}
      <div className="mb-6 flex justify-end">
        <select
          value={selectedTF}
          onChange={(e) => setSelectedTF(e.target.value as TFName | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#313131] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">전체 TF</option>
          {tfNames.filter(tf => tf !== 'all').map(tfName => (
            <option key={tfName} value={tfName}>{TF_NAMES[tfName as TFName].name}</option>
          ))}
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          등록된 TF 업무가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 진행 예정 컬럼 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#616161]" />
                <h3 className="text-sm font-bold text-[#313131]">진행 예정</h3>
                <span className="text-xs text-gray-500">({plannedTasks.length})</span>
              </div>
              <div className="space-y-3 flex-1">
                {plannedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    진행 예정 업무가 없습니다
                  </div>
                ) : (
                  plannedTasks.map((task) => {
                    const designer = DESIGNERS[task.designer];
                    const tfInfo = TF_NAMES[task.tfName];
                    const statusColor = getStatusColor(task.status);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#616161] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#313131] flex-1">{task.title}</h4>
                          <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium ml-2"
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.color
                            }}>
                            {statusColor.text}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">{task.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{designer.emoji}</span>
                            <span>{designer.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[6px]" style={{ backgroundColor: `${tfInfo.color}20`, color: tfInfo.color }}>
                            {tfInfo.name}
                          </div>
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
                <span className="text-xs text-gray-500">({activeTasks.length})</span>
              </div>
              <div className="space-y-3 flex-1">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    진행중인 업무가 없습니다
                  </div>
                ) : (
                  activeTasks.map((task) => {
                    const designer = DESIGNERS[task.designer];
                    const tfInfo = TF_NAMES[task.tfName];
                    const statusColor = getStatusColor(task.status);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#FF9D00] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#313131] flex-1">{task.title}</h4>
                          <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium ml-2"
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.color
                            }}>
                            {statusColor.text}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">{task.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{designer.emoji}</span>
                            <span>{designer.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[6px]" style={{ backgroundColor: `${tfInfo.color}20`, color: tfInfo.color }}>
                            {tfInfo.name}
                          </div>
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
                <span className="text-xs text-gray-500">({completedTasks.length})</span>
              </div>
              <div className="space-y-3 flex-1">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    완료된 업무가 없습니다
                  </div>
                ) : (
                  completedTasks.map((task) => {
                    const designer = DESIGNERS[task.designer];
                    const tfInfo = TF_NAMES[task.tfName];
                    const statusColor = getStatusColor(task.status);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#00BC7D] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-[#313131] flex-1">{task.title}</h4>
                          <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium ml-2"
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.color
                            }}>
                            {statusColor.text}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">{task.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{designer.emoji}</span>
                            <span>{designer.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[6px]" style={{ backgroundColor: `${tfInfo.color}20`, color: tfInfo.color }}>
                            {tfInfo.name}
                          </div>
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
      {isModalOpen && selectedTask && (
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[6px]" style={{ backgroundColor: `${TF_NAMES[selectedTask.tfName].color}20`, color: TF_NAMES[selectedTask.tfName].color }}>
                      {TF_NAMES[selectedTask.tfName].name}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-[6px] font-medium"
                      style={{
                        backgroundColor: getStatusColor(selectedTask.status).bg,
                        color: getStatusColor(selectedTask.status).color
                      }}>
                      {getStatusColor(selectedTask.status).text}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#313131]">{selectedTask.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span>{DESIGNERS[selectedTask.designer].emoji}</span>
                    <span>{DESIGNERS[selectedTask.designer].name}</span>
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

              {/* 링크 버튼 */}
              {selectedTask.link && (
                <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                  <a
                    href={selectedTask.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: TF_NAMES[selectedTask.tfName].color }}
                  >
                    {selectedTask.linkLabel || '바로가기'}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedTask.description && (
                <div className="mb-8">
                  <div className="prose prose-sm max-w-none text-gray-700 break-words" style={{ lineHeight: '1.8', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedTask.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
