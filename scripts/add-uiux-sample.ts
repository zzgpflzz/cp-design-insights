import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

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

// 샘플 UI/UX 업데이트 데이터
const uiuxUpdates = [
  {
    title: '프로젝트 카드 레이아웃 개선',
    version: '2.0',
    date: '2026-05-15',
    status: 'completed',
    description: '프로젝트 카드의 가독성을 개선하고 정보 계층을 재구성했습니다.',
    asIsImage: 'https://via.placeholder.com/600x400/e0e0e0/666?text=AS-IS',
    toBeImage: 'https://via.placeholder.com/600x400/00BC7D/fff?text=TO-BE',
    designer: 'hyeri',
  },
  {
    title: '대시보드 네비게이션 개편',
    version: '1.5',
    date: '2026-06-10',
    status: 'inprogress',
    description: '사용자 피드백을 반영하여 네비게이션 구조를 개선하고 있습니다.',
    currentImage: 'https://via.placeholder.com/800x500/FF9D00/fff?text=Current+Progress',
    designer: 'ayoung',
  },
  {
    title: '월간 리포트 UI 리뉴얼',
    version: '3.0',
    date: '2026-04-20',
    status: 'completed',
    description: '데이터 시각화를 개선하고 인터랙티브한 차트를 추가했습니다.',
    asIsImage: 'https://via.placeholder.com/600x400/e0e0e0/666?text=Old+Report',
    toBeImage: 'https://via.placeholder.com/600x400/00BC7D/fff?text=New+Report',
    designer: 'hyeri',
  },
  {
    title: '다크모드 지원',
    version: '1.0',
    date: '2026-06-15',
    status: 'inprogress',
    description: '전체 인터페이스에 다크모드를 추가하는 작업을 진행중입니다.',
    currentImage: 'https://via.placeholder.com/800x500/1a1a1a/fff?text=Dark+Mode+Preview',
    designer: 'ayoung',
  },
];

async function addUIUXUpdates() {
  console.log('Adding UI/UX sample updates...\n');

  for (const update of uiuxUpdates) {
    try {
      const docRef = await addDoc(collection(db, 'uiuxUpdates'), {
        ...update,
        createdAt: new Date(),
      });
      console.log(`✓ Added: ${update.title} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`✗ Error adding ${update.title}:`, error);
    }
  }

  console.log('\nUI/UX sample updates added successfully!');
  process.exit(0);
}

addUIUXUpdates();
