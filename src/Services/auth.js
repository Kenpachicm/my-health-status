import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, generateMemberId } from '../lib/firebase';

export async function signUp(email: string, password: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const memberId = generateMemberId();

    await setDoc(doc(db, 'users', cred.user.uid), {
      email: email,
      member_id: memberId,
      email_verified: false,
      role: 'patient',
      hospital_id: null,
      full_name: '',
      phone: '',
      dob: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    await updateProfile(cred.user, { displayName: email });

    return {
      success: true,
      user: cred.user,
      memberId,
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: cred.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error };
  }
}

export async function getCurrentUser(): Promise<Record<string, any> | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  return { id: user.uid, ...snap.data() };
}

export { onAuthStateChanged };
export type { FirebaseUser };
