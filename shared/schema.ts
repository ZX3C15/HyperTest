import { z } from "zod";

// ----------------------------------------------------
// 🧾 Base Schemas
// ----------------------------------------------------
export const nutritionDataSchema = z.object({
  calories: z.number().min(0).max(5000),
  carbohydrates: z.number().min(0).max(500),
  protein: z.number().min(0).max(200),
  fat: z.number().min(0).max(200),
  sodium: z.number().min(0).max(10000),
  fiber: z.number().min(0).max(100),
  // sugars: provide both total and added sugars (grams)
  totalSugars: z.number().min(0).max(500),
  addedSugars: z.number().min(0).max(500).optional(),
  // additional nutrients from nutrition facts
  saturatedFat: z.number().min(0).max(200).optional(),
  transFat: z.number().min(0).max(50).optional(),
  potassium: z.number().min(0).max(20000).optional(), // mg
  cholesterol: z.number().min(0).max(2000).optional(), // mg
  // serving info
  servingSize: z.string().optional(),
  servingsPerContainer: z.number().min(0).optional(),
});

export const healthConditionSchema = z.enum(["diabetes", "hypertension", "both"]);

// Tip schema is used by both health predictions and user profiles
export const healthTipSchema = z.object({
  content: z.string(),
});

// Health prediction includes reasoning and personalized tips
export const healthPredictionSchema = z.object({
  prediction: z.enum(["Safe", "Risky"]),
  reasoning: z.string(),
  healthTip: z.array(healthTipSchema),
});

// ----------------------------------------------------
// 👤 Category Schemas (Exported Individually)
// ----------------------------------------------------

// 1️⃣ Other Conditions
export const otherConditionsSchema = z.object({
  kidneyDisease: z.boolean(),
  heartDisease: z.boolean(),
});

// 2️⃣ Diabetes-Specific Status
export const diabetesStatusSchema = z.object({
  bloodSugar: z.number().min(0).max(1000),
});

// 3️⃣ Hypertension-Specific Status
export const hypertensionStatusSchema = z.object({
  bloodPressure: z.object({
    systolic: z.number().min(50).max(300),
    diastolic: z.number().min(30).max(200),
  }),
});

// 4️⃣ Treatment & Medication Management
export const treatmentManagementSchema = z.object({
  diabetesMedication: z.object({
    medications: z.array(z.enum([
      "None",
      "Metformin",
      "Sulfonylureas",
      "DPP-4 inhibitors",
      "SGLT2 inhibitors",
      "GLP-1 receptor agonists",
      "Insulin - Short-acting",
      "Insulin - Long-acting",
      "Insulin - Both",
      "Other"
    ])).optional(),
  }),
  hypertensionMedication: z.object({
    medications: z.array(z.enum([
      "None",
      "ACE inhibitors",
      "ARBs",
      "Beta blockers",
      "Calcium channel blockers",
      "Diuretics",
      "Alpha blockers",
      "Vasodilators",
      "Other"
    ])).optional(),
  }),
});

// 5️⃣ Demographics & Basic Information
export const demographicsSchema = z.object({
  biologicalSex: z.enum(["Male", "Female", "Other"]),
  age: z.number().min(18).max(120),
  heightCm: z.number().min(50).max(250),
  weightKg: z.number().min(20).max(300),
  activityLevel: z.enum(["Sedentary", "Lightly Active", "Moderate", "Very Active"]),
});


// ----------------------------------------------------
// 🧩 Combined User Profile Schema (for full form or Firestore document)
// ----------------------------------------------------
export const userProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  primaryCondition: healthConditionSchema,
  otherConditions: otherConditionsSchema,
  diabetesStatus: diabetesStatusSchema.optional(),
  hypertensionStatus: hypertensionStatusSchema.optional(),
  treatmentManagement: treatmentManagementSchema,
  demographics: demographicsSchema,
});

// ----------------------------------------------------
// 🔍 Scan Record Schema
// ----------------------------------------------------
export const scanRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.string().datetime(),
  foodName: z.string().optional(),
  nutritionData: nutritionDataSchema,
  condition: healthConditionSchema,
  prediction: healthPredictionSchema,
});

// ----------------------------------------------------
// 🔐 Firebase User Schema
// ----------------------------------------------------
// export const firebaseUserSchema = z.object({
//   uid: z.string(),
//   email: z.string().email().nullable(),
//   displayName: z.string().nullable(),
//   emailVerified: z.boolean(),
// });

// ----------------------------------------------------
// 🧠 Type Exports
// ----------------------------------------------------
export type NutritionData = z.infer<typeof nutritionDataSchema>;
export type HealthCondition = z.infer<typeof healthConditionSchema>;
export type HealthPrediction = z.infer<typeof healthPredictionSchema>;

export type OtherConditions = z.infer<typeof otherConditionsSchema>;
export type DiabetesStatus = z.infer<typeof diabetesStatusSchema>;
export type HypertensionStatus = z.infer<typeof hypertensionStatusSchema>;
export type TreatmentManagement = z.infer<typeof treatmentManagementSchema>;
export type Demographics = z.infer<typeof demographicsSchema>;

export type UserProfile = z.infer<typeof userProfileSchema>;
export type ScanRecord = z.infer<typeof scanRecordSchema>;

// ----------------------------------------------------
// 🧾 Insert Schemas (for forms or writes)
// ----------------------------------------------------
export const insertUserProfileSchema = userProfileSchema.omit({});
export const insertScanRecordSchema = scanRecordSchema.omit({ id: true, timestamp: true });

export const analyzeFoodSchema = nutritionDataSchema.extend({
  condition: healthConditionSchema,
  foodName: z.string().optional(),
  scanStats: z.object({
    safeScans: z.number(),
    riskyScans: z.number()
  }).optional(),
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertScanRecord = z.infer<typeof insertScanRecordSchema>;
export type AnalyzeFoodRequest = z.infer<typeof analyzeFoodSchema>;
