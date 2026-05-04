import Papa from 'papaparse';

export interface AnalyticsRow {
  '방문 페이지 경로': string;
  '유입 채널': string;
  '세션': string;
  '평균 세션 지속 시간': string;
}

export interface AggregatedAnalytics {
  path: string;
  totalSessions: number;
  avgDuration: number;
}

let cachedAnalytics: Map<string, AggregatedAnalytics> | null = null;

export async function loadAnalyticsData(): Promise<Map<string, AggregatedAnalytics>> {
  if (cachedAnalytics) {
    return cachedAnalytics;
  }

  try {
    const response = await fetch('/analytics-data.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<AnalyticsRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const aggregated = new Map<string, AggregatedAnalytics>();

          // 경로별로 그룹화하여 세션 합계 및 가중 평균 계산
          const pathData = new Map<string, { totalSessions: number; weightedDuration: number }>();

          results.data.forEach((row) => {
            const path = row['방문 페이지 경로'];
            const sessions = parseInt(row['세션'], 10) || 0;
            const duration = parseFloat(row['평균 세션 지속 시간']) || 0;

            if (!path || sessions === 0) return;

            const existing = pathData.get(path) || { totalSessions: 0, weightedDuration: 0 };
            existing.totalSessions += sessions;
            existing.weightedDuration += duration * sessions;
            pathData.set(path, existing);
          });

          // 가중 평균 계산
          pathData.forEach((data, path) => {
            aggregated.set(path, {
              path,
              totalSessions: data.totalSessions,
              avgDuration: data.totalSessions > 0 ? data.weightedDuration / data.totalSessions : 0,
            });
          });

          cachedAnalytics = aggregated;
          resolve(aggregated);
        },
        error: (error: Error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Failed to load analytics data:', error);
    return new Map();
  }
}

// 프로젝트 링크에서 경로 추출
export function extractPathFromLink(link?: string): string | null {
  if (!link) return null;

  try {
    const url = new URL(link);
    return url.pathname;
  } catch {
    // URL이 아닌 경우 그냥 링크를 경로로 사용
    if (link.startsWith('/')) {
      return link;
    }
    return null;
  }
}

// 프로젝트의 실제 분석 데이터 가져오기
export function getProjectAnalytics(
  analyticsMap: Map<string, AggregatedAnalytics>,
  projectLink?: string
): { views: number; avgTime: string } | null {
  const path = extractPathFromLink(projectLink);
  if (!path) return null;

  const analytics = analyticsMap.get(path);
  if (!analytics) return null;

  // 세션 지속 시간을 분:초 형식으로 변환
  const totalSeconds = Math.round(analytics.avgDuration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const avgTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    views: analytics.totalSessions,
    avgTime,
  };
}
