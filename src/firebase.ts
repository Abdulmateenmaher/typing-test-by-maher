import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { TestResult } from './types';
import { MAX_HUMAN_WPM, MAX_HUMAN_RAW_WPM, validateTestScore } from './utils/antiCheat';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkatf0x9ELI7IwpezttDONMmJDTzEiuNo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "typing-test-by-maher.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "typing-test-by-maher",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "typing-test-by-maher.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "977851930372",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:977851930372:web:7dd36303f9fd8b0b4c2251",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0D4HF5SW8W"
};

// Initialize Firebase App safely (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore with experimentalForceLongPolling to eliminate WebChannel drops in iframe/container environments
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore Error Handler Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Leaderboard Record Interface
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  bestWpm: number;
  bestRawWpm: number;
  bestAccuracy: number;
  totalTests: number;
  updatedAt: string;
}

// Save Test Result to User's Firestore History
export async function saveTestToCloud(userId: string, test: TestResult): Promise<void> {
  const testPath = `users/${userId}/tests`;
  try {
    const testDocRef = doc(db, 'users', userId, 'tests', test.id);
    await setDoc(testDocRef, {
      userId,
      wpm: test.wpm,
      rawWpm: test.rawWpm,
      accuracy: test.accuracy,
      consistency: test.consistency,
      correctChars: test.correctChars,
      incorrectChars: test.incorrectChars,
      extraChars: test.extraChars,
      missedChars: test.missedChars,
      totalChars: test.totalChars,
      duration: test.duration,
      mode: test.mode,
      modeDetail: test.modeDetail,
      difficulty: test.difficulty,
      createdAt: test.date,
      serverTimestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, testPath);
  }
}

// Fetch User's Cloud Test History
export async function fetchUserCloudHistory(userId: string): Promise<TestResult[]> {
  const testPath = `users/${userId}/tests`;
  try {
    const q = query(
      collection(db, 'users', userId, 'tests'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    const results: TestResult[] = [];
    snap.forEach((d) => {
      const data = d.data();
      results.push({
        id: d.id,
        date: data.createdAt || new Date().toISOString(),
        wpm: data.wpm || 0,
        rawWpm: data.rawWpm || 0,
        accuracy: data.accuracy || 100,
        consistency: data.consistency || 100,
        correctChars: data.correctChars || 0,
        incorrectChars: data.incorrectChars || 0,
        extraChars: data.extraChars || 0,
        missedChars: data.missedChars || 0,
        totalChars: data.totalChars || 0,
        duration: data.duration || 30,
        mode: data.mode || 'time',
        modeDetail: data.modeDetail || '30s',
        difficulty: data.difficulty || 'normal',
        timeline: [],
        keyStats: {},
        mistypedWords: [],
      });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, testPath);
    return [];
  }
}

// Update User's Public Ranking Entry (with Anti-Cheat Verification)
export async function syncUserLeaderboard(
  user: User,
  allUserTests: TestResult[]
): Promise<void> {
  const leaderboardPath = `leaderboard/${user.uid}`;
  try {
    if (allUserTests.length === 0) return;

    // Filter to only legitimate human test results
    const legitTests = allUserTests.filter((t) => {
      if (t.wpm > MAX_HUMAN_WPM || t.rawWpm > MAX_HUMAN_RAW_WPM) return false;
      const check = validateTestScore(t.wpm, t.rawWpm, t.duration, t.totalChars, t.accuracy);
      return check.safe;
    });

    if (legitTests.length === 0) return;

    const bestWpm = legitTests.reduce((max, t) => Math.max(max, t.wpm), 0);
    const bestRawWpm = legitTests.reduce((max, t) => Math.max(max, t.rawWpm), 0);
    const bestTest = legitTests.find((t) => t.wpm === bestWpm);

    const docRef = doc(db, 'leaderboard', user.uid);
    await setDoc(
      docRef,
      {
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous Typist',
        photoURL: user.photoURL || '',
        bestWpm: Math.min(MAX_HUMAN_WPM, Math.max(0, bestWpm)),
        bestRawWpm: Math.min(MAX_HUMAN_RAW_WPM, Math.max(0, bestRawWpm)),
        bestAccuracy: bestTest ? Math.min(100, Math.max(0, bestTest.accuracy)) : 100,
        totalTests: legitTests.length,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, leaderboardPath);
  }
}

// Fetch Global Leaderboard Rankings (sanitizes and purges fraudulent >250 WPM hacker submissions)
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const leaderboardPath = 'leaderboard';
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('bestWpm', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      const wpm = data.bestWpm || 0;
      const rawWpm = data.bestRawWpm || 0;

      // Anti-Cheat: Reject any entries exceeding physical human thresholds (e.g. 400 WPM console bot)
      if (wpm > MAX_HUMAN_WPM || rawWpm > MAX_HUMAN_RAW_WPM) {
        return; // Purge illegitimate entry
      }

      entries.push({
        userId: d.id,
        displayName: data.displayName || 'Typist',
        photoURL: data.photoURL,
        bestWpm: wpm,
        bestRawWpm: rawWpm,
        bestAccuracy: data.bestAccuracy || 100,
        totalTests: data.totalTests || 1,
        updatedAt: data.updatedAt || '',
      });
    });
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, leaderboardPath);
    return [];
  }
}
