import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditLogList from '@/admin/components/AuditLogList';

export default function AuditLogs() {
  const [timeRange, setTimeRange] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
      </div>

      <Card>
        <Tabs defaultValue="all" className="p-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setTimeRange('all')}>
              All Time
            </TabsTrigger>
            <TabsTrigger value="today" onClick={() => setTimeRange('today')}>
              Today
            </TabsTrigger>
            <TabsTrigger value="week" onClick={() => setTimeRange('week')}>
              This Week
            </TabsTrigger>
            <TabsTrigger value="month" onClick={() => setTimeRange('month')}>
              This Month
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <AuditLogList />
          </TabsContent>
          <TabsContent value="today" className="mt-4">
            <AuditLogList />
          </TabsContent>
          <TabsContent value="week" className="mt-4">
            <AuditLogList />
          </TabsContent>
          <TabsContent value="month" className="mt-4">
            <AuditLogList />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}