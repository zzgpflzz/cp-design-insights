import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CSV 파일 읽기
const csvPath = '/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-05-01 - 2026-05-31.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').slice(1); // 헤더 제외

// URL path 추출 (중복 제거)
const urlPaths = new Set<string>();
lines.forEach(line => {
  const match = line.match(/^"([^"]+)"/);
  if (match) {
    const urlPath = match[1];
    // /blogs/event/ 또는 /blogs/drop/ 등으로 시작하는 것만
    if (urlPath.match(/^\/(en\/)?blogs\/(event|drop|lfs)\//)) {
      // 쿼리 파라미터 제거
      const cleanPath = urlPath.split('?')[0].split('&')[0];
      urlPaths.add(cleanPath);
    }
  }
});

console.log(`Extracted ${urlPaths.size} unique URL paths from CSV\n`);

async function matchProjects() {
  try {
    // 모든 프로젝트 가져오기
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any));

    console.log(`Total projects in Firebase: ${projects.length}\n`);

    // 매칭되는 프로젝트 찾기
    const matched: any[] = [];
    const unmatched: string[] = [];

    urlPaths.forEach(urlPath => {
      const found = projects.find(project => {
        // analyticsPath가 있으면 우선 사용
        if (project.analyticsPath) {
          return project.analyticsPath === urlPath;
        }

        // analyticsPath 없으면 link 사용
        if (!project.link) return false;

        // URL에서 path 추출
        try {
          const projectPath = new URL(project.link).pathname;
          return projectPath === urlPath;
        } catch {
          // 상대 경로인 경우
          return project.link === urlPath || project.link.includes(urlPath);
        }
      });

      if (found) {
        matched.push({ urlPath, project: found });
      } else {
        unmatched.push(urlPath);
      }
    });

    console.log('=== MATCHED PROJECTS (5월에 트래픽 있음) ===\n');
    matched.forEach(({ urlPath, project }) => {
      console.log(`✓ ${project.title}`);
      console.log(`  URL: ${urlPath}`);
      console.log(`  Month: ${project.month} | Designer: ${project.designer} | Status: ${project.status}`);
      console.log();
    });

    console.log(`\n=== UNMATCHED URLs (Firebase에 없는 프로젝트 - 총 ${unmatched.length}개) ===\n`);
    // 세션이 많은 순으로 정렬해서 상위 20개만 표시
    const urlSessions = new Map<string, number>();
    lines.forEach(line => {
      const match = line.match(/^"([^"]+)","[^"]+",(\d+)/);
      if (match) {
        const urlPath = match[1].split('?')[0].split('&')[0];
        const sessions = parseInt(match[2]);
        if (!urlSessions.has(urlPath)) {
          urlSessions.set(urlPath, 0);
        }
        urlSessions.set(urlPath, urlSessions.get(urlPath)! + sessions);
      }
    });

    const unmatchedWithSessions = unmatched
      .map(path => ({ path, sessions: urlSessions.get(path) || 0 }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 30);

    unmatchedWithSessions.forEach(({ path, sessions }) => {
      console.log(`✗ ${path} (${sessions.toLocaleString()} sessions)`);
    });

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

matchProjects();
