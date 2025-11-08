import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  onSnapshot,
  Unsubscribe,
  updateDoc,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { ScanRecord, InsertScanRecord } from '@shared/schema';

export const saveScanRecord = async (userId: string, scanData: InsertScanRecord): Promise<string> => {
  try {
    const scansCollection = collection(db, 'scanRecords');
    const docRef = await addDoc(scansCollection, {
      ...scanData,
      userId,
      timestamp: new Date().toISOString(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan record:', error);
    throw error;
  }
};

export const getUserScanHistory = async (userId: string): Promise<ScanRecord[]> => {
  try {
    const scansCollection = collection(db, 'scanRecords');
    const q = query(
      scansCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const scanRecords: ScanRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      scanRecords.push({
        id: doc.id,
        ...doc.data(),
      } as ScanRecord);
    });
    
    return scanRecords;
  } catch (error) {
    console.error('Error fetching scan history:', error);
    throw error;
  }
};

export const deleteScanRecord = async (recordId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'scanRecords', recordId));
  } catch (error) {
    console.error('Error deleting scan record:', error);
    throw error;
  }
};

export const getScanRecordsByCondition = async (
  userId: string, 
  condition: 'diabetes' | 'hypertension'
): Promise<ScanRecord[]> => {
  try {
    const scansCollection = collection(db, 'scanRecords');
    const q = query(
      scansCollection,
      where('userId', '==', userId),
      where('condition', '==', condition),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const scanRecords: ScanRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      scanRecords.push({
        id: doc.id,
        ...doc.data(),
      } as ScanRecord);
    });
    
    return scanRecords;
  } catch (error) {
    console.error('Error fetching scan records by condition:', error);
    throw error;
  }
};

export const subscribeToUserScanHistory = (
  userId: string,
  onUpdate: (records: ScanRecord[]) => void
): Unsubscribe => {
  const scansCollection = collection(db, 'scanRecords');
  const q = query(
    scansCollection,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const scanRecords: ScanRecord[] = [];
    querySnapshot.forEach((doc) => {
      scanRecords.push({
        id: doc.id,
        ...doc.data(),
      } as ScanRecord);
    });
    onUpdate(scanRecords);
  });
};

export const updateUserHealthTips = async (userId: string, healthTips: { content: string }[]): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      tips: healthTips,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user health tips:', error);
    throw error;
  }
};

export const subscribeToUserProfile = (
  userId: string,
  onUpdate: (profile: DocumentData | undefined) => void
): Unsubscribe => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data());
    } else {
      onUpdate(undefined);
    }
  }, (error) => {
    console.error('Error subscribing to user profile:', error);
    onUpdate(undefined);
  });
};