'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ArchivedFile {
  id: string;
  fileName: string;
  content: string;
  uploadedAt: string;
}

export default function CSLogsPage(): React.ReactNode {
  const router = useRouter();
  const [archivedFiles, setArchivedFiles] = useState<ArchivedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ArchivedFile | null>(null);
  const [isUploadMode, setIsUploadMode] = useState<boolean>(false);

  // 로컬 스토리지에서 아카이브 로드
  useEffect(() => {
    const saved = localStorage.getItem('cs-logs-archive');
    if (saved) {
      try {
        setArchivedFiles(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load archived files:', e);
      }
    }
  }, []);

  // 아카이브를 로컬 스토리지에 저장
  const saveToLocalStorage = (files: ArchivedFile[]) => {
    localStorage.setItem('cs-logs-archive', JSON.stringify(files));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('HTML 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newFile: ArchivedFile = {
        id: Date.now().toString(),
        fileName: file.name,
        content,
        uploadedAt: new Date().toISOString(),
      };

      const updated = [newFile, ...archivedFiles];
      setArchivedFiles(updated);
      saveToLocalStorage(updated);
      setSelectedFile(newFile);
      setIsUploadMode(false);
      alert('파일이 아카이브에 추가되었습니다.');
    };
    reader.readAsText(file);
  };

  const handleDeleteFile = (id: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    const updated = archivedFiles.filter(f => f.id !== id);
    setArchivedFiles(updated);
    saveToLocalStorage(updated);

    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }

    alert('파일이 삭제되었습니다.');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* GNB */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/cp-index')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#111]">CS 대시보드</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">CS 문의 및 응대 기록</p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadMode(true)}
              className="px-4 py-2 bg-[#FF9D00] text-white rounded-lg hover:bg-[#e68d00] transition-colors text-sm font-medium"
            >
              + 새 파일 업로드
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Archive List */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl overflow-hidden sticky top-24">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-bold text-[#111]">아카이브</h3>
                <p className="text-xs text-gray-400 mt-0.5">{archivedFiles.length}개 파일</p>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {archivedFiles.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-400">업로드된 파일이 없습니다</p>
                  </div>
                ) : (
                  <ul>
                    {archivedFiles.map((file) => (
                      <li key={file.id}>
                        <button
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                            selectedFile?.id === file.id ? 'bg-orange-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-[#111] truncate">
                                {file.fileName}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatDate(file.uploadedAt)}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.id);
                              }}
                              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {!selectedFile ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#111] mb-2">파일을 선택하세요</h2>
                  <p className="text-sm text-gray-500">
                    왼쪽 아카이브에서 파일을 선택하거나 새 파일을 업로드하세요.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-700">{selectedFile.fileName}</div>
                        <div className="text-xs text-gray-400">{formatDate(selectedFile.uploadedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <iframe
                    srcDoc={selectedFile.content}
                    className="w-full border border-gray-200 rounded-lg"
                    style={{ minHeight: '70vh' }}
                    sandbox="allow-same-origin allow-scripts"
                    title="CS Log Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#111]">HTML 파일 업로드</h2>
              <button
                onClick={() => setIsUploadMode(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                CS 로그 HTML 파일을 업로드하면 아카이브에 저장됩니다.
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={(e) => {
                    handleFileUpload(e);
                    if (e.target.files?.[0]) {
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-[#FF9D00] text-white rounded-lg hover:bg-[#e68d00] transition-colors cursor-pointer inline-block text-sm font-medium">
                  파일 선택
                </span>
              </label>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  💡 파일은 브라우저 로컬 스토리지에 저장됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-xs text-gray-400 text-right">
            © 2026 CP Design Team.
          </div>
        </div>
      </footer>
    </div>
  );
}
