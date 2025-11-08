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
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading audit logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Audit Logs</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.userId + log.timestamp?.toString()}>
                <TableCell className="whitespace-nowrap">
                  {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(log.category)}>
                    {log.category}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{log.action}</TableCell>
                <TableCell className="max-w-md truncate">
                  {log.description}
                  {log.metadata?.details && (
                    <span className="block text-xs text-muted-foreground mt-1">
                      {JSON.stringify(log.metadata.details)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.userId.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {log.status === 'success' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getSeverityColor(log.severity)}>
                    {log.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}