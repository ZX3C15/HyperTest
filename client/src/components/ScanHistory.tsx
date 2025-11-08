import { useState } from 'react';
import { Calendar, Eye, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ScanRecord {
  id: string;
  date: string;
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'risky';
  reasoning?: string;
  foodName?: string;
  nutritionData: Record<string, number>; 
  };


interface ScanHistoryProps {
  records: ScanRecord[];
  onViewDetails: (record: ScanRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function ScanHistory({ records, onViewDetails, onDeleteRecord }: ScanHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterPrediction, setFilterPrediction] = useState<string>('all');

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchTerm ||
      record.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.date.includes(searchTerm);

    const matchesCondition = filterCondition === 'all' || record.condition === filterCondition;
    const matchesPrediction = filterPrediction === 'all' || record.prediction === filterPrediction;

    return matchesSearch && matchesCondition && matchesPrediction;
  });

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'safe':
        return 'bg-blue-100 text-blue-800';
      case 'risky':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Scan History
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search scans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="diabetes">Diabetes</SelectItem>
              <SelectItem value="hypertension">Hypertension</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPrediction} onValueChange={setFilterPrediction}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="risky">Not Recommended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* History List */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scan records found. Start by scanning your first nutrition label!
            </div>
          ) : (
            filteredRecords.map((record) => (
              <Card
                key={record.id}
                className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow rounded-xl border"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{record.foodName || 'Unknown Food'}</p>
                    <p className="text-sm text-muted-foreground truncate">{record.date}</p>
                    <Badge className={`${getPredictionColor(record.prediction)} mt-1`}>
                      {record.prediction === 'risky' ? 'Not Recommended' : 'Safe for Consumption'}
                    </Badge>
                    {/* <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{record.nutritionData.calories} cal</span>
                      <span>{record.nutritionData.carbs} g carbs</span>
                      <span>{record.nutritionData.sodium} mg sodium</span>
                    </div> */}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(record)}
                    className="text-blue-500 hover:bg-blue-50"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteRecord(record.id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
