import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Droplet, HeartPulse, Activity, Pill, Heart, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function MedicalSection({ form, isEditing }: { form: any; isEditing: boolean }) {
  // Primary condition select moved here so medical UI can react to it immediately
  const condition = form.watch("primaryCondition")

  // Primary Condition selector (moved from BasicInfo)
  const PrimaryConditionField = (
    <FormField
      control={form.control}
      name="primaryCondition"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="w-4 h-4 text-blue-500" />
            Primary Condition
          </FormLabel>
          <Select defaultValue={field.value} onValueChange={field.onChange} disabled={!isEditing}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="diabetes">Diabetes</SelectItem>
              <SelectItem value="hypertension">Hypertension</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <div className="p-4 grid grid-cols-1 gap-4">

      {/* Primary Condition selector placed at top of Medical section */}
      {PrimaryConditionField}


      {/* Other Conditions */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-semibold text-foreground">Other Conditions</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="otherConditions.kidneyDisease"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Kidney Disease
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherConditions.heartDisease"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Heart Disease
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Diabetes Fields */}
      {(condition === "diabetes" || condition === "both") && (
        <>

          {/* Current blood sugar */}
          <FormField
            control={form.control}
            name="diabetesStatus.bloodSugar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Droplet className="w-4 h-4 text-pink-500" />
                  Current Blood Sugar (mg/dL)
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
        </>
      )}

      {/* Hypertension Fields */}
      {(condition === "hypertension" || condition === "both") && (
        <>
          {/* Systolic */}
          <FormField
            control={form.control}
            name="hypertensionStatus.bloodPressure.systolic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HeartPulse className="w-4 h-4 text-pink-500" />
                  Systolic BP
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

          {/* Diastolic */}
          <FormField
            control={form.control}
            name="hypertensionStatus.bloodPressure.diastolic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HeartPulse className="w-4 h-4 text-pink-500" />
                  Diastolic BP
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
        </>
      )}

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
                  <Select
                    defaultValue=""
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

                  <div className="mt-3 flex flex-wrap gap-2">
                    {meds.length === 0 && (
                      <div className="text-sm text-muted-foreground">No medications selected.</div>
                    )}
                    {meds.map((m) => (
                      <Badge key={m} className="flex items-center gap-2">
                        <span>{m}</span>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-transparent p-0"
                            onClick={() => field.onChange(meds.filter((x) => x !== m))}
                          >
                            <Activity className="h-3 w-3" />
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
                  <Select
                    defaultValue=""
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

                  <div className="mt-3 flex flex-wrap gap-2">
                    {meds.length === 0 && (
                      <div className="text-sm text-muted-foreground">No medications selected.</div>
                    )}
                    {meds.map((m) => (
                      <Badge key={m} className="flex items-center gap-2">
                        <span>{m}</span>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-transparent p-0"
                            onClick={() => field.onChange(meds.filter((x) => x !== m))}
                          >
                            <Activity className="h-3 w-3" />
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
    </div>
  )
}

// Now that TreatmentSection is integrated, we can export MedicalSection directly
export default MedicalSection
