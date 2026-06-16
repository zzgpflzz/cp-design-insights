import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import Papa from 'papaparse';

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

interface AnalyticsRow {
  '방문 페이지 경로': string;
  '유입 채널': string;
  '세션': string;
}

async function checkMatching() {
  try {
    // Firebase에서 프로젝트 가져오기
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: (doc.data() as any).title,
      link: (doc.data() as any).link,
      releaseDate: (doc.data() as any).releaseDate,
    }));

    // CSV 읽기
    const csvPath = resolve(__dirname, '../public/analytics-data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const csvPaths = new Set<string>();
    Papa.parse<AnalyticsRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach(row => {
          csvPaths.add(row['방문 페이지 경로']);
        });
      }
    });

    console.log('\n=== Analytics 매칭 확인 ===\n');
    console.log(`총 프로젝트: ${projects.length}개`);
    console.log(`CSV 경로: ${csvPaths.size}개\n`);

    let matchedCount = 0;
    let notMatchedCount = 0;

    projects.forEach(project => {
      if (!project.link) {
        console.log(`⚠️  [링크없음] ${project.title}`);
        return;
      }

      // URL에서 경로 추출
      let path: string;
      try {
        const url = new URL(project.link);
        path = url.pathname;
      } catch {
        path = project.link.startsWith('/') ? project.link : `/${project.link}`;
      }

      // CSV에 있는지 확인
      const matched = csvPaths.has(path);

      if (matched) {
        matchedCount++;
        console.log(`✅ [매칭] ${project.title}`);
        console.log(`   경로: ${path}`);
      } else {
        notMatchedCount++;
        console.log(`❌ [불일치] ${project.title}`);
        console.log(`   경로: ${path}`);

        // 유사한 경로 찾기
        const similar = Array.from(csvPaths).filter(csvPath => {
          const projectName = path.split('/').pop() || '';
          return csvPath.includes(projectName.substring(0, 10));
        });

        if (similar.length > 0) {
          console.log(`   🔍 유사 경로: ${similar[0]}`);
        }
      }
      console.log('');
    });

    console.log(`\n=== 결과 ===`);
    console.log(`매칭됨: ${matchedCount}개`);
    console.log(`불일치: ${notMatchedCount}개`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMatching();
