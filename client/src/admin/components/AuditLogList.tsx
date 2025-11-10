import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Check, Filter, RefreshCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLogEntry, AuditCategory } from '../lib/auditLog';

export default function AuditLogList() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>([]);

  useEffect(() => {
    let q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc')
    );

    if (selectedCategories.length > 0) {
      q = query(q, where('category', 'in', selectedCategories));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          userId: data.userId,
          category: data.category,
          action: data.action,
          description: data.description,
          timestamp: data.timestamp?.toDate(),
          status: data.status,
          severity: data.severity,
          metadata: data.metadata
        } as AuditLogEntry;
      });
      setLogs(logs);
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedCategories]);

  const categories: AuditCategory[] = ['auth', 'profile', 'health', 'scan', 'system'];

  const getCategoryColor = (category: AuditCategory) => {
    const colors = {
      auth: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      profile: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      scan: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      system: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[category];
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const toggleCategory = (category: AuditCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <div className="text-center space-y-2">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <span className="text-sm text-muted-foreground">Loading audit logs...</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Activity Log</h3>
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCategories.length} filter{selectedCategories.length > 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter Categories
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              >
                <span className="capitalize">{category}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">User ID</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow 
                    key={log.userId + log.timestamp?.toString() + index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(log.category) + " capitalize"}>
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{log.description}</div>
                      {log.metadata?.details && (
                        <span className="block text-xs text-muted-foreground mt-1 truncate">
                          {JSON.stringify(log.metadata.details)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.userId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-center">
                      {log.status === 'success' ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity) + " capitalize"}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}