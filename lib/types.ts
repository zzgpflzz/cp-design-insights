export type Designer = 'hyeri' | 'ayoung';

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
};

export type Status = 'release' | 'inprogress';
export type Category = 'uiux' | 'contents';
export type Tier = 's-tier' | 'ab-tier' | 'etc';

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  designer: Designer;
  status: Status;
  category: Category;
  tier?: Tier; // 우선순위 티어 (선택)
  month: string; // YYYY-MM 형식
  createdAt: Date;
  // 상세 페이지 관련
  hasDetail?: boolean; // 상세 페이지 존재 여부
  detailContent?: string; // 상세 설명 (마크다운 지원)
  detailImages?: string[]; // 상세 이미지 URL 배열
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
  projectName: string; // 프로젝트명
  designer: Designer; // 담당 디자이너
  description?: string; // 프로젝트 설명
  startDate?: string; // 전체 프로젝트 시작일
  endDate?: string; // 전체 프로젝트 종료일
  createdAt: Date;
}

// 프로젝트 진행 작업 (하위 개념)
export interface ProjectProgress {
  id: string;
  projectId: string; // 상위 프로젝트 ID
  projectName: string; // 프로젝트명 (기존 데이터 호환용)
  designer?: Designer; // 담당 디자이너 (기존 데이터 호환)
  taskName: string; // 작업명 (예: 레퍼런스 서치, 화면 디자인 등)
  status: 'nextup' | 'inprogress' | 'completed' | 'pending' | 'paused'; // 진행 상태
  startDate: string; // 시작일 (YYYY-MM-DD)
  endDate: string; // 종료일 (YYYY-MM-DD)
  description?: string; // 상세 설명 (선택)
  progress?: number; // 진척률 (0-100) (선택)
  createdAt: Date;
}
