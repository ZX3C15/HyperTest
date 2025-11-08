import { ReactNode } from 'react';
import { Link, Redirect } from 'wouter';
import { Users, ActivitySquare, LayoutDashboard, LogOut, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '../context/AdminContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const { isAdmin, isLoading } = useAdmin();

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/audit-logs', icon: ActivitySquare, label: 'Audit Logs' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r fixed h-full">
        <div className="p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">HyperDiaScense</p>
              </div>
            </div>
        </div>
        <nav className="space-y-2 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => signOut()}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to App
            </Button>
        </nav>
      </aside>

      {/* Main Content */}
        <main className="flex-1 p-8 ml-64">
        {children}
      </main>
    </div>
  );
}