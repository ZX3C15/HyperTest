import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  primaryCondition?: string;
  lastActive?: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      
      setUsers(fetchedUsers);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleUserStatus = async (userId: string, newStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        active: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };

  return { users, isLoading, toggleUserStatus };
}