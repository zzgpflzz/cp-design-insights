'use client';

import { Project } from '@/lib/types';
import DesignerBadge from './DesignerBadge';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const categoryLabel = project.category === 'uiux' ? 'UI/UX' : 'Contents';
  const categoryColor = project.category === 'uiux' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700';

  const tierLabel = project.tier === 's-tier' ? 'S Tier' : project.tier === 'ab-tier' ? 'A-B Tier' : 'etc';
  const tierColor = project.tier === 's-tier'
    ? 'bg-rose-50 text-rose-700'
    : project.tier === 'ab-tier'
    ? 'bg-indigo-50 text-indigo-700'
    : 'bg-gray-50 text-gray-700';

  const hasDetailPage = project.hasDetail;

  const CardContent = () => (
    <>
      {/* 상단: 제목 + 뱃지들 */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900 leading-snug flex-1">{project.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full ${categoryColor} font-semibold`}>
            {categoryLabel}
          </span>
          {project.tier && (
            <span className={`text-xs px-2.5 py-1 rounded-full ${tierColor} font-semibold`}>
              {tierLabel}
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            project.status === 'release'
              ? 'bg-green-50 text-green-700'
              : 'bg-orange-50 text-orange-600'
          }`}>
            {project.status === 'release' ? 'Release' : 'In Progress'}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{project.description}</p>

      <div className="flex items-center justify-between">
        <DesignerBadge designer={project.designer} size="sm" />
        <div className="flex items-center gap-3">
          {hasDetailPage && (
            <span className="text-[#06C755] text-sm font-semibold flex items-center gap-1">
              자세히 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
          {project.link && !hasDetailPage && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06C755] hover:text-[#05B04C] text-sm font-semibold flex items-center gap-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              바로가기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </>
  );

  if (hasDetailPage) {
    return (
      <Link href={`/project/${project.id}`}>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
          <CardContent />
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1">
      <CardContent />
    </div>
  );
}
