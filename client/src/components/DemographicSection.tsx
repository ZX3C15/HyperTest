import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { UserCircle, Ruler, Scale, Activity, Calendar } from "lucide-react"

function BMIDisplay({ height, weight }: { height: number; weight: number }) {
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

  const categoryColor =
    category === "Underweight"
      ? "text-blue-500"
      : category === "Normal weight"
      ? "text-green-500"
      : category === "Overweight"
      ? "text-orange-500"
      : "text-red-500";

  return (
    <div className="p-4 rounded-lg border border-border bg-card shadow-sm col-span-2">
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

export default function DemographicSection({ form, isEditing }: { form: any; isEditing: boolean }) {
  const height = Number(form.watch("demographics.heightCm"));
  const weight = Number(form.watch("demographics.weightKg"));

  return (
    <div className="p-4 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">

      {/* Biological Sex */}
      <FormField
        control={form.control}
        name="demographics.biologicalSex"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <UserCircle className="w-4 h-4 text-green-500" />
              Biological Sex
            </FormLabel>
            <Select defaultValue={field.value} onValueChange={field.onChange} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

        {/* Age */}
        <FormField
          control={form.control}
          name="demographics.age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-green-500" />
                Age
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={!isEditing}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      {/* Height */}
      <FormField
        control={form.control}
        name="demographics.heightCm"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Ruler className="w-4 h-4 text-green-500" />
              Height (cm)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                disabled={!isEditing}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weight */}
      <FormField
        control={form.control}
        name="demographics.weightKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Scale className="w-4 h-4 text-green-500" />
              Weight (kg)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                disabled={!isEditing}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Activity Level */}
      <FormField
        control={form.control}
        name="demographics.activityLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Activity className="w-4 h-4 text-green-500" />
              Activity Level
            </FormLabel>
            <Select defaultValue={field.value} onValueChange={field.onChange} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Sedentary">Sedentary</SelectItem>
                <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Very Active">Very Active</SelectItem>
              </SelectContent>
            </Select>
      <FormMessage />
      </FormItem>
    )}
  />

      {/* BMI Display */}
      <BMIDisplay height={height} weight={weight} />
    </div>
  )
}