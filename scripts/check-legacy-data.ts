import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkLegacyData() {
  console.log('🔍 구형 데이터 확인 중...\n');

  try {
    const querySnapshot = await getDocs(collection(db, 'projectProgresses'));

    let totalCount = 0;
    let legacyCount = 0;
    let newCount = 0;
    const legacyDocs: any[] = [];

    querySnapshot.forEach((doc) => {
      totalCount++;
      const data = doc.data();

      if (!data.projectId) {
        legacyCount++;
        legacyDocs.push({
          id: doc.id,
          projectName: data.projectName,
          taskName: data.taskName,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
        });
      } else {
        newCount++;
      }
    });

    console.log('📊 통계:');
    console.log(`   전체 문서: ${totalCount}개`);
    console.log(`   신규 구조 (projectId 있음): ${newCount}개 ✅`);
    console.log(`   구형 구조 (projectId 없음): ${legacyCount}개 ⚠️\n`);

    if (legacyCount > 0) {
      console.log('⚠️  구형 데이터 목록:');
      legacyDocs.forEach((doc, index) => {
        console.log(`   ${index + 1}. [${doc.id}]`);
        console.log(`      프로젝트: ${doc.projectName}`);
        console.log(`      작업: ${doc.taskName}`);
        console.log(`      생성일: ${doc.createdAt}\n`);
      });

      console.log('💡 다음 명령으로 구형 데이터를 삭제할 수 있습니다:');
      console.log('   npm run delete-legacy-data');
    } else {
      console.log('✨ 구형 데이터가 없습니다. 모두 신규 구조로 되어 있습니다!');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }

  process.exit(0);
}

checkLegacyData();
