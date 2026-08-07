import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';

export async function uploadTestResult(file: File, metadata: Record<string, any>) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const userId = user.uid;
    const filePath = `test-results/${userId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);

    const docRef = await addDoc(collection(db, 'test_results'), {
      user_id: userId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: downloadUrl,
      file_path: filePath,
      test_date: metadata.testDate,
      test_types: metadata.testTypes || [],
      facility_name: metadata.facilityName || '',
      notes: metadata.notes || '',
      status: 'active',
      deleted_at: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const resultData = { id: docRef.id, file_url: downloadUrl, file_name: file.name };

    return { success: true, result: resultData };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getMyResults() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const q = query(
      collection(db, 'test_results'),
      where('user_id', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('test_date', 'desc')
    );
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return { success: true, results };
  } catch (error: any) {
    console.error('Get results error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteResult(resultId: string) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    await updateDoc(doc(db, 'test_results', resultId), {
      deleted_at: new Date().toISOString(),
      status: 'deleted',
      updated_at: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}
