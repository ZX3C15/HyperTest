import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { onAuthChange, signInWithEmail, signUpWithEmail, signOut, getUserProfile, updateUserProfile, resetPassword as resetPasswordEmail } from '@/lib/auth';
import { UserProfile } from '@shared/schema';
import { createAuthAuditLog, createProfileAuditLog } from '@/admin/lib/auditLog';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, profile?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('AuthContext:onAuthChange fired. isSigningUp=', isSigningUp, 'firebaseUser=', firebaseUser?.uid || null)
      // If we're in the middle of signing up, ignore auth state changes
      if (isSigningUp) {
        return;
      }
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isSigningUp]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      if (user) {
        await createAuthAuditLog(
          user.uid,
          'user.login',
          'User successfully signed in',
          'success',
          {
            method: 'email',
            emailProvider: email.split('@')[1]
          }
        );
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      await createAuthAuditLog(
        'anonymous',
        'user.login',
        'Sign in attempt failed',
        'error',
        {
          method: 'email',
          emailProvider: email.split('@')[1],
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      throw error;
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    profile?: Partial<UserProfile>
  ) => {
    setIsSigningUp(true);
    setLoading(true);
    
    try {
      const result = await signUpWithEmail(email, password, name, profile);
      await createAuthAuditLog(
        result.uid,
        'user.register',
        'New user registration successful',
        'success',
        {
          email,
          name,
          hasProfile: !!profile,
          profileType: profile?.primaryCondition || 'none'
        }
      );
      // After sign up completes, user should be signed out
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign up failed:', error);
      await createAuthAuditLog(
        'anonymous',
        'user.register',
        'User registration failed',
        'error',
        {
          email,
          name,
          hasProfile: !!profile,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      throw error;
    } finally {
      setIsSigningUp(false);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (user) {
        const userId = user.uid;
        await createAuthAuditLog(
          userId,
          'user.logout',
          'User signed out successfully',
          'success',
          { email: user.email || 'unknown' }
        );
      }
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {   
      console.error('Sign out failed:', error);
      if (user) {
        await createAuthAuditLog(
          user.uid,
          'user.logout',
          'Sign out attempt failed',
          'error',
          { 
            email: user.email || 'unknown',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
      throw error;
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    if (!user) throw new Error('No authenticated user');
    try {
      console.log('AuthContext: updateProfile called for user', user.uid)
      const updated = await updateUserProfile(user.uid, profile);
      console.log('AuthContext: updateUserProfile result:', updated)
      if (updated) {
        setUserProfile(updated);
        // Create audit log entry for profile update
        await createProfileAuditLog(
          user.uid,
          'profile.update',
          'User profile updated successfully',
          'success',
          {
            updatedFields: Object.keys(profile),
            profileType: profile.primaryCondition
          }
        );
      }
    } catch (error) {
      console.error('Failed to update profile in AuthContext:', error);
      // Log failed profile update attempt
      await createProfileAuditLog(
        user.uid,
        'profile.update',
        'Failed to update user profile',
        'error',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPasswordEmail(email);
      await createAuthAuditLog(
        'anonymous',
        'user.password_reset',
        'Password reset email sent successfully',
        'success',
        { email }
      );
    } catch (error) {
      console.error('Password reset failed:', error);
      await createAuthAuditLog(
        'anonymous',
        'user.password_reset',
        'Password reset request failed',
        'error',
        {
          email,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile,
    resetPassword: handleResetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};