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

async function findGenshinProject() {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any));

    console.log('=== "원신" 또는 "genshin" 포함 프로젝트 ===\n');

    const genshinProjects = projects.filter((p: any) =>
      p.title?.toLowerCase().includes('원신') ||
      p.title?.toLowerCase().includes('genshin') ||
      p.link?.toLowerCase().includes('genshin')
    );

    genshinProjects.forEach((p: any) => {
      console.log(`제목: ${p.title}`);
      console.log(`  ID: ${p.id}`);
      console.log(`  현재 Link: ${p.link || 'NO LINK'}`);
      console.log(`  Designer: ${p.designer}`);
      console.log(`  Month: ${p.month}`);
      console.log(`  Status: ${p.status}`);
      console.log();
    });

    console.log('=== 올바른 링크 ===');
    console.log('실제 GA 데이터: /blogs/event/genshin-minini-liyue');
    console.log('Full URL: https://linefriendssquare.com/blogs/event/genshin-minini-liyue');

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

findGenshinProject();
