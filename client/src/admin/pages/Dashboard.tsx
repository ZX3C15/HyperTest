import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, PieChart, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { getUserStats } from '@/admin/lib/admin';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalScans: 0,
    scanningTrend: 'increasing',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getUserStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };
    loadStats();
  }, []);

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Total registered users',
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      trend: null,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      description: 'Users active in last 30 days',
      icon: Activity,
      gradient: 'from-green-500 via-green-600 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      trend: '+12%',
    },
    {
      title: 'Total Scans',
      value: stats.totalScans.toLocaleString(),
      description: 'Total food items analyzed',
      icon: PieChart,
      gradient: 'from-purple-500 via-purple-600 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      trend: '+8%',
    },
    {
      title: 'Scanning Trend',
      value: stats.scanningTrend === 'increasing' ? 'Growing' : 'Declining',
      description: 'Compared to last month',
      icon: stats.scanningTrend === 'increasing' ? TrendingUp : TrendingDown,
      gradient: stats.scanningTrend === 'increasing' ? 'from-orange-500 via-orange-600 to-amber-500' : 'from-red-500 via-red-600 to-rose-500',
      bgGradient: stats.scanningTrend === 'increasing' ? 'from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50' : 'from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50',
      iconBg: stats.scanningTrend === 'increasing' ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-gradient-to-br from-red-500 to-rose-500',
      trend: stats.scanningTrend === 'increasing' ? '+15%' : '-3%',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your app.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card 
            key={i} 
            className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {card.title}
              </CardTitle>
              <div className={`p-3 rounded-xl ${card.iconBg} shadow-lg shadow-gray-900/20`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </div>
                {card.trend && (
                  <span className={`text-sm font-semibold ${card.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {card.description}
              </p>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Activity feed coming soon...</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Analytics coming soon...</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Performance metrics coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}