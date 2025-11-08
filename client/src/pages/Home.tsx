import React, { useState, useEffect } from 'react';
import {
  Camera,
  History,
  Shield,
  User,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory, subscribeToUserProfile } from '@/lib/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Home() {
  const { user, userProfile } = useAuth();
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState({
    scansToday: 0,
    safeScans: 0,
    riskyScans: 0,
    totalScans: 0,
  });
  const [dailyProgress, setDailyProgress] = useState(0);

  // Fetch + listen to Firestore user data
  useEffect(() => {
    if (!user) {
      setRecentScans([]);
      setDailyStats({ scansToday: 0, safeScans: 0, riskyScans: 0, totalScans: 0 });
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      if (!rawRecords || rawRecords.length === 0) {
        setRecentScans([]);
        setDailyStats({ scansToday: 0, safeScans: 0, riskyScans: 0, totalScans: 0 });
        return;
      }

      // Sort and slice for recent scans
      const sorted = rawRecords
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);

      const mapped = sorted.map((r) => ({
        name: r.foodName || 'Unknown Food',
        // Normalize stored prediction to a user-friendly display string
        // r.prediction may be a string like 'Safe'|'Risky' or an object { prediction: 'Safe', reasoning }
        result: (() => {
          const raw = typeof r.prediction === 'string' ? r.prediction : r.prediction?.prediction || 'unknown';
          if (!raw) return 'unknown';
          const low = String(raw).toLowerCase();
          if (low === 'safe') return 'Safe for Consumption';
          if (low === 'risky') return 'Not Recommended';
          // fallback: capitalize
          return String(raw);
        })(),
        time: new Date(r.timestamp).toLocaleString(),
      }));

      setRecentScans(mapped);

      // --- Daily Summary Calculations ---
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const scansToday = rawRecords.filter((r) => new Date(r.timestamp) >= startOfDay).length;
      const safeScans = rawRecords.filter((r) => {
        const val = String(r.prediction?.prediction || r.prediction || '').toLowerCase();
        return val === 'safe';
      }).length;
      const riskyScans = rawRecords.filter((r) => {
        const val = String(r.prediction?.prediction || r.prediction || '').toLowerCase();
        return val === 'risky';
      }).length;
      const totalScans = rawRecords.length;

      setDailyStats({ scansToday, safeScans, riskyScans, totalScans });

      // Progress: percentage of scans today vs total
      const progress = totalScans > 0 ? Math.min((scansToday / totalScans) * 100, 100) : 0;
      setDailyProgress(progress);
    });

    return unsubscribe;
  }, [user]);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Safe for Consumption':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Not Recommended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const quickActions = [
    { icon: Camera, title: 'Scan Food', href: '/scanner', color: 'from-blue-500 to-cyan-500' },
    { icon: History, title: 'View History', href: '/history', color: 'from-purple-500 to-pink-500' },
    { icon: User, title: 'Update Profile', href: '/profile', color: 'from-green-500 to-emerald-500' },
  ];

  // (Health tips moved to History page)

  // Prepare chart data
  const pieChartData = [
    { name: 'Safe Foods', value: dailyStats.safeScans, color: '#10b981' },
    { name: 'Risky Foods', value: dailyStats.riskyScans, color: '#ef4444' },
  ];

  const barChartData = [
    {
      name: 'Safe Foods',
      count: dailyStats.safeScans,
      fill: '#10b981',
    },
    {
      name: 'Risky Foods',
      count: dailyStats.riskyScans,
      fill: '#ef4444',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Hero Section with Analytics */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-profile-title">
            Welcome Back{userProfile?.name ? `, ${userProfile.name}` : ''}
          </h1>
          <p className="text-blue-100 text-lg">
            Track your health journey with smart food analysis
          </p>
        </div>

        {/* Analytics Cards */}
        {dailyStats.totalScans > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-300">{dailyStats.totalScans}</div>
                  <div className="text-sm text-blue-100">Total Scans</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-300">{dailyStats.safeScans}</div>
                  <div className="text-sm text-blue-100">Safe Foods</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-300">{dailyStats.riskyScans}</div>
                  <div className="text-sm text-blue-100">Risky Foods</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">
                    {dailyStats.totalScans > 0 
                      ? Math.round((dailyStats.safeScans / dailyStats.totalScans) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-blue-100">Safe Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <PieChartIcon className="w-5 h-5" />
                    Food Analysis Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (dailyStats.totalScans === 0) return '';
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Food Safety Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.7)"
                        tick={{ fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.7)"
                        tick={{ fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h3 className="text-2xl font-semibold mb-2">Start Your Health Journey</h3>
            <p className="text-blue-100 mb-6">Scan your first food to see analytics here</p>
            <Link href="/scanner">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Scan Your First Food
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Medical Disclaimer Section */}
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 rounded-xl shadow-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                <span>⚠️</span> Important Medical Disclaimer
              </h2>
              <div className="space-y-2 text-amber-800 dark:text-amber-200">
                <p className="leading-relaxed">
                  <strong>This application is a health assistance tool only and should not replace professional medical advice.</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Do not rely entirely on the analysis results provided by this system</li>
                  <li>Always consult with your doctor or healthcare provider before making dietary decisions</li>
                  <li>This tool is designed to support, not substitute, your healthcare professional's guidance</li>
                  <li>Individual health needs vary - seek personalized medical advice for your specific condition</li>
                </ul>
                <p className="text-sm font-semibold mt-3">
                  If you have any concerns about your health or diet, please contact your healthcare provider immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Daily Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dailyStats.scansToday}</div>
              <div className="text-sm text-muted-foreground">Scans Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dailyStats.safeScans}</div>
              <div className="text-sm text-muted-foreground">Safe Foods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{dailyStats.riskyScans}</div>
              <div className="text-sm text-muted-foreground">Risky Foods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dailyStats.totalScans}</div>
              <div className="text-sm text-muted-foreground">Total Scans</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{action.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Health Insights & Tips moved to History page */}

      {/* Recent Activity */}
      {recentScans.length > 0 && (
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentScans.map((scan, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{scan.name}</p>
                  <p className="text-xs text-muted-foreground">{scan.time}</p>
                  {/* Optional truncated reasoning */}
                  {scan.reasoning && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {scan.reasoning}
                    </p>
                  )}
                </div>

                <Badge
                  variant="secondary"
                  className={`${getResultColor(scan.result)} border-0 ml-4 flex-shrink-0`}
                >
                  {scan.result.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>

          <CardContent className="pt-0">
            <Link href="/history">
              <Button
                variant="outline"
                className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
              >
                See All Scans
                <History className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
