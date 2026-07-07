'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CSLogsPage(): React.ReactNode {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

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
      setHtmlContent(content);
      setFileName(file.name);
      setIsPreviewMode(true);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setHtmlContent('');
    setFileName('');
    setIsPreviewMode(false);
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
                <h1 className="text-xl font-bold text-[#111]">고객 지원 로그</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">CS 문의 및 응대 기록</p>
              </div>
            </div>
            {isPreviewMode && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                다른 파일 업로드
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 pb-12">
        {!isPreviewMode ? (
          // Upload Section
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#111] mb-2">HTML 파일 업로드</h2>
              <p className="text-sm text-gray-500 mb-6">
                고객 지원 로그 HTML 파일을 업로드하면 즉시 확인할 수 있습니다.
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-[#FF9D00] text-white rounded-lg hover:bg-[#e68d00] transition-colors cursor-pointer inline-block text-sm font-medium">
                  파일 선택
                </span>
              </label>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  💡 업로드된 파일은 브라우저에서만 처리되며 서버에 저장되지 않습니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Preview Section
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{fileName}</span>
                </div>
                <span className="text-xs text-gray-400">미리보기 모드</span>
              </div>
            </div>

            <div className="p-6">
              <iframe
                srcDoc={htmlContent}
                className="w-full border border-gray-200 rounded-lg"
                style={{ minHeight: '70vh' }}
                sandbox="allow-same-origin allow-scripts"
                title="CS Log Preview"
              />
            </div>
          </div>
        )}
      </main>

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
