import { AnalyzeFoodRequest, UserProfile, HealthPrediction, healthPredictionSchema } from "@shared/schema"
import { getUserScanHistory, updateUserHealthTips } from "@/lib/firestore"

const LLM_URL = import.meta.env.VITE_LOCAL_LLM_URL || "http://localhost:11434/api/generate"

/**
 * Analyzes food safety using a local LLaMA model.
 * Combines nutrient data + user health profile to determine if food is "Safe" or "Risky".
 */
export const analyzeFood = async (
  nutritionData: AnalyzeFoodRequest,
  userProfile: UserProfile
): Promise<HealthPrediction> => {
  try {
    console.log("🧑 User Profile:", JSON.stringify(userProfile, null, 2))
    console.log("🍎 Nutrition Data:", JSON.stringify(nutritionData, null, 2))

    // Validate userProfile against the simplified schema shape
    const missingProfileParts: string[] = []
    if (!userProfile.name) missingProfileParts.push("name")
    if (!userProfile.demographics || userProfile.demographics.age === undefined) missingProfileParts.push("demographics.age")
    if (!userProfile.primaryCondition) missingProfileParts.push("primaryCondition")
    // diabetesStatus and hypertensionStatus are optional in the schema; we'll warn if they might be relevant
    if (userProfile.primaryCondition === 'diabetes' && !userProfile.diabetesStatus) missingProfileParts.push('diabetesStatus')
    if (userProfile.primaryCondition === 'hypertension' && !userProfile.hypertensionStatus) missingProfileParts.push('hypertensionStatus')

    if (missingProfileParts.length) {
      console.warn("⚠️ Missing user profile fields before LLM request:", missingProfileParts)
    } else {
      console.log("✅ User Profile Validation Passed")
    }

    // Validate nutrition data
    const missingNutrition: string[] = []
    if (nutritionData.calories === undefined) missingNutrition.push("calories")
    if (nutritionData.carbohydrates === undefined) missingNutrition.push("carbohydrates")
    if (nutritionData.sodium === undefined) missingNutrition.push("sodium")
    
    if (missingNutrition.length) {
      console.warn("⚠️ Missing nutrition data fields:", missingNutrition)
    }

  const prompt = buildPrompt(nutritionData, userProfile)
    console.log("🔍 Built Prompt (trimmed):", prompt.slice(0, 1000))

    const body: Record<string, any> = {
      model: import.meta.env.VITE_LLM_MODEL || "llama3.2",
      prompt,
      metadata: { userProfile },
      messages: [
        { role: "system", content: "You are a nutrition and health expert." },
        { role: "user", content: prompt },
        { role: "user", content: `USER_PROFILE_JSON: ${JSON.stringify(userProfile)}` },
      ],
      stream: false,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)

    let response: Response
    try {
      response = await fetch(LLM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Ollama Error Response:", error)
      console.error("Request details:", {
        url: LLM_URL,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`LLM error: ${error}`)
    }

    let result: any
    try {
      result = await response.json()
    } catch (err) {
      const text = await response.text().catch(() => "<unreadable body>")
      console.error("❌ Failed to parse JSON from LLM response.", {
        error: err,
        rawText: text,
        status: response.status,
        contentType: response.headers.get('content-type')
      })
      throw err
    }

    console.log("📥 Raw LLM Response:", result)

    const outputCandidates = [
      result.response,
      result.text,
      result.output?.[0]?.content,
      result.result?.content,
      result.choices?.[0]?.message?.content,
      result.choices?.[0]?.text,
      typeof result === "string" ? result : undefined,
    ]

    const output = outputCandidates.find(Boolean) || ""
    console.log("🧾 LLM Output (first non-empty):", String(output).slice(0, 1500))

    const parsed = parseLlmResponse(String(output))
    return parsed
  } catch (error) {
    console.error("❌ LLM call failed:", error)
    try {
      console.error("Attempted nutrition data:", JSON.stringify(nutritionData))
      console.error("Attempted userProfile:", JSON.stringify((userProfile as any) || {}, null, 2))
    } catch {}
    return fallbackAnalysis(nutritionData)
  }
}

/**
 * Generate personalized daily health tips for a user using LLM based on today's scans.
 * - Fetches today's scans
 * - Counts safe vs risky
 * - Asks LLM for 5 short, actionable tips tailored to the user
 * - Saves tips to user's profile via `updateUserHealthTips`
 */
export async function generatePersonalizedDailyTips(userId: string, userProfile?: UserProfile): Promise<void> {
  try {
    console.log("🧾 Generating daily tips for user:", userId)

    const allScans = await getUserScanHistory(userId)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const todaysScans = allScans.filter((s) => new Date(s.timestamp) >= startOfDay)

    const counts = { safe: 0, risky: 0 }
    todaysScans.forEach((r) => {
      const raw = typeof r.prediction === 'string' ? r.prediction : r.prediction?.prediction || ''
      const val = String(raw).toLowerCase()
      if (val === 'safe') counts.safe++
      else if (val === 'risky') counts.risky++
    })

    console.log('📊 Today scans:', { total: todaysScans.length, counts })

    // Build a structured prompt following the same style used by buildPrompt()
    const userDemographics = userProfile?.demographics
    const bmiString = userProfile?.demographics ? (() => {
      try {
        const h = (userProfile!.demographics.heightCm || 0) / 100
        return userProfile!.demographics.weightKg && h > 0 ? (userProfile!.demographics.weightKg / (h * h)).toFixed(1) : 'unknown'
      } catch { return 'unknown' }
    })() : 'unknown'

    const sampleScans = todaysScans.slice(0, 5).map((s, i) => {
      const pred = typeof s.prediction === 'string' ? s.prediction : s.prediction?.prediction || 'unknown'
      return `- ${s.foodName || 'Unnamed Food'}: ${pred}${s.prediction?.reasoning ? ` — ${String(s.prediction.reasoning).slice(0,120)}` : ''}`
    }).join('\n') || '- (no scans)'

    const prompt = `You are a practical, evidence-based nutrition and behavior-change coach.

Provide exactly 5 short (one-sentence) actionable health tips for this user based on their profile and today's food scans. Do NOT include explanations or extra commentary — respond strictly with a JSON array of 5 objects in the form [{"content":"..."}, ...].

### USER PROFILE
Name: ${userProfile?.name ?? 'unknown'}
- Age: ${userDemographics?.age ?? 'unknown'}
- Sex: ${userDemographics?.biologicalSex ?? 'unknown'}
- Height: ${userDemographics?.heightCm ?? 'unknown'} cm
- Weight: ${userDemographics?.weightKg ?? 'unknown'} kg
- BMI: ${bmiString}
- Activity Level: ${userDemographics?.activityLevel ?? 'unknown'}

Medical Conditions:
- Primary Condition: ${userProfile?.primaryCondition ?? 'unknown'}
- Other Conditions: KidneyDisease=${userProfile?.otherConditions?.kidneyDisease ? 'Yes' : 'No'}, HeartDisease=${userProfile?.otherConditions?.heartDisease ? 'Yes' : 'No'}

Medications:
- Diabetes meds: ${(userProfile?.treatmentManagement?.diabetesMedication.medications || []).join(', ') || 'None'}
- Hypertension meds: ${(userProfile?.treatmentManagement?.hypertensionMedication.medications || []).join(', ') || 'None'}

### TODAY'S SCANS SUMMARY
Total scans: ${todaysScans.length}
- Safe: ${counts.safe}
- Risky: ${counts.risky}


### TASK
Create 5 concise, actionable tips the user can apply today to reduce risk and improve dietary choices. Each tip should be personalized to the profile and today's scan summary.

Respond strictly as JSON: [{"content":"tip 1"}, {"content":"tip 2"}, {"content":"tip 3"}, {"content":"tip 4"}, {"content":"tip 5"}]
`

    const body: Record<string, any> = {
      model: import.meta.env.VITE_LLM_MODEL || 'llama3.2',
      prompt,
      metadata: { userId, counts, todaysScansLength: todaysScans.length },
      messages: [
        { role: 'system', content: 'You are a nutrition and health expert.' },
        { role: 'user', content: prompt }
      ],
      stream: false
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    let response: Response
    try {
      response = await fetch(LLM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '<unreadable>')
      console.error('❌ LLM tips request failed:', response.status, errText)
      throw new Error('LLM tips request failed')
    }

    const raw = await response.text()
    console.log('📥 LLM tips raw output (truncated):', raw.slice(0, 1000))

    const tips = parseTipsFromLlm(raw)
    if (!tips || tips.length !== 5) {
      console.warn('⚠️ LLM did not return 5 tips; using default tips')
      // Fallback default tips
      const defaultTips = [
        { content: 'Choose lower-sodium options when possible.' },
        { content: 'Prefer whole foods and add vegetables to meals.' },
        { content: 'Watch portion sizes and consider splitting large portions.' },
        { content: 'Limit added sugars and sugary drinks.' },
        { content: 'Balance carbs with protein and fiber to slow absorption.' },
      ]
      await updateUserHealthTips(userId, defaultTips)
      return
    }

    // Save tips to user profile
    await updateUserHealthTips(userId, tips)
    console.log('✅ Saved personalized tips for user:', userId)
  } catch (err) {
    console.error('Error generating personalized tips:', err)
  }
}

/**
 * Parse LLM response for tips array [{content: string}, ...]
 */
function parseTipsFromLlm(output: string): { content: string }[] | null {
  try {
    // 1) If the LLM returned a JSON wrapper (e.g., { response: "[...]" }), parse it first
    try {
      const wrapper = JSON.parse(output)
      // common fields that may contain the array as a string
      const candidates = [
        wrapper.response,
        wrapper.text,
        wrapper.output?.[0]?.content,
        wrapper.result?.content,
        wrapper.choices?.[0]?.message?.content,
        wrapper.choices?.[0]?.text,
      ]
      for (const c of candidates) {
        if (!c || typeof c !== 'string') continue
        // try direct parse if it looks like JSON array
        const trimmed = c.trim()
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) return parsed.map((t: any) => ({ content: String(t.content || t) })).slice(0, 5)
          } catch (err) {
            // try to extract bracketed substring
          }
        }

        // try to extract first bracketed array inside the string
        const arrMatch = String(c).match(/\[[\s\S]*\]/)
        if (arrMatch) {
          try {
            const parsed = JSON.parse(arrMatch[0])
            if (Array.isArray(parsed)) return parsed.map((t: any) => ({ content: String(t.content || t) })).slice(0, 5)
          } catch (err) {
            // fallthrough to next candidate
          }
        }
      }
    } catch (err) {
      // not a JSON wrapper — continue to raw extraction
    }

    // 2) Try to find a raw JSON array anywhere in the output
    const jsonMatch = output.match(/\[[\s\S]*?\]/)
    if (jsonMatch) {
      // Clean common escape sequences if present
      let arrText = jsonMatch[0]
      // Replace escaped quotes like \" inside a quoted wrapper
      arrText = arrText.replace(/\\"/g, '"')
      const parsed = JSON.parse(arrText)
      if (Array.isArray(parsed)) return parsed.map((t: any) => ({ content: String(t.content || t) })).slice(0, 5)
    }

    return null
  } catch (err) {
    console.warn('⚠️ Failed to parse tips from LLM output:', err)
    return null
  }
}

/**
 * Builds structured LLM prompt with 5 health tips.
 */
function buildPrompt(nutrition: AnalyzeFoodRequest, user: UserProfile): string {
  // Calculate BMI
  const heightM = user.demographics.heightCm / 100;
  const bmi = user.demographics.weightKg / (heightM * heightM);

  return `
You are a nutrition and health expert. 
Analyze if the following food is "Safe" or "Risky" for the user based on their full medical profile.

### USER PROFILE
Demographics:
- Name: ${user.name}
- Age: ${user.demographics.age} years
- Sex: ${user.demographics.biologicalSex}
- Height: ${user.demographics.heightCm} cm
- Weight: ${user.demographics.weightKg} kg
- BMI: ${bmi.toFixed(1)}
- Activity Level: ${user.demographics.activityLevel}

Medical Conditions:
- Primary Condition: ${user.primaryCondition}
- Other Conditions:
  - Kidney Disease: ${user.otherConditions.kidneyDisease ? 'Yes' : 'No'}
  - Heart Disease: ${user.otherConditions.heartDisease ? 'Yes' : 'No'}

${user.primaryCondition === 'diabetes' || user.primaryCondition === 'both' ? `
Diabetes Management:
- Blood Sugar Level: ${user.diabetesStatus?.bloodSugar ?? 'unknown'} mg/dL
- Medications: ${user.treatmentManagement.diabetesMedication.medications?.join(', ') || 'None'}` : ''}

${user.primaryCondition === 'hypertension' || user.primaryCondition === 'both' ? `
Hypertension Management:
- Blood Pressure: ${user.hypertensionStatus?.bloodPressure?.systolic ?? 'unknown'}/${user.hypertensionStatus?.bloodPressure?.diastolic ?? 'unknown'} mmHg
- Medications: ${user.treatmentManagement.hypertensionMedication.medications?.join(', ') || 'None'}` : ''}

### FOOD NUTRITION
- Food Name: ${nutrition.foodName || "Unnamed Food"}
- Calories: ${nutrition.calories} kcal
- Carbohydrates: ${nutrition.carbohydrates} g
- Protein: ${nutrition.protein} g
- Fat: ${nutrition.fat} g
- Sodium: ${nutrition.sodium} mg
- Fiber: ${nutrition.fiber} g
- Total Sugars: ${nutrition.totalSugars ?? 'unknown'} g
- Added Sugars: ${nutrition.addedSugars ?? 'unknown'} g
- Saturated Fat: ${nutrition.saturatedFat ?? 'unknown'} g
- Trans Fat: ${nutrition.transFat ?? 'unknown'} g
- Potassium: ${nutrition.potassium ?? 'unknown'} mg
- Cholesterol: ${nutrition.cholesterol ?? 'unknown'} mg
- Serving Size: ${nutrition.servingSize ?? 'unspecified'}
- Servings / Container: ${nutrition.servingsPerContainer ?? 'unspecified'}

### TASK
Determine if this food is **Safe** or **Risky** for this user. 
Base your decision on:
1. Nutritional content vs medical conditions
2. Patient's current health metrics (BP, blood sugar)
3. Overall health status (BMI, activity level)
4. Medication interactions if relevant

Respond **strictly in JSON** format like this:

{
  "prediction": "Safe" | "Risky",
  "reasoning": "Detailed explanation of how this food impacts the user's health condition based on their complete profile, medications, and current health status."
}
`
}

/**
 * Parses and validates model output with Zod.
 */
function parseLlmResponse(output: string): HealthPrediction {
  // Try several strategies to extract JSON from a noisy LLM output.
  const extractJson = (text: string): string | null => {
    // 1) Triple-backtick fenced JSON ```json ... ``` or ``` ... ```
    const fenceJson = text.match(/```(?:json\n)?([\s\S]*?)```/i)
    if (fenceJson && fenceJson[1]) return fenceJson[1].trim()

    // 2) First JSON object {...}
    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) return objMatch[0]

    // 3) First JSON array [...]
    const arrMatch = text.match(/\[[\s\S]*\]/)
    if (arrMatch) return arrMatch[0]

    // 4) Try finding the largest brace-balanced substring
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.slice(firstBrace, lastBrace + 1)
    }

    return null
  }

  try {
    const jsonText = extractJson(output)
    if (!jsonText) throw new Error('No JSON found in model response')

    let parsedJson: any
    try {
      parsedJson = JSON.parse(jsonText)
    } catch (err) {
      // If parsing fails, try to sanitize common issues: trailing commas, smart quotes
      const sanitized = jsonText
        .replace(/[\u2018\u2019\u201C\u201D]/g, '"') // smart quotes -> regular
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
      parsedJson = JSON.parse(sanitized)
    }

    // Ensure healthTip exists (schema requires it) — supply defaults if missing
    const healthTip = parsedJson.healthTip || getDefaultHealthTips(parsedJson.prediction === 'Risky')

    return healthPredictionSchema.parse({
      ...parsedJson,
      healthTip,
    })
  } catch (err) {
    console.warn('⚠️ LLaMA output parsing failed, using heuristic fallback:', err)
    // Fall back to heuristic: infer risk from keywords, return default tips
    const lowered = output.toLowerCase()

    if (/risky|not recommended|avoid|high sodium|high sugar|high carbohydrate/.test(lowered)) {
      return {
        prediction: 'Risky',
        reasoning: output.trim(),
        healthTip: getDefaultHealthTips(true),
      }
    }

    return {
      prediction: 'Safe',
      reasoning: output.trim(),
      healthTip: getDefaultHealthTips(false),
    }
  }
}

/**
 * Returns default health tips based on prediction
 */
function getDefaultHealthTips(isRisky: boolean) {
  if (isRisky) {
    return [
      { content: "Choose lower-sodium or lower-sugar alternatives." },
      { content: "Avoid processed foods with hidden sodium." },
      { content: "Stay hydrated to help regulate blood pressure." },
      { content: "Pair carbs with protein or fiber to slow absorption." },
      { content: "Monitor portion sizes for better control." },
    ]
  }

  return [
    { content: "Maintain balanced meals across the day." },
    { content: "Stay consistent with meal timing." },
    { content: "Include vegetables for fiber and nutrients." },
    { content: "Keep salt and sugar within daily limits." },
    { content: "Stay hydrated and active regularly." },
  ]
}

/**
 * Fallback if LLM is unreachable.
 * Uses evidence-based thresholds for nutritional analysis.
 */
function fallbackAnalysis(data: AnalyzeFoodRequest): HealthPrediction {
  const {
    condition,
    sodium,
    carbohydrates,
    addedSugars,
    saturatedFat,
    calories,
    potassium,
    servingSize
  } = data

  const reasons: string[] = []
  let isRisky = false

  // Analyze sodium content (hypertension focus)
  if (sodium >= 460) { // High sodium per serving (≥20% DV)
    isRisky = true
    reasons.push(`High sodium content (${sodium}mg) exceeds 20% DV per serving`)
  }
  
  // Analyze carbohydrates (diabetes focus)
  if (condition === "diabetes" || condition === "both") {
    if (carbohydrates > 60) {
      isRisky = true
      reasons.push(`Carbohydrate content (${carbohydrates}g) exceeds recommended meal range of 30-60g`)
    } else if (carbohydrates > 30 && servingSize?.toLowerCase().includes("snack")) {
      isRisky = true
      reasons.push(`Carbohydrate content (${carbohydrates}g) exceeds recommended snack range of 15-30g`)
    }
  }

  // Analyze added sugars
  if (addedSugars && addedSugars > 10) {
    isRisky = true
    reasons.push(`High added sugars (${addedSugars}g) exceeds 10g per serving threshold`)
  }

  // Analyze saturated fat
  if (saturatedFat && calories) {
    const satFatCalories = saturatedFat * 9 // 9 calories per gram of fat
    const satFatPercentage = (satFatCalories / calories) * 100
    if (satFatPercentage > 10) {
      isRisky = true
      reasons.push(`Saturated fat (${saturatedFat}g) exceeds 10% of calories`)
    }
  }

  // Special considerations for specific conditions
  if (condition === "hypertension" || condition === "both") {
    if (sodium > 1500 / 3) { // More than 1/3 of daily limit for hypertension
      isRisky = true
      reasons.push(`Sodium content (${sodium}mg) exceeds recommended per-meal limit for hypertension`)
    }
  }

  if (potassium) {
    // Note potassium content but don't make it a decisive factor
    reasons.push(`Contains ${potassium}mg potassium (beneficial for blood pressure control if no kidney issues)`)
  }

  if (isRisky) {
    return {
      prediction: "Risky",
      reasoning: reasons.join(". "),
      healthTip: [
        { content: "Choose lower-sodium alternatives when available." },
        { content: condition.includes("diabetes") ? "Monitor total carbohydrates carefully." : "Watch portion sizes." },
        { content: "Consider splitting portions for better nutrient management." },
        { content: "Balance with fiber-rich vegetables when possible." },
        { content: "Track daily totals of key nutrients (sodium, carbs, sugars)." },
      ],
    }
  }

  return {
    prediction: "Safe",
    reasoning: `Within recommended limits: ${reasons.length ? reasons.join(". ") : "all nutrient levels acceptable"}`,
    healthTip: [
      { content: "Continue monitoring portion sizes." },
      { content: "Maintain balanced nutrient intake across meals." },
      { content: "Include variety in your diet for complete nutrition." },
      { content: "Stay hydrated throughout the day." },
      { content: "Regular physical activity supports healthy metabolism." },
    ],
  }
}
