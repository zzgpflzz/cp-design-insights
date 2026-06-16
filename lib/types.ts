export type Designer = 'hyeri' | 'ayoung' | 'unassigned';

export interface DesignerInfo {
  name: string;
  emoji: string;
  profileImage: string;
  color: string;
  bgColor: string;
}

export const DESIGNERS: Record<Designer, DesignerInfo> = {
  hyeri: {
    name: '장혜리',
    emoji: '🐰',
    profileImage: '/images/profile/hyeri.svg',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  ayoung: {
    name: '김아영',
    emoji: '🐶',
    profileImage: '/images/profile/ayoung.svg',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  unassigned: {
    name: '담당자 배정 중',
    emoji: '⏳',
    profileImage: '/images/profile/unassigned.svg',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
};

export type Status = 'release' | 'inprogress' | 'pending' | 'review' | 'cancelled';
export type Category = 'uiux' | 'contents';
export type Tier = 's-tier' | 'ab-tier' | 'etc';

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  analyticsPath?: string; // GA 데이터 매칭용 경로 (link와 다를 경우 사용)
  designer: Designer;
  status: Status;
  category: Category;
  tier?: Tier; // 우선순위 티어 (선택)
  month: string; // YYYY-MM 형식
  releaseDate?: string; // 릴리즈 예정일 (YYYY-MM-DD 형식)
  createdAt: Date;
  // 상세 페이지 관련
  hasDetail?: boolean; // 상세 페이지 존재 여부
  detailContent?: string; // 상세 설명 (마크다운 지원)
  detailImages?: string[]; // 상세 이미지 URL 배열
  thumbnailUrl?: string; // 프로젝트 썸네일 이미지 URL
}

export interface MonthlyData {
  month: string;
  projects: Project[];
}

export interface MonthlyAgenda {
  id: string;
  month: string; // YYYY-MM 형식
  content: string; // 주요 아젠다 내용
  createdAt: Date;
}

// 로드맵 프로젝트 (상위 개념)
export interface RoadmapProject {
  id: string;
  projectName: string;
  designer: Designer;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
}

// 프로젝트 진행 작업 (하위 개념)
export interface ProjectProgress {
  id: string;
  projectId: string;
  projectName: string;
  designer: Designer;
  taskName: string;
  status: 'nextup' | 'inprogress' | 'completed' | 'pending' | 'paused';
  startDate: string;
  endDate: string;
  description?: string;
  progress?: number;
  createdAt: Date;
}

// UI/UX 업데이트 (타임라인 형식)
export interface UIUXUpdate {
  id: string;
  title: string;
  version?: string; // 'v1.0', 'v2.0' 등
  date: string; // YYYY-MM-DD 형식
  status: 'completed' | 'inprogress'; // completed면 날짜, inprogress면 'ver. X' 표시
  description?: string; // 간단한 설명
  asIsImage?: string; // AS-IS 이미지 URL
  asIsText?: string; // AS-IS 텍스트 설명
  toBeImage?: string; // TO-BE 이미지 URL
  toBeText?: string; // TO-BE 텍스트 설명
  currentImage?: string; // 진행중인 UI 이미지 URL
  figmaUrl?: string; // 피그마 파일 URL (클릭 시 새 탭에서 열기)
  figmaEmbedUrl?: string; // 피그마 Embed URL (모달에서 iframe으로 표시)
  previewUrl?: string; // 구현된 페이지 미리보기 URL (내부 서브페이지)
  previewLabel?: string; // 미리보기 버튼 텍스트 (기본값: "바로가기")
  designer: Designer;
  createdAt: Date;
}

// TF 업무
export type TFName = 'lfsq' | 'ax';

export interface TFTask {
  id: string;
  tfName: TFName; // TF 이름 (LFSQ 앱구축 TF, AX TF)
  title: string;
  description: string;
  link: string; // 대시보드나 작업 페이지 링크
  linkLabel?: string; // 링크 버튼에 표시될 텍스트 (기본값: "바로가기")
  status: 'active' | 'completed' | 'planned'; // 진행중, 완료, 예정
  designer: Designer;
  createdAt: Date;
}

export const TF_NAMES: Record<TFName, { name: string; color: string; bgColor: string }> = {
  lfsq: {
    name: 'LFSQ 앱구축 TF',
    color: '#F83BAA',
    bgColor: 'rgba(248, 59, 170, 0.1)',
  },
  ax: {
    name: 'AX TF',
    color: '#00A6FF',
    bgColor: 'rgba(0, 166, 255, 0.1)',
  },
};
