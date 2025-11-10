import React, { useState, useEffect } from 'react';
import {
  Camera,
  History,
  Shield,
  User,
  Activity,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory } from '@/lib/firestore';

export default function Home() {
  const { user, userProfile } = useAuth();
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Fetch + listen to Firestore user data
  useEffect(() => {
    if (!user) {
      setRecentScans([]);
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      if (!rawRecords || rawRecords.length === 0) {
        setRecentScans([]);
        return;
      }

      // Sort and slice for recent scans
      const sorted = rawRecords
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);

      const mapped = sorted.map((r) => ({
        name: r.foodName || 'Unknown Food',
        result: (() => {
          const raw = typeof r.prediction === 'string' ? r.prediction : r.prediction?.prediction || 'unknown';
          if (!raw) return 'unknown';
          const low = String(raw).toLowerCase();
          if (low === 'safe') return 'Safe for Consumption';
          if (low === 'risky') return 'Not Recommended';
          return String(raw);
        })(),
        time: new Date(r.timestamp).toLocaleString(),
      }));

      setRecentScans(mapped);
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
    { icon: History, title: 'View History & Analytics', href: '/history', color: 'from-purple-500 to-pink-500' },
    { icon: User, title: 'Update Profile', href: '/profile', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="space-y-6">

      {/* Hero Section - System Showcase */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative text-center space-y-6">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
              <Activity className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold" data-testid="text-profile-title">
              HyperDiaScense
            </h1>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">
                🤖 AI-Powered
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">
                📊 Nutritional Analysis
              </Badge>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-50 font-medium max-w-3xl mx-auto leading-relaxed">
            AI-Driven Nutritional Label Analysis System for People with Hypertension and Diabetes
          </p>

          {/* Welcome Message */}
          {userProfile?.name && (
            <p className="text-blue-100 text-lg">
              Welcome back, <span className="font-semibold">{userProfile.name}</span>! Track your health journey with smart food analysis.
            </p>
          )}

          {/* CTA Button */}
          <div className="pt-4">
            <Link href="/scanner">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <Camera className="w-5 h-5 mr-2" />
                Analyze Food Now
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 max-w-3xl mx-auto">
            {[
              { icon: '💡', title: 'AI Insights', desc: 'Personalized recommendations' },
              { icon: '📈', title: 'Track Progress', desc: 'Monitor your health journey' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-blue-100 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
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
