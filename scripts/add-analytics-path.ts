import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
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

async function addAnalyticsPath() {
  const projectId = 'xXHo1YyGA3eICumEglKu';
  const analyticsPath = '/blogs/event/genshin-minini-liyue';

  try {
    console.log('Adding analyticsPath field to 원신 미니니 리월...\n');
    console.log(`Project ID: ${projectId}`);
    console.log(`Analytics Path: ${analyticsPath}\n`);

    await updateDoc(doc(db, 'projects', projectId), {
      analyticsPath: analyticsPath
    });

    console.log('✓ analyticsPath field added successfully!');
    console.log('\n이제 GA 데이터 매칭 시:');
    console.log('  - link: shopifypreview URL (UI 클릭용)');
    console.log('  - analyticsPath: /blogs/event/genshin-minini-liyue (GA 매칭용)');
  } catch (error) {
    console.error('Error adding analyticsPath:', error);
  }

  process.exit(0);
}

addAnalyticsPath();
