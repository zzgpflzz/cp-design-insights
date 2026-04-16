import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 환경 변수 검증 (개발/프로덕션 모두)
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);

if (missingVars.length > 0) {
  const errorMsg = `❌ Missing Firebase environment variables:\n${missingVars.join('\n')}`;
  console.error(errorMsg);
  console.error('\n📝 To fix:');
  console.error('1. Check if .env.local file exists');
  console.error('2. Restart dev server: npm run dev');
  console.error('3. For Vercel: Add variables in Settings → Environment Variables');

  if (typeof window !== 'undefined') {
    // 브라우저에서만 표시
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        font-family: system-ui;
        background: #fef2f2;
        color: #991b1b;
      ">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Firebase Configuration Missing</h1>
        <p style="font-size: 1.1rem; margin-bottom: 2rem; max-width: 600px; text-align: center;">
          Please set up Firebase environment variables in your <code>.env.local</code> file.
        </p>
        <pre style="
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 2px solid #fca5a5;
          font-size: 0.9rem;
          overflow-x: auto;
          max-width: 800px;
        ">${missingVars.join('\n')}</pre>
        <p style="margin-top: 2rem; font-size: 0.9rem; color: #7c2d12;">
          After adding variables, restart the dev server: <code>npm run dev</code>
        </p>
      </div>
    `;
  }

  throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
};

console.log('✅ Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

export { app, db };
