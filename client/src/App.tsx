import React, { useState, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminProvider } from "@/admin/context/AdminContext";
import AppHeader from "@/components/AppHeader";
import Navigation from "@/components/Navigation";
import AuthForm from "@/components/AuthForm";
import LandingPage from "@/components/LandingPage";
import Home from "@/pages/Home";
import Scanner from "@/pages/Scanner";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Lazy load admin components
const AdminLayout = React.lazy(() => import('@/admin/components/AdminLayout'));
const Dashboard = React.lazy(() => import('@/admin/pages/Dashboard'));
const Users = React.lazy(() => import('@/admin/pages/Users'));
const AuditLogs = React.lazy(() => import('@/admin/pages/AuditLogs'));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin Routes (explicit top-level routes so subpaths match) */}
      <Route path="/admin">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </Suspense>
        )}
      </Route>

      <Route path="/admin/users">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </Suspense>
        )}
      </Route>

      <Route path="/admin/audit-logs">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>
              <AuditLogs />
            </AdminLayout>
          </Suspense>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, userProfile, loading, signOut } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading HyperDiaScense...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleProfileClick = () => {
    // Navigate to profile using wouter
    window.history.pushState({}, '', '/profile');
  };

  // If the current path is an admin route, render only the admin Router
  if (location.startsWith('/admin')) {
    return <Router />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        user={{
          name: user?.displayName || userProfile?.name || 'User',
          email: user?.email || '',
          photoURL: user?.photoURL || undefined
        }}
        onProfileClick={handleProfileClick}
        onSignOut={signOut}
      />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <Router />
      </main>
      
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <AuthenticatedApp />
          </AdminProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;