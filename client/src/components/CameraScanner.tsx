import { PenLine } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NutritionData } from '@shared/schema';

interface CameraScannerProps {
  onScanComplete: (data: NutritionData) => void;
}

export default function CameraScanner({ onScanComplete }: CameraScannerProps) {
  const handleStartEmpty = () => {
    onScanComplete({
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      totalSugars: 0,
      servingSize: "",
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <PenLine className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Manual Nutrition Input</h3>
      </div>
      <p className="text-muted-foreground text-sm">
        Enter nutritional values manually to analyze your food item.
      </p>
      <Button 
        onClick={handleStartEmpty}
        className="w-full"
      >
        Start Manual Entry
      </Button>
    </Card>
  );
}
