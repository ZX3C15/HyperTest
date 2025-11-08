import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, PieChart, TrendingUp } from 'lucide-react';
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
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      description: 'Users active in last 30 days',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Scans',
      value: stats.totalScans,
      description: 'Total food items analyzed',
      icon: PieChart,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Scanning Trend',
      value: stats.scanningTrend === 'increasing' ? '↑' : '↓',
      description: 'Compared to last month',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}