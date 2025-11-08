import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HealthAssessmentProps {
  prediction: 'safe' | 'risky';
  condition: 'diabetes' | 'hypertension';
  reasoning: string;
  nutritionData: {
    calories: number;
    carbohydrates: number;
    protein: number;
    fat: number;
    sodium: number;
    fiber: number;
    // support both legacy `sugar` and new `totalSugars`
    sugar?: number;
    totalSugars?: number;
  };
}

export default function HealthAssessment({ 
  prediction, 
  condition,
  reasoning,
  nutritionData 
}: HealthAssessmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    switch (prediction) {
      case 'safe': return 'text-green-600 border-green-200 bg-green-50';
      case 'risky': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (prediction) {
      case 'safe': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'risky': return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (prediction) {
      case 'safe': return 'Safe for Consumption';
      case 'risky': return 'Not Recommended';
      default: return 'Analysis Complete';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg" data-testid="text-assessment-result">
                {getStatusText()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                For {condition === 'diabetes' ? 'Diabetes' : 'Hypertension'} Management
              </p>
            </div>
          </div>
          <Badge 
            variant={prediction === 'safe' ? 'default' : 'destructive'}
            data-testid="badge-prediction"
          >
            {prediction.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Confidence Score</span>
          </div>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              data-testid="button-toggle-reasoning"
            >
              View Medical Reasoning
              <Info className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Details:</h4>
              {/* Medical reasoning from the model (preserve newlines) */}
              <div className="mb-4 text-sm whitespace-pre-wrap" data-testid="text-medical-reasoning">
                <span className="font-medium">Medical Reasoning:</span>
                <div className="mt-2">{reasoning || 'No detailed reasoning available.'}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Calories:</span> {nutritionData.calories}
                </div>
                <div>
                  <span className="font-medium">Carbs:</span> {nutritionData.carbohydrates}g
                </div>
                <div>
                  <span className="font-medium">Protein:</span> {nutritionData.protein}g
                </div>
                <div>
                  <span className="font-medium">Fat:</span> {nutritionData.fat}g
                </div>
                <div>
                  <span className="font-medium">Sodium:</span> {nutritionData.sodium}mg
                </div>
                <div>
                  <span className="font-medium">Fiber:</span> {nutritionData.fiber}g
                </div>
                <div>
                  <span className="font-medium">Sugar:</span> {(nutritionData.totalSugars ?? nutritionData.sugar ?? 0)}g
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}