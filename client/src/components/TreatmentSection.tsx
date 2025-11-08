import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pill, HeartPulse, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TreatmentSection({
  form,
  isEditing,
}: {
  form: any;
  isEditing: boolean;
}) {
  const condition = form.watch("primaryCondition");

  return (
    <div className="p-4 grid grid-cols-1 gap-4">
      {/* Diabetes Medications */}
      {(condition === "diabetes" || condition === "both") && (
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-semibold text-foreground">Diabetes Medications</h3>
          </div>

          <FormField
            control={form.control}
            name="treatmentManagement.diabetesMedication.medications"
            render={({ field }) => {
              const meds: string[] = Array.isArray(field.value) ? field.value : []
              const options = [
                "None",
                "Metformin",
                "Sulfonylureas",
                "DPP-4 inhibitors",
                "SGLT2 inhibitors",
                "GLP-1 receptor agonists",
                "Insulin - Short-acting",
                "Insulin - Long-acting",
                "Insulin - Both",
                "Other",
              ]

              return (
                <FormItem>
                  <FormLabel>Add Medications</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Select
                        value=""
                        onValueChange={(val: string) => {
                          if (!val) return
                          const next = meds.includes(val) ? meds : [...meds, val]
                          field.onChange(next)
                        }}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Add medication" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {meds.length === 0 && <div className="text-sm text-muted-foreground">No medications selected.</div>}
                    {meds.map((m) => (
                      <Badge key={m} className="flex items-center gap-2">
                        <span>{m}</span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => field.onChange(meds.filter((x) => x !== m))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>
      )}

      {/* Hypertension Medications */}
      {(condition === "hypertension" || condition === "both") && (
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">Hypertension Medications</h3>
          </div>

          <FormField
            control={form.control}
            name="treatmentManagement.hypertensionMedication.medications"
            render={({ field }) => {
              const meds: string[] = Array.isArray(field.value) ? field.value : []
              const options = [
                "None",
                "ACE inhibitors",
                "ARBs",
                "Beta blockers",
                "Calcium channel blockers",
                "Diuretics",
                "Alpha blockers",
                "Vasodilators",
                "Other",
              ]

              return (
                <FormItem>
                  <FormLabel>Add Medications</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Select
                        value=""
                        onValueChange={(val: string) => {
                          if (!val) return
                          const next = meds.includes(val) ? meds : [...meds, val]
                          field.onChange(next)
                        }}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Add medication" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {meds.length === 0 && <div className="text-sm text-muted-foreground">No medications selected.</div>}
                      {meds.map((m) => (
                        <Badge key={m} className="flex items-center gap-2">
                          <span>{m}</span>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => field.onChange(meds.filter((x) => x !== m))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </Badge>
                      ))}
                    </div>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>
      )}
    </div>
  );
}
