import { PenLine, History, User, Home, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/scanner', icon: PenLine, label: 'Analyze ' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-border/40 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-around gap-2 py-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'flex flex-col gap-1 h-auto py-2 px-4 rounded-2xl transition-all duration-300',
                    'hover:bg-primary/10 hover:text-primary hover:scale-105',
                    isActive && 'bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg hover:bg-gradient-to-br hover:from-blue-600 hover:to-green-600 hover:text-white'
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive && "drop-shadow-sm"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-all duration-300",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}