import React, { useState, useEffect } from 'react';
import ScanHistory from '@/components/ScanHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory, deleteScanRecord } from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Target, Shield, Star, Activity, PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { subscribeToUserProfile } from '@/lib/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Updated ScanRecord type
interface ScanRecord {
  id: string;
  date: string; // human-readable (Asia/Manila)
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'risky';
  reasoning?: string;
  foodName?: string;
  nutritionData: Record<string, number>; // dynamic nutrients
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Analytics state (moved from Home)
  const [dailyStats, setDailyStats] = useState({
    scansToday: 0,
    safeScans: 0,
    riskyScans: 0,
    totalScans: 0,
  });

  // Health tips state (moved from Home)
  const [currentTip, setCurrentTip] = useState(0);
  const [healthTips, setHealthTips] = useState<Array<{ icon: any; color: string; title: string; content: string }>>(
    []
  );

  // Icons and colors for tips
  const tipStyles = [
    { icon: Heart, color: 'from-red-500 to-pink-500', title: '' },
    { icon: Target, color: 'from-blue-500 to-indigo-500', title: '' },
    { icon: Shield, color: 'from-green-500 to-teal-500', title: '' },
    { icon: Star, color: 'from-yellow-500 to-orange-500', title: '' },
    { icon: Activity, color: 'from-purple-500 to-indigo-500', title: '' },
  ];

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Unknown date';
    let dateObj: Date | null = null;

    if (ts?.toDate && typeof ts.toDate === 'function') dateObj = ts.toDate();
    else if (typeof ts === 'object' && typeof ts.seconds === 'number')
      dateObj = new Date(ts.seconds * 1000);
    else if (typeof ts === 'string') {
      const parsed = new Date(ts);
      dateObj = isNaN(parsed.getTime()) ? null : parsed;
    } else if (ts instanceof Date) dateObj = ts;
    else if (typeof ts === 'number') dateObj = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);

    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid date';

    return dateObj.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toNumber = (v: any) => {
    if (v === undefined || v === null) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      try {
        if (!rawRecords || rawRecords.length === 0) {
          setRecords([]);
          setLoading(false);
          return;
        }

        const mapped: ScanRecord[] = rawRecords.map((r: any) => {
          const id = r.id ?? r.docId ?? r._id ?? '';
          const rawTimestamp = r.timestamp ?? r.createdAt ?? r.date ?? r.time ?? null;

          const nutritionRaw = r.nutritionData ?? r.nutrition ?? r.nutrition_info ?? {};
          const nutritionData: Record<string, number> = {};
          for (const [key, value] of Object.entries(nutritionRaw)) {
            const n = toNumber(value);
            if (n !== 0) nutritionData[key] = n;
          }

          const condition = (r.condition ?? r.disease ?? 'diabetes') as 'diabetes' | 'hypertension';

          const rawPrediction =
            typeof r.prediction === 'object' && r.prediction !== null
              ? r.prediction
              : { prediction: r.prediction ?? 'safe' };

          let prediction: ScanRecord['prediction'] = 'safe';
          const predStr = String(rawPrediction.prediction ?? 'safe').toLowerCase();
          if (predStr === 'risky') prediction = 'risky';

          const reasoning = String(rawPrediction.reasoning ?? r.reasoning ?? '').trim();
          const foodName = r.foodName ?? r.name ?? r.label ?? undefined;
          const date = formatTimestamp(rawTimestamp ?? r.createdAt ?? r.timestamp ?? new Date());

          return {
            id,
            date,
            condition,
            prediction,
            foodName,
            reasoning,
            nutritionData,
          };
        });

        setRecords(mapped);

        // Calculate daily stats
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const scansToday = rawRecords.filter((r) => {
          const timestamp = r.timestamp ?? r.createdAt ?? r.date ?? r.time ?? null;
          return timestamp && new Date(timestamp) >= startOfDay;
        }).length;

        const safeScans = mapped.filter((r) => r.prediction === 'safe').length;
        const riskyScans = mapped.filter((r) => r.prediction === 'risky').length;
        const totalScans = mapped.length;

        setDailyStats({ scansToday, safeScans, riskyScans, totalScans });
      } catch (err) {
        console.error('Error mapping scan history records:', err);
        setRecords([]);
        setDailyStats({ scansToday: 0, safeScans: 0, riskyScans: 0, totalScans: 0 });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to user profile for tips
  useEffect(() => {
    if (!user) {
      setHealthTips([]);
      return;
    }

    const unsubscribe = subscribeToUserProfile(user.uid, (profile: { tips?: Array<{ content: string }> } | undefined) => {
      if (profile?.tips) {
        const formattedTips = profile.tips.map((tip: { content: string }, index: number) => ({
          ...tipStyles[index % tipStyles.length],
          content: tip.content,
        }));
        setHealthTips(formattedTips);
        if (currentTip >= formattedTips.length) setCurrentTip(0);
      } else {
        setHealthTips([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (healthTips.length > 0 ? (prev + 1) % healthTips.length : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, [healthTips.length]);

  const handleViewDetails = (record: ScanRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteScanRecord(id);
      console.log('Record deleted:', id);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <>
      {/* Dialog for details */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedRecord(null);
        }}
      >
        <DialogContent className="max-w-xl rounded-3xl shadow-2xl p-6 bg-white dark:bg-gray-900">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {selectedRecord?.foodName ?? 'Scan Details'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Detailed information about this scan result.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord ? (
            <div className="mt-4 space-y-6">
              {/* Top info: Condition & Prediction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Date:</span> {selectedRecord.date}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Condition:</span> <span className="capitalize">{selectedRecord.condition}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Prediction:</span>{' '}
                    <span
                      className={`font-semibold px-2 py-1 rounded-lg text-sm ${
                        selectedRecord.prediction === 'risky'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {selectedRecord.prediction === 'risky' ? 'Not Recommended' : 'Safe for Consumption'}
                    </span>
                  </p>
                </div>

                {/* Nutrition Summary */}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-xl space-y-2">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 text-center text-sm uppercase tracking-wide">
                    Nutrition Facts
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(selectedRecord.nutritionData).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm text-center"
                      >
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">{key}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="border-t pt-3">
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm">Reasoning</p>
                {selectedRecord.reasoning ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-auto p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {selectedRecord.reasoning}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No reasoning available.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">No record selected.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Page content */}
      <div className="space-y-6">
        <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Scan History & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review your past food scans, health assessments, and nutrition analytics
          </p>
        </div>

        {/* Analytics Section (moved from Home) */}
        {dailyStats.totalScans > 0 && (
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Food Analysis Summary</h2>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart - Food Safety Distribution */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <PieChartIcon className="w-5 h-5" />
                    Safety Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Safe Foods', value: dailyStats.safeScans, color: '#10b981' },
                          { name: 'Risky Foods', value: dailyStats.riskyScans, color: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (dailyStats.totalScans === 0) return '';
                          return `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
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

              {/* Bar Chart - Food Safety Breakdown */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Safety Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: 'Safe Foods', count: dailyStats.safeScans, fill: '#10b981' },
                      { name: 'Risky Foods', count: dailyStats.riskyScans, fill: '#ef4444' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.7)"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
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
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* New: Per-Nutrient Analytics */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Avg. Nutrients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={(() => {
                      // Aggregate nutrients from all records
                      const nutrientTotals: Record<string, number> = {};
                      const nutrientCounts: Record<string, number> = {};
                      
                      records.forEach(record => {
                        Object.entries(record.nutritionData).forEach(([key, value]) => {
                          if (!nutrientTotals[key]) {
                            nutrientTotals[key] = 0;
                            nutrientCounts[key] = 0;
                          }
                          nutrientTotals[key] += value;
                          nutrientCounts[key] += 1;
                        });
                      });

                      // Calculate averages and format for chart
                      return Object.entries(nutrientTotals)
                        .map(([key, total]) => ({
                          name: key.length > 8 ? key.substring(0, 8) + '...' : key,
                          value: Math.round(total / nutrientCounts[key]),
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 6); // Show top 6 nutrients
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.7)"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
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
                      <Bar dataKey="value" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Health Insights & Tips (moved from Home) */}
        {healthTips.length > 0 && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${healthTips[currentTip].color} shadow-lg flex-shrink-0`}
                >
                  {React.createElement(healthTips[currentTip].icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{healthTips[currentTip].title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {healthTips[currentTip].content}
                  </p>
                </div>
              </div>
              {healthTips.length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {healthTips.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTip ? 'bg-blue-500 w-6' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentTip(index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading your scan history...
          </div>
        ) : (
          <ScanHistory
            records={records}
            onViewDetails={handleViewDetails}
            onDeleteRecord={handleDeleteRecord}
          />
        )}
      </div>
    </>
  );
}
