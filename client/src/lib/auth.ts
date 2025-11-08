import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, userProfileSchema } from '@shared/schema';

// ----------------------------
// Sign in / Sign up
// ----------------------------
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  profileData?: Partial<UserProfile>
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await updateProfile(user, { displayName: name });

    // ✅ Create only minimal profile
    await createUserProfile(user, profileData);

    await firebaseSignOut(auth);

    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// ----------------------------
// Create / Update / Fetch User Profile
// ----------------------------
export const createUserProfile = async (user: User, profileData?: Partial<UserProfile>) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create a full default profile matching the editable profile shape
    const defaultTips = [
      { content: 'Choose lower-sodium options when possible.' },
      { content: 'Prefer whole foods and add vegetables to meals.' },
      { content: 'Watch portion sizes and consider splitting large portions.' },
      { content: 'Limit added sugars and sugary drinks.' },
      { content: 'Balance carbs with protein and fiber to slow absorption.' },
    ];

    const fullProfile: UserProfile = {
      name: user.displayName || profileData?.name || '',
      email: user.email || '',
      primaryCondition: profileData?.primaryCondition || 'diabetes',
      otherConditions: {
        kidneyDisease: profileData?.otherConditions?.kidneyDisease || false,
        heartDisease: profileData?.otherConditions?.heartDisease || false,
      },
      diabetesStatus: profileData?.diabetesStatus || { bloodSugar: 0 },
      hypertensionStatus: profileData?.hypertensionStatus || { bloodPressure: { systolic: 120, diastolic: 80 } },
      treatmentManagement: {
        diabetesMedication: { medications: profileData?.treatmentManagement?.diabetesMedication?.medications || [] },
        hypertensionMedication: { medications: profileData?.treatmentManagement?.hypertensionMedication?.medications || [] }
      },
      demographics: {
        biologicalSex: profileData?.demographics?.biologicalSex || 'Male',
        age: profileData?.demographics?.age || 18,
        heightCm: profileData?.demographics?.heightCm || 170,
        weightKg: profileData?.demographics?.weightKg || 70,
        activityLevel: profileData?.demographics?.activityLevel || 'Sedentary'
      }
    };

    // Save the full profile and add default tips. Mark profile as incomplete so user can edit.
    await setDoc(userRef, {
      ...fullProfile,
      tips: defaultTips,
      uid: user.uid,
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

export const updateUserProfile = async (userId: string, profile: UserProfile) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  const defaultProfile: UserProfile = {
    name: '',
    email: '',
    primaryCondition: 'diabetes',
    otherConditions: { kidneyDisease: false, heartDisease: false },
    diabetesStatus: { bloodSugar: 0 },
    hypertensionStatus: { bloodPressure: { systolic: 120, diastolic: 80 } },
    treatmentManagement: {
      diabetesMedication: { medications: [] },
      hypertensionMedication: { medications: [] }
    },
    demographics: { biologicalSex: 'Male', age: 18, heightCm: 170, weightKg: 70, activityLevel: 'Sedentary' }
  };

  // Get existing data or use default profile
  const existingData = userSnap.exists() ? userSnap.data() as UserProfile : defaultProfile;
  
  // Merge the new profile data with existing data
  const updatedProfile = {
    ...existingData,
    ...profile,
    updatedAt: new Date().toISOString()
  };

  // Validate the profile against the schema
  try {
    const validatedProfile = userProfileSchema.parse(updatedProfile);
    
    // Save the validated profile
    await setDoc(userRef, validatedProfile, { merge: true });
    
    // Fetch and return the updated profile
    const updatedSnap = await getDoc(userRef);
    return updatedSnap.exists() ? updatedSnap.data() as UserProfile : null;
  } catch (error) {
    console.error('Profile validation failed:', error);
    throw error;
  }
};
 
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
