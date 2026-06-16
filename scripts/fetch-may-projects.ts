import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
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

async function fetchMayProjects() {
  console.log('Fetching May 2026 projects...\n');

  try {
    // 2026-05 월 프로젝트 조회
    const q = query(collection(db, 'projects'), where('month', '==', '2026-05'));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.docs.length} projects for May 2026:\n`);

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`  Title: ${data.title}`);
      console.log(`  Link: ${data.link}`);
      console.log(`  Designer: ${data.designer}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Tier: ${data.tier}`);
      console.log(`  Month: ${data.month}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
  }

  process.exit(0);
}

fetchMayProjects();
