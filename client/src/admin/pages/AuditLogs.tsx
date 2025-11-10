import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditLogList from '@/admin/components/AuditLogList';
import { Activity, FileText, Clock, Shield } from 'lucide-react';

export default function AuditLogs() {
  const [timeRange, setTimeRange] = useState('all');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Audit Logs
          </h2>
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-muted-foreground">Track and monitor all system activities and user actions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Logs
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              -
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All recorded activities</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Recent Activity
            </CardTitle>
            <Activity className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Live
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Real-time monitoring</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Time Range
            </CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {timeRange === 'all' ? 'All' : timeRange === 'today' ? 'Today' : timeRange === 'week' ? '7d' : '30d'}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Selected filter</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="all" onValueChange={(value) => setTimeRange(value)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                All Time
              </TabsTrigger>
              <TabsTrigger value="today" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Today
              </TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                This Month
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <AuditLogList />
            </TabsContent>
            <TabsContent value="today">
              <AuditLogList />
            </TabsContent>
            <TabsContent value="week">
              <AuditLogList />
            </TabsContent>
            <TabsContent value="month">
              <AuditLogList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}