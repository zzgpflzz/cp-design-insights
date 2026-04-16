import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2026년 2월 샘플 데이터
const februaryProjects = [
  // S Tier
  {
    title: '1월 프리퀀시 이벤트',
    description: 'LINE FRIENDS Square 1월 프리퀀시 이벤트 페이지',
    link: 'https://linefriendssquare.com/blogs/lfs/2026squarechallenge',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: '2026 뉴이어 빅세일',
    description: '2026 신년 빅세일 이벤트 페이지',
    link: 'https://linefriendssquare.com/blogs/lfs/2026squarechallenge',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: 'MMMM Baby room',
    description: 'MMMM Baby room 팝업 안내 페이지',
    link: 'https://linefriendssquare.com/blogs/lfs/2026squarechallenge',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: '패밀리 세일',
    description: '패밀리 세일 이벤트 페이지',
    link: 'https://linefriendssquare.com/blogs/lfs/2026squarechallenge',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: '통합몰 2주년 이벤트',
    description: '통합몰 2주년 기념 이벤트 페이지',
    link: '',
    designer: 'hyeri' as const,
    status: 'inprogress' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: 'NCT Dreamiez 팝업 안내',
    description: 'NCT Dreamiez 팝업 스토어 안내 페이지',
    link: '',
    designer: 'ayoung' as const,
    status: 'inprogress' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: 'Mighteez 팝업 안내',
    description: 'Mighteez 팝업 스토어 안내 페이지',
    link: '',
    designer: 'hyeri' as const,
    status: 'inprogress' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },
  {
    title: 'ZO&FRIENDS 팝업 안내',
    description: 'ZO&FRIENDS 팝업 스토어 안내 페이지',
    link: '',
    designer: 'ayoung' as const,
    status: 'inprogress' as const,
    category: 'contents' as const,
    tier: 's-tier' as const,
    month: '2026-02',
  },

  // A-B Tier
  {
    title: '플러스 쿠폰 팩',
    description: '플러스 쿠폰 팩 프로모션 페이지',
    link: 'https://linefriendssquare.com/blogs/event',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },
  {
    title: 'LF & minini Souvenir',
    description: 'LINE FRIENDS & minini K-Souvenir 상품 페이지',
    link: 'https://linefriendssquare.com/blogs/drop/line-friends-minini-k-souvenir',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },
  {
    title: 'BT21 Strawberry',
    description: 'BT21 Strawberry Party 컬렉션 페이지',
    link: 'https://linefriendssquare.com/blogs/drop/bt21-strawberry-party',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },
  {
    title: 'Joguman Baseball',
    description: 'Joguman Baseball 컬렉션 페이지',
    link: 'https://linefriendssquare.com/blogs/drop/joguman-baseball',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },
  {
    title: '쎄봉라마 + 비믹스',
    description: '쎄봉라마 비믹스 콜라보 컬렉션 페이지',
    link: 'https://linefriendssquare.com/blogs/drop/ssebongrama-bmix',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },
  {
    title: 'LF K-Souvenir',
    description: 'LINE FRIENDS K-Souvenir 컬렉션 페이지',
    link: 'https://linefriendssquare.com/blogs/drop',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },
  {
    title: 'BT21 Ribboned u',
    description: 'BT21 Ribboned u 컬렉션 페이지',
    link: 'https://linefriendssquare.com/blogs/drop/bt21-ribboned-u',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'ab-tier' as const,
    month: '2026-02',
  },

  // etc
  {
    title: '[29cm] Coller + ZO&FRIENDS',
    description: '29cm 콜라보 - ZO&FRIENDS 컬렉션',
    link: '',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'etc' as const,
    month: '2026-02',
  },
  {
    title: '[SNS] 조구만 성수 프로모션',
    description: '조구만 성수 팝업 SNS 프로모션',
    link: 'https://www.instagram.com/p/DUSPCcukosJ/?img_index=1',
    designer: 'hyeri' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'etc' as const,
    month: '2026-02',
  },
  {
    title: '[템플릿] 팝업 안내 이벤트 템플릿',
    description: '팝업 안내 이벤트 템플릿 디자인',
    link: '',
    designer: 'ayoung' as const,
    status: 'inprogress' as const,
    category: 'contents' as const,
    tier: 'etc' as const,
    month: '2026-02',
  },
  {
    title: '[템플릿] 스퀘어 패스 - 드로우 템플릿',
    description: '스퀘어 패스 드로우 템플릿 디자인',
    link: '',
    designer: 'hyeri' as const,
    status: 'inprogress' as const,
    category: 'contents' as const,
    tier: 'etc' as const,
    month: '2026-02',
  },
  {
    title: '[LFSQ] 기획전 이벤트 띠배너 테스트',
    description: 'LFSQ 기획전 이벤트 띠배너 A/B 테스트',
    link: '',
    designer: 'ayoung' as const,
    status: 'release' as const,
    category: 'contents' as const,
    tier: 'etc' as const,
    month: '2026-02',
  },
];

async function addSampleData() {
  console.log('Adding sample data for February 2026...');

  for (const project of februaryProjects) {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        createdAt: new Date(),
      });
      console.log(`✓ Added: ${project.title} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`✗ Error adding ${project.title}:`, error);
    }
  }

  console.log('\nSample data added successfully!');
  process.exit(0);
}

addSampleData();
