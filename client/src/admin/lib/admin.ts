import { collection, query, orderBy, getDocs, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserRole = 'user' | 'admin';

export interface AdminUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  lastLogin?: Date;
}

export async function updateUserRole(uid: string, role: UserRole) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }

    return userDoc.data()?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const snapshot = await getDocs(adminQuery);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    } as AdminUser));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    } as AdminUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserStats() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Get total users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    // Get active users (users who have scanned in the last 30 days)
    const scanQuery = query(
      collection(db, 'scanRecords'),
      where('timestamp', '>=', thirtyDaysAgo.toISOString())
    );
    const scanSnapshot = await getDocs(scanQuery);
    const activeUserIds = new Set(scanSnapshot.docs.map(doc => doc.data().userId));
    const activeUsers = activeUserIds.size;

    // Get total scans
    const totalScans = scanSnapshot.size;

    // Calculate scanning trend
    const previousThirtyDays = new Date(now.setDate(now.getDate() - 30));
    const previousScansQuery = query(
      collection(db, 'scanRecords'),
      where('timestamp', '>=', previousThirtyDays.toISOString()),
      where('timestamp', '<', thirtyDaysAgo.toISOString())
    );
    const previousScansSnapshot = await getDocs(previousScansQuery);
    const scanningTrend = scanSnapshot.size >= previousScansSnapshot.size ? 'increasing' : 'decreasing';

    return {
      totalUsers,
      activeUsers,
      totalScans,
      scanningTrend
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}