import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { userProfileSchema } from '@shared/schema';
import { useAdmin } from '@/admin/context/AdminContext';
import { useLocation } from 'wouter';

export default function Profile() {
  const { user, userProfile, updateProfile, signOut } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [, setLocation] = useLocation();

  

  
  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    const profileSection = document.getElementById('profile-form');
    if (profileSection) {
      profileSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveProfile = async (data: any) => {
    try {
      await updateProfile(data);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const profileUser = user ? {
    id: user.uid,
    name: user.displayName || userProfile?.name || 'User',
    email: user.email || '',
    photoURL: user.photoURL || undefined,
    profile: userProfile
  } : null;

  return (
    <div className="space-y-6">
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Welcome to HyperDiaScan! To provide you with personalized health insights, 
              we need some additional information. Please complete your profile to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll use this information to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Customize health recommendations</li>
                <li>Calculate accurate nutritional targets</li>
                <li>Provide relevant health insights</li>
              </ul>
            </p>
            <Button className="w-full" onClick={handleCompleteProfile}>
              Complete Profile Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-profile-title">
          User Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and health information
        </p>
        {/* Admin entry button (only visible to admins) */}
        {adminLoading ? null : isAdmin ? (
          <div className="mt-4">
            <Button variant="outline" onClick={() => setLocation('/admin')}>
              Open Admin Dashboard
            </Button>
          </div>
        ) : null}
      </div>

      <div id="profile-form" className="max-w-4xl mx-auto p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow">
        {user ? (
          <UserProfile 
            user={profileUser!}
            onSaveProfile={handleSaveProfile}
            onSignOut={signOut}
          />
        ) : (
          <div className="p-6 text-center text-muted-foreground">Please sign in to view and edit your profile.</div>
        )}
      </div>
    </div>
  );
}