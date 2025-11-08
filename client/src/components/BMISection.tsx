import { Activity } from "lucide-react";

export default function BMISection({ form }: { form: any }) {
  const { getValues } = form;

  const h = getValues("demographics.heightCm");
  const w = getValues("demographics.weightKg");

  const height = Number(h);
  const weight = Number(w);

  const bmi = height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : "0.0";
  const bmiNum = parseFloat(bmi);

  const category =
    bmiNum < 18.5
      ? "Underweight"
      : bmiNum < 25
      ? "Normal weight"
      : bmiNum < 30
      ? "Overweight"
      : "Obese";

  // Color mapping for BMI categories
  const categoryColor =
    category === "Underweight"
      ? "text-blue-500"
      : category === "Normal weight"
      ? "text-green-500"
      : category === "Overweight"
      ? "text-orange-500"
      : "text-red-500";

  return (
    <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-foreground">
          Body Mass Index (BMI)
        </h3>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <strong className="text-foreground">BMI:</strong>{" "}
          <span className="font-medium text-purple-600">{bmi}</span>
        </p>
        <p>
          <strong className="text-foreground">Category:</strong>{" "}
          <span className={`font-semibold ${categoryColor}`}>{category}</span>
        </p>
      </div>
    </div>
  );
}
