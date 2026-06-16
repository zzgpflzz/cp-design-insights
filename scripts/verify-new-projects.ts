import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

const targetTitles = [
  'TRUZ Fruits 과일게임',
  'NCT wishnini house 퍼즐게임',
  '원신 미니니 리월',
  '스프링 페스타',
  'JOGUMAN Lucky Draw'
];

async function verifyProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any));

    console.log('=== 방금 생성/수정된 프로젝트 확인 ===\n');

    targetTitles.forEach(targetTitle => {
      const found = projects.find((p: any) => p.title === targetTitle);
      if (found) {
        console.log(`✓ ${found.title}`);
        console.log(`  ID: ${found.id}`);
        console.log(`  Link: ${found.link || 'NO LINK'}`);
        console.log(`  Designer: ${found.designer}`);
        console.log(`  Month: ${found.month}`);
        console.log(`  Status: ${found.status}`);
        console.log(`  Tier: ${found.tier}`);
        console.log();
      } else {
        console.log(`✗ "${targetTitle}" - NOT FOUND`);
        console.log();
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

verifyProjects();
