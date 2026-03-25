import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { UserDoc } from "@/types";

// ─── Init ─────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// ─── User operations ──────────────────────────────────────────────────────────

export async function getOrCreateUser(address: string): Promise<UserDoc> {
  const firestore = getDb();
  const ref = doc(firestore, "users", address.toLowerCase());
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as UserDoc;
  }

  const newUser: UserDoc = {
    address:      address.toLowerCase(),
    balance:      0,
    totalWins:    0,
    totalLosses:  0,
    createdAt:    Date.now(),
    updatedAt:    Date.now(),
  };
  await setDoc(ref, newUser);
  return newUser;
}

export async function getUserBalance(address: string): Promise<number> {
  const firestore = getDb();
  const ref  = doc(firestore, "users", address.toLowerCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  return (snap.data() as UserDoc).balance;
}

/** Add chips (can be negative to subtract) */
export async function updateUserBalance(
  address: string,
  delta: number
): Promise<void> {
  const firestore = getDb();
  const ref = doc(firestore, "users", address.toLowerCase());
  await updateDoc(ref, {
    balance:   increment(delta),
    updatedAt: Date.now(),
  });
}

export async function recordGameResult(
  address: string,
  win: boolean,
  delta: number
): Promise<void> {
  const firestore = getDb();
  const ref = doc(firestore, "users", address.toLowerCase());
  await updateDoc(ref, {
    balance:      increment(delta),
    totalWins:    increment(win ? 1 : 0),
    totalLosses:  increment(win ? 0 : 1),
    updatedAt:    Date.now(),
  });
}

// ─── Config (firebase.json style env check) ───────────────────────────────────

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}
