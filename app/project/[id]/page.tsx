'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import DesignerBadge from '@/components/DesignerBadge';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', resolvedParams.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as Project);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [resolvedParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const categoryLabel = project.category === 'uiux' ? 'UI/UX' : 'Contents';
  const categoryColor = project.category === 'uiux' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700';

  const tierLabel = project.tier === 's-tier' ? 'S Tier' : project.tier === 'ab-tier' ? 'A-B Tier' : 'etc';
  const tierColor = project.tier === 's-tier'
    ? 'bg-rose-50 text-rose-700'
    : project.tier === 'ab-tier'
    ? 'bg-indigo-50 text-indigo-700'
    : 'bg-gray-50 text-gray-700';

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${parseInt(monthNum)}월`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">CP Design</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Project Header */}
        <div className="bg-white rounded-2xl shadow-sm p-10 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-500 font-medium">{formatMonth(project.month)}</span>
                <span className="text-gray-300">•</span>
                <DesignerBadge designer={project.designer} size="md" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className={`text-sm px-4 py-2 rounded-full ${categoryColor} font-semibold`}>
              {categoryLabel}
            </span>
            {project.tier && (
              <span className={`text-sm px-4 py-2 rounded-full ${tierColor} font-semibold`}>
                {tierLabel}
              </span>
            )}
            <span className={`text-sm px-4 py-2 rounded-full font-semibold ${
              project.status === 'release'
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {project.status === 'release' ? 'Release' : 'In Progress'}
            </span>
          </div>

          {project.link && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#06C755] hover:text-[#05B04C] font-semibold transition-colors"
              >
                <span>외부 링크</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Detail Content */}
        {project.detailContent && (
          <div className="bg-white rounded-2xl shadow-sm p-10 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 상세</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {project.detailContent}
            </div>
          </div>
        )}

        {/* Detail Images */}
        {project.detailImages && project.detailImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">이미지</h2>
            <div className="space-y-6">
              {project.detailImages.map((imageUrl, index) => (
                <div key={index} className="relative w-full rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={`${project.title} 이미지 ${index + 1}`}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
