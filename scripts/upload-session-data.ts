import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

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

interface SessionData {
  path: string;
  channel: string;
  sessions: number;
  avgDuration: number;
}

function parseCSV(filePath: string): SessionData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').slice(1); // Skip header

  return lines
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/"([^"]+)","([^"]+)",(\d+),(?:[\d.]+,)?([\d.]+)/);
      if (!match) return null;

      return {
        path: match[1],
        channel: match[2],
        sessions: parseInt(match[3]),
        avgDuration: parseFloat(match[4]),
      };
    })
    .filter((item): item is SessionData => item !== null);
}

function getMonthFromDate(dateStr: string): string {
  // Extract month from "2026-05-01 - 2026-05-31" format
  const match = dateStr.match(/(\d{4})-(\d{2})-\d{2}/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return '';
}

async function uploadSessionData() {
  try {
    // 파일들 읽기
    const mayDataNew = parseCSV('/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-05-01 - 2026-05-31.csv');
    const juneData = parseCSV('/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-06-01 - 2026-06-15.csv');

    console.log(`5월 데이터: ${mayDataNew.length}개 행`);
    console.log(`6월 데이터: ${juneData.length}개 행`);

    // 월별 총 세션 수 계산
    const mayTotalSessions = mayDataNew.reduce((sum, item) => sum + item.sessions, 0);
    const juneTotalSessions = juneData.reduce((sum, item) => sum + item.sessions, 0);

    console.log(`\n5월 총 세션 수: ${mayTotalSessions.toLocaleString()}`);
    console.log(`6월 총 세션 수: ${juneTotalSessions.toLocaleString()}`);

    // 월별 상위 경로 계산
    const getMayTopPaths = (data: SessionData[], limit: number = 5) => {
      const pathTotals = new Map<string, number>();

      data.forEach(item => {
        const current = pathTotals.get(item.path) || 0;
        pathTotals.set(item.path, current + item.sessions);
      });

      return Array.from(pathTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([path, sessions]) => ({
          path,
          sessions,
          percentage: ((sessions / mayTotalSessions) * 100).toFixed(1)
        }));
    };

    const getJuneTopPaths = (data: SessionData[], limit: number = 5) => {
      const pathTotals = new Map<string, number>();

      data.forEach(item => {
        const current = pathTotals.get(item.path) || 0;
        pathTotals.set(item.path, current + item.sessions);
      });

      return Array.from(pathTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([path, sessions]) => ({
          path,
          sessions,
          percentage: ((sessions / juneTotalSessions) * 100).toFixed(1)
        }));
    };

    const mayTopPaths = getMayTopPaths(mayDataNew);
    const juneTopPaths = getJuneTopPaths(juneData);

    console.log('\n5월 상위 경로:');
    mayTopPaths.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.path}: ${item.sessions.toLocaleString()} (${item.percentage}%)`);
    });

    console.log('\n6월 상위 경로 (6/1-6/15):');
    juneTopPaths.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.path}: ${item.sessions.toLocaleString()} (${item.percentage}%)`);
    });

    // 기존 아젠다 확인
    const existingAgendas = await getDocs(collection(db, 'agendas'));
    console.log(`\n기존 아젠다 수: ${existingAgendas.size}개`);

    // 5월과 6월 아젠다가 이미 있는지 확인
    const mayQuery = query(collection(db, 'agendas'), where('month', '==', '2026-05'));
    const juneQuery = query(collection(db, 'agendas'), where('month', '==', '2026-06'));

    const mayDocs = await getDocs(mayQuery);
    const juneDocs = await getDocs(juneQuery);

    // 5월 아젠다 생성
    const mayContent = `📊 5월 세션 데이터 분석

• 총 세션 수: ${mayTotalSessions.toLocaleString()}회
• 데이터 기간: 2026-05-01 ~ 2026-05-31

🔝 상위 방문 경로:
${mayTopPaths.map((item, idx) => `${idx + 1}. ${item.path}
   └ ${item.sessions.toLocaleString()}회 (${item.percentage}%)`).join('\n')}`;

    if (mayDocs.empty) {
      await addDoc(collection(db, 'agendas'), {
        month: '2026-05',
        content: mayContent,
        createdAt: new Date(),
      });
      console.log('\n✅ 5월 세션 데이터 아젠다 추가 완료');
    } else {
      console.log('\n⚠️  5월 아젠다가 이미 존재합니다. 삭제 후 다시 추가하시겠습니까?');
      // 여기서는 일단 업데이트하지 않음
    }

    // 6월 아젠다 생성
    const juneContent = `📊 6월 세션 데이터 분석 (6/1-6/15)

• 총 세션 수: ${juneTotalSessions.toLocaleString()}회
• 데이터 기간: 2026-06-01 ~ 2026-06-15

🔝 상위 방문 경로:
${juneTopPaths.map((item, idx) => `${idx + 1}. ${item.path}
   └ ${item.sessions.toLocaleString()}회 (${item.percentage}%)`).join('\n')}`;

    if (juneDocs.empty) {
      await addDoc(collection(db, 'agendas'), {
        month: '2026-06',
        content: juneContent,
        createdAt: new Date(),
      });
      console.log('✅ 6월 세션 데이터 아젠다 추가 완료');
    } else {
      console.log('⚠️  6월 아젠다가 이미 존재합니다.');
    }

    console.log('\n🎉 데이터 업로드 완료!');

  } catch (error) {
    console.error('Error uploading session data:', error);
    throw error;
  }
}

uploadSessionData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
