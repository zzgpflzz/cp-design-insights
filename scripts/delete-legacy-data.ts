import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteLegacyData() {
  console.log('🗑️  구형 데이터 삭제 시작...\n');

  try {
    const querySnapshot = await getDocs(collection(db, 'projectProgresses'));

    const legacyDocs: Array<{ id: string; data: any }> = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.projectId) {
        legacyDocs.push({
          id: docSnap.id,
          data: {
            projectName: data.projectName,
            taskName: data.taskName,
          },
        });
      }
    });

    if (legacyDocs.length === 0) {
      console.log('✨ 삭제할 구형 데이터가 없습니다.');
      process.exit(0);
      return;
    }

    console.log(`⚠️  ${legacyDocs.length}개의 구형 데이터를 삭제합니다:\n`);

    for (const legacyDoc of legacyDocs) {
      console.log(`   - [${legacyDoc.id}] ${legacyDoc.data.projectName} / ${legacyDoc.data.taskName}`);
      await deleteDoc(doc(db, 'projectProgresses', legacyDoc.id));
    }

    console.log(`\n✅ ${legacyDocs.length}개의 구형 데이터가 삭제되었습니다.`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }

  process.exit(0);
}

deleteLegacyData();
