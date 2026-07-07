'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthenticated } from '@/lib/auth';

interface CSLog {
  id: string;
  fileName: string;
  content: string;
  uploadedAt: Date;
}

export default function CSLogsPage(): React.ReactNode {
  const router = useRouter();
  const [csLogs, setCsLogs] = useState<CSLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<CSLog | null>(null);
  const [isUploadMode, setIsUploadMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCSLoginMode, setIsCSLoginMode] = useState<boolean>(false);
  const [csPassword, setCSPassword] = useState<string>('');
  const [isCSAuthenticated, setIsCSAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAdmin(isAuthenticated());
    // CS 담당자 로그인 상태 확인
    const csAuth = sessionStorage.getItem('cs-authenticated');
    if (csAuth === 'true') {
      setIsCSAuthenticated(true);
    }
    fetchCSLogs();
  }, []);

  const handleCSLogin = () => {
    if (csPassword === 'dauni') {
      setIsCSAuthenticated(true);
      sessionStorage.setItem('cs-authenticated', 'true');
      setIsCSLoginMode(false);
      setCSPassword('');
      alert('CS 담당자 인증되었습니다.');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
      setCSPassword('');
    }
  };

  const handleCSLogout = () => {
    setIsCSAuthenticated(false);
    sessionStorage.removeItem('cs-authenticated');
    alert('로그아웃되었습니다.');
  };

  const fetchCSLogs = async () => {
    try {
      const q = query(collection(db, 'csLogs'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        fileName: doc.data().fileName,
        content: doc.data().content,
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
      })) as CSLog[];
      setCsLogs(logs);
    } catch (error) {
      console.error('Error fetching CS logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('HTML 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;

      try {
        await addDoc(collection(db, 'csLogs'), {
          fileName: file.name,
          content,
          uploadedAt: new Date(),
        });

        alert('파일이 업로드되었습니다.');
        fetchCSLogs();
        setIsUploadMode(false);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'csLogs', id));
      alert('파일이 삭제되었습니다.');
      fetchCSLogs();

      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openHTMLInNewWindow = (log: CSLog) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(log.content);
      newWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => setIsUploadMode(true)}
                  className="px-4 py-2 bg-[#FF9D00] text-white rounded-lg hover:bg-[#e68d00] transition-colors text-sm font-medium"
                >
                  + 새 파일 업로드
                </button>
              )}
              {!isCSAuthenticated ? (
                <button
                  onClick={() => setIsCSLoginMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  CS 리뷰 등록하기
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsUploadMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + CS 리뷰 업로드
                  </button>
                  <button
                    onClick={handleCSLogout}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 pb-12">
        {csLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#111] mb-2">등록된 CS 로그가 없습니다</h2>
              <p className="text-sm text-gray-500">
                {isAdmin ? '새 파일을 업로드하여 시작하세요.' : '관리자에게 문의하세요.'}
              </p>
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {csLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => openHTMLInNewWindow(log)}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#FF9D00] hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                    <svg className="w-5 h-5 text-[#FF9D00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#111] mb-1 truncate">{log.fileName}</h3>
                    <p className="text-xs text-gray-400">{formatDate(log.uploadedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">클릭하여 새 창에서 보기</span>
                  {(isAdmin || isCSAuthenticated) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLog(log.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CS Login Modal */}
      {isCSLoginMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#111]">CS 담당자 인증</h2>
              <button
                onClick={() => {
                  setIsCSLoginMode(false);
                  setCSPassword('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={csPassword}
                onChange={(e) => setCSPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCSLogin();
                  }
                }}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <button
              onClick={handleCSLogin}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              로그인
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                💡 CS 담당자만 파일을 업로드하고 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

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
                CS 로그 HTML 파일을 업로드하면 모든 사용자가 확인할 수 있습니다.
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
                  💡 파일은 Firebase에 저장되며 모든 사용자가 볼 수 있습니다.
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
