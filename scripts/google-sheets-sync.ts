/**
 * Google Sheets 통합 관리 시스템
 *
 * 기능:
 * 1. CSV 파일을 Google Sheets로 업로드
 * 2. Google Sheets 데이터를 Firebase로 동기화
 * 3. 월별 세션 데이터 자동 집계 및 아젠다 생성
 */

import { google } from 'googleapis';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase 설정
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
  pageViews?: number;
}

interface MonthlyStats {
  month: string;
  totalSessions: number;
  topPaths: Array<{
    path: string;
    sessions: number;
    percentage: string;
  }>;
}

// Google Sheets 인증 설정
async function getGoogleSheetsAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

// CSV 파싱
function parseCSV(filePath: string): SessionData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').slice(1); // Skip header

  return lines
    .filter(line => line.trim())
    .map(line => {
      // "path","channel",sessions,pageViews,avgDuration 형식
      const match = line.match(/"([^"]+)","([^"]+)",(\d+),(?:([\d.]+),)?([\d.]+)/);
      if (!match) return null;

      const data: SessionData = {
        path: match[1],
        channel: match[2],
        sessions: parseInt(match[3]),
        avgDuration: parseFloat(match[5]),
      };

      if (match[4]) {
        data.pageViews = parseFloat(match[4]);
      }

      return data;
    })
    .filter((item): item is SessionData => item !== null);
}

// 월별 통계 계산
function calculateMonthlyStats(data: SessionData[], month: string): MonthlyStats {
  const totalSessions = data.reduce((sum, item) => sum + item.sessions, 0);

  // 경로별 세션 합계
  const pathTotals = new Map<string, number>();
  data.forEach(item => {
    const current = pathTotals.get(item.path) || 0;
    pathTotals.set(item.path, current + item.sessions);
  });

  // 상위 5개 경로
  const topPaths = Array.from(pathTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, sessions]) => ({
      path,
      sessions,
      percentage: ((sessions / totalSessions) * 100).toFixed(1)
    }));

  return {
    month,
    totalSessions,
    topPaths
  };
}

// Google Sheets에 데이터 업로드
async function uploadToGoogleSheets(
  spreadsheetId: string,
  sheetName: string,
  data: SessionData[]
) {
  const auth = await getGoogleSheetsAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // 헤더
  const headers = ['방문 페이지 경로', '유입 채널', '세션', '세션당 페이지 뷰', '평균 세션 지속 시간'];

  // 데이터 변환
  const rows = data.map(item => [
    item.path,
    item.channel,
    item.sessions,
    item.pageViews || '',
    item.avgDuration
  ]);

  const values = [headers, ...rows];

  try {
    // 기존 시트가 있는지 확인
    const sheetsInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheet = sheetsInfo.data.sheets?.find(
      s => s.properties?.title === sheetName
    );

    if (existingSheet) {
      // 기존 시트 데이터 클리어
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:E`,
      });
    } else {
      // 새 시트 생성
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
              }
            }
          }]
        }
      });
    }

    // 데이터 업로드
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`✅ Google Sheets 업로드 완료: ${sheetName}`);
  } catch (error) {
    console.error('Google Sheets 업로드 오류:', error);
    throw error;
  }
}

// Google Sheets에서 데이터 읽기
async function readFromGoogleSheets(
  spreadsheetId: string,
  sheetName: string
): Promise<SessionData[]> {
  const auth = await getGoogleSheetsAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E`, // 헤더 제외
    });

    const rows = response.data.values || [];

    return rows
      .filter(row => row.length >= 3)
      .map(row => ({
        path: row[0],
        channel: row[1],
        sessions: parseInt(row[2]) || 0,
        pageViews: row[3] ? parseFloat(row[3]) : undefined,
        avgDuration: parseFloat(row[4]) || 0,
      }));
  } catch (error) {
    console.error('Google Sheets 읽기 오류:', error);
    throw error;
  }
}

// Firebase에 월별 아젠다 업로드
async function uploadMonthlyAgenda(stats: MonthlyStats) {
  const content = `📊 ${stats.month.substring(0, 4)}년 ${parseInt(stats.month.substring(5, 7))}월 세션 데이터 분석

• 총 세션 수: ${stats.totalSessions.toLocaleString()}회

🔝 상위 방문 경로:
${stats.topPaths.map((item, idx) => `${idx + 1}. ${item.path}
   └ ${item.sessions.toLocaleString()}회 (${item.percentage}%)`).join('\n')}`;

  // 기존 아젠다 확인
  const existingQuery = query(
    collection(db, 'agendas'),
    where('month', '==', stats.month)
  );
  const existingDocs = await getDocs(existingQuery);

  // 기존 아젠다 삭제
  for (const docSnapshot of existingDocs.docs) {
    await deleteDoc(doc(db, 'agendas', docSnapshot.id));
  }

  // 새 아젠다 추가
  await addDoc(collection(db, 'agendas'), {
    month: stats.month,
    content: content,
    createdAt: new Date(),
  });

  console.log(`✅ Firebase 아젠다 업로드 완료: ${stats.month}`);
}

// 메인 함수
async function main() {
  const command = process.argv[2];
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    console.error('❌ GOOGLE_SHEETS_ID 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'upload-csv': {
        // CSV 파일들을 Google Sheets로 업로드
        const mayCSV = '/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-05-01 - 2026-05-31.csv';
        const juneCSV = '/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-06-01 - 2026-06-15.csv';

        console.log('📤 CSV 파일을 Google Sheets로 업로드 중...\n');

        const mayData = parseCSV(mayCSV);
        const juneData = parseCSV(juneCSV);

        await uploadToGoogleSheets(spreadsheetId, '2026-05 세션', mayData);
        await uploadToGoogleSheets(spreadsheetId, '2026-06 세션', juneData);

        console.log('\n✅ 모든 CSV 업로드 완료!');
        console.log(`📊 Google Sheets: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        break;
      }

      case 'sync-to-firebase': {
        // Google Sheets 데이터를 Firebase로 동기화
        console.log('🔄 Google Sheets 데이터를 Firebase로 동기화 중...\n');

        const mayData = await readFromGoogleSheets(spreadsheetId, '2026-05 세션');
        const juneData = await readFromGoogleSheets(spreadsheetId, '2026-06 세션');

        const mayStats = calculateMonthlyStats(mayData, '2026-05');
        const juneStats = calculateMonthlyStats(juneData, '2026-06');

        await uploadMonthlyAgenda(mayStats);
        await uploadMonthlyAgenda(juneStats);

        console.log('\n✅ Firebase 동기화 완료!');
        break;
      }

      case 'full-sync': {
        // CSV → Google Sheets → Firebase 전체 동기화
        console.log('🚀 전체 동기화 시작...\n');

        // 1. CSV → Google Sheets
        const mayCSV = '/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-05-01 - 2026-05-31.csv';
        const juneCSV = '/Users/user/Downloads/방문 페이지 경로별 세션_디자인 파트  - 2026-06-01 - 2026-06-15.csv';

        const mayData = parseCSV(mayCSV);
        const juneData = parseCSV(juneCSV);

        await uploadToGoogleSheets(spreadsheetId, '2026-05 세션', mayData);
        await uploadToGoogleSheets(spreadsheetId, '2026-06 세션', juneData);

        // 2. Google Sheets → Firebase
        const mayStats = calculateMonthlyStats(mayData, '2026-05');
        const juneStats = calculateMonthlyStats(juneData, '2026-06');

        await uploadMonthlyAgenda(mayStats);
        await uploadMonthlyAgenda(juneStats);

        console.log('\n🎉 전체 동기화 완료!');
        console.log(`📊 Google Sheets: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        break;
      }

      default:
        console.log(`
Google Sheets 통합 관리 시스템

사용법:
  npm run sheets:upload-csv      - CSV 파일을 Google Sheets로 업로드
  npm run sheets:sync            - Google Sheets 데이터를 Firebase로 동기화
  npm run sheets:full-sync       - CSV → Google Sheets → Firebase 전체 동기화

환경변수 설정 필요:
  GOOGLE_SHEETS_ID              - Google Sheets 스프레드시트 ID
  GOOGLE_APPLICATION_CREDENTIALS - Google API 인증 JSON 파일 경로
        `);
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
