import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions, httpsCallable } from 'firebase/functions';
import {
  getMessaging,
  getToken as getFcmToken,
  onMessage as onFcmMessage,
  isSupported as isMessagingSupported,
  type Messaging,
} from 'firebase/messaging';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase environment variables are missing');
}

// Initialize Firebase
const app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Analytics (lazy — safe if blocked by ad-blockers)
let analytics: Analytics | null = null;
isAnalyticsSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch(() => {});

// Initialize the services the app actually uses
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const functions: Functions = getFunctions(app);

export { app, analytics, auth, db, storage, functions };
export default app;

// ─── Cloud Functions wrapper ────────────────────────────────────────

/**
 * Calls the validateShareAccess Cloud Function to verify a share token
 * server-side. The function checks token validity, expiration, access_code,
 * logs the attempt to access_logs (server-side only), and returns sanitized
 * share + test_results data.
 */
export async function validateShareAccess(params: {
  share_token: string;
  access_code?: string;
}): Promise<{
  valid: boolean;
  share?: any;
  test_results?: any[];
  member?: { member_id: string | null };
  error?: string;
  requires_access_code?: boolean;
}> {
  const callable = httpsCallable(functions, 'validateShareAccess');
  const result = await callable(params);
  return result.data as any;
}

// ─── FCM Push Notifications ────────────────────────────────────────

let messaging: Messaging | null = null;
let messagingInitPromise: Promise<Messaging | null> | null = null;

async function ensureMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging;
  if (messagingInitPromise) return messagingInitPromise;

  messagingInitPromise = (async () => {
    try {
      const supported = await isMessagingSupported();
      if (!supported) return null;
      messaging = getMessaging(app);
      return messaging;
    } catch {
      return null;
    }
  })();

  return messagingInitPromise;
}

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  const m = await ensureMessaging();
  if (!m) return null;

  if (Notification.permission === 'denied') return null;

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
  }

  try {
    const token = await getFcmToken(m, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) return null;

    await setDoc(doc(db, 'fcm_tokens', userId), {
      token,
      user_id: userId,
      updated_at: serverTimestamp(),
    });

    return token;
  } catch (error) {
    console.error('FCM token registration failed:', error);
    return null;
  }
}

export async function unregisterForPushNotifications(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'fcm_tokens', userId));
  } catch {
    // best-effort
  }
}

export async function onPushNotification(callback: (payload: any) => void): Promise<() => void> {
  const m = await ensureMessaging();
  if (!m) return () => {};

  return onFcmMessage(m, callback);
}

export async function saveNotificationPreferences(
  userId: string,
  prefs: {
    push_new_results: boolean;
    push_share_created: boolean;
    push_share_expiring: boolean;
    push_share_revoked: boolean;
  },
): Promise<void> {
  await setDoc(
    doc(db, 'notification_preferences', userId),
    {
      ...prefs,
      user_id: userId,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadNotificationPreferences(userId: string): Promise<{
  push_new_results: boolean;
  push_share_created: boolean;
  push_share_expiring: boolean;
  push_share_revoked: boolean;
} | null> {
  const snap = await getDoc(doc(db, 'notification_preferences', userId));
  if (!snap.exists()) return null;
  return snap.data() as any;
}

// ─── Utilities ─────────────────────────────────────────────────────

export function generateMemberId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MH-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateVerificationCode(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  console.log(`Verification code for ${email}: ${code}`);
}
