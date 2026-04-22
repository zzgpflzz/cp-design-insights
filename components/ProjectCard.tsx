'use client';

import { Project } from '@/lib/types';
import DesignerBadge from './DesignerBadge';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const categoryLabel = project.category === 'uiux' ? 'UI/UX' : 'CONTENTS';
  const categoryStyle = project.category === 'uiux'
    ? { backgroundColor: 'rgba(248, 59, 170, 0.08)', color: '#F83BAA', borderColor: 'rgba(248, 59, 170, 0.2)' }
    : { backgroundColor: 'rgba(0, 166, 255, 0.08)', color: '#00A6FF', borderColor: 'rgba(0, 166, 255, 0.2)' };

  const tierLabel = project.tier === 's-tier' ? 'S TIER' : project.tier === 'ab-tier' ? 'A-B TIER' : 'ETC';
  const tierStyle = project.tier === 's-tier'
    ? { backgroundColor: 'rgba(87, 180, 0, 0.08)', color: '#57B400', borderColor: 'rgba(87, 180, 0, 0.2)' }
    : project.tier === 'ab-tier'
    ? { backgroundColor: 'rgba(130, 128, 255, 0.08)', color: '#8280FF', borderColor: 'rgba(130, 128, 255, 0.2)' }
    : { backgroundColor: 'rgba(136, 136, 136, 0.08)', color: '#888888', borderColor: 'rgba(136, 136, 136, 0.2)' };

  const statusStyle = project.status === 'release'
    ? { backgroundColor: 'rgba(0, 188, 125, 0.08)', color: '#00BC7D', borderColor: 'rgba(0, 188, 125, 0.2)' }
    : { backgroundColor: 'rgba(255, 157, 0, 0.08)', color: '#FF9D00', borderColor: 'rgba(255, 157, 0, 0.2)' };

  const hasDetailPage = project.hasDetail;

  const CardContent = () => (
    <>
      {/* 상단: 제목 + 뱃지들 */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900 leading-snug flex-1">{project.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium border-[0.5px]"
            style={categoryStyle}
          >
            {categoryLabel}
          </span>
          {project.tier && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium border-[0.5px]"
              style={tierStyle}
            >
              {tierLabel}
            </span>
          )}
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium border-[0.5px]"
            style={statusStyle}
          >
            {project.status === 'release' ? 'RELEASE' : 'IN PROGRESS'}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{project.description}</p>

      <div className="flex items-center justify-between">
        <DesignerBadge designer={project.designer} size="sm" />
        <div className="flex items-center gap-3">
          {hasDetailPage && (
            <span className="text-[#313131] text-sm font-semibold flex items-center gap-1">
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
              className="text-[#313131] hover:text-[#1a1a1a] text-sm font-semibold flex items-center gap-1 transition-colors"
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
