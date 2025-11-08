import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeFoodSchema, AnalyzeFoodRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Apple, Flame } from "lucide-react";
import { UserProfile } from "@shared/schema";

interface NutritionFormProps {
  initialData?: Partial<AnalyzeFoodRequest>;
  userCondition?: "diabetes" | "hypertension" | "both";
  onAnalyze: (data: AnalyzeFoodRequest) => void;
}

export default function NutritionForm({
  initialData,
  userCondition = "diabetes",
  onAnalyze,
}: NutritionFormProps) {
  const form = useForm<AnalyzeFoodRequest>({
    resolver: zodResolver(analyzeFoodSchema),
    defaultValues: {
      foodName: "",
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      saturatedFat: 0,
      transFat: 0,
      potassium: 0,
      cholesterol: 0,
      servingSize: "",
      servingsPerContainer: 0,
      condition: userCondition,
    },
  });

  useEffect(() => {
    if (initialData) {
      // Reset form with initial data
      const formData = {
        foodName: initialData.foodName || "",
        calories: Number(initialData.calories) || 0,
        carbohydrates: Number(initialData.carbohydrates) || 0,
        protein: Number(initialData.protein) || 0,
        fat: Number(initialData.fat) || 0,
        sodium: Number(initialData.sodium) || 0,
        fiber: Number(initialData.fiber) || 0,
        totalSugars: Number((initialData as any).totalSugars) || 0,
        addedSugars: Number((initialData as any).addedSugars) || 0,
        saturatedFat: Number((initialData as any).saturatedFat) || 0,
        transFat: Number((initialData as any).transFat) || 0,
        potassium: Number((initialData as any).potassium) || 0,
        cholesterol: Number((initialData as any).cholesterol) || 0,
        servingSize: (initialData as any).servingSize || "",
        servingsPerContainer: Number((initialData as any).servingsPerContainer) || 0,
        condition: userCondition,
      };
      form.reset(formData); // Use reset instead of setting values individually
    }
  }, [initialData, form, userCondition]);

  const onSubmit = async (data: AnalyzeFoodRequest) => {
    try {
      // Ensure all numeric fields are numbers and not strings
      const formattedData: AnalyzeFoodRequest = {
        ...data,
        calories: Number(data.calories),
        carbohydrates: Number(data.carbohydrates),
        protein: Number(data.protein),
        fat: Number(data.fat),
        sodium: Number(data.sodium),
        fiber: Number(data.fiber),
        totalSugars: Number((data as any).totalSugars),
        addedSugars: Number((data as any).addedSugars || 0),
        saturatedFat: Number((data as any).saturatedFat || 0),
        transFat: Number((data as any).transFat || 0),
        potassium: Number((data as any).potassium || 0),
        cholesterol: Number((data as any).cholesterol || 0),
        servingSize: (data as any).servingSize || "",
        servingsPerContainer: Number((data as any).servingsPerContainer || 0),
        condition: data.condition || userCondition,
      };

      console.log("Submitting nutrition data:", formattedData);

      if (!onAnalyze) throw new Error("onAnalyze function not provided!");
      await onAnalyze(formattedData);
    } catch (error) {
      console.error("Error analyzing food:", error);
      alert(
        `Failed to analyze food: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg text-foreground">
            Review & Edit Nutrition Facts
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* ✅ Use FormProvider so FormField has access to useFormContext */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name Field */}
            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Apple className="w-4 h-4 text-blue-500" />
                    Product Name
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Greek Yogurt" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            {/* Nutrition Fields */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-medium text-foreground">
                  Nutrition Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "calories", label: "Calories" },
                  { name: "carbohydrates", label: "Carbohydrates (g)" },
                    { name: "totalSugars", label: "Total Sugars (g)" },
                    { name: "addedSugars", label: "Added Sugars (g)" },
                  { name: "protein", label: "Protein (g)" },
                  { name: "fat", label: "Total Fat (g)" },
                    { name: "saturatedFat", label: "Saturated Fat (g)" },
                    { name: "transFat", label: "Trans Fat (g)" },
                  { name: "sodium", label: "Sodium (mg)" },
                    { name: "potassium", label: "Potassium (mg)" },
                    { name: "cholesterol", label: "Cholesterol (mg)" },
                  { name: "fiber", label: "Dietary Fiber (g)" },
                    { name: "servingSize", label: "Serving Size (text)" },
                    { name: "servingsPerContainer", label: "Servings / Container" },
                ].map((fieldData) => (
                  <FormField
                    key={fieldData.name}
                    control={form.control}
                    name={fieldData.name as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldData.label}</FormLabel>
                        <FormControl>
                            {/* Serving size is textual; other fields are numeric */}
                            {fieldData.name === 'servingSize' ? (
                              // cast to any to avoid overly-wide react-hook-form union types
                              <Input {...(field as any)} placeholder="e.g., 1 cup (240g)" />
                            ) : (
                              <Input
                                type="number"
                                step="any"
                                min="0"
                                {...(field as any)}
                                value={typeof field.value === 'number' ? (field.value === 0 ? "" : field.value) : ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numValue = value === "" ? 0 : parseFloat(value) || 0;
                                  field.onChange(Math.max(0, numValue));
                                }}
                              />
                            )}

                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Analyze Food Safety
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
