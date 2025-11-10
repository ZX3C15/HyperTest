import { useState, useEffect } from 'react';
import CameraScanner from '@/components/CameraScanner';
import NutritionForm from '@/components/NutritionForm';
import HealthAssessment from '@/components/HealthAssessment';
import { NutritionData, AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';
import { createScanAuditLog } from '@/admin/lib/auditLog';
import { analyzeFood, generatePersonalizedDailyTips } from '@/lib/analyzeFood';
import { saveScanRecord, updateUserHealthTips } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileSchema } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ToastProvider,
} from "@/components/ui/toast"

export default function Scanner() {
  const { user, userProfile } = useAuth();
  const [scannedData, setScannedData] = useState<NutritionData | null>(null);
  const [healthResult, setHealthResult] = useState<HealthPrediction | null>(null);
  const [currentCondition, setCurrentCondition] = useState<'diabetes' | 'hypertension'>('diabetes');
  const [currentFoodName, setCurrentFoodName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false)
  const [toastInfo, setToastInfo] = useState<{
    title: string
    description: string
    variant?: "default" | "destructive"
  }>({ title: "", description: "", variant: "default" })

  const [showProfileModal, setShowProfileModal] = useState(false);

  const isProfileComplete = (profile: any) => {
    if (!profile) {
      console.warn("❌ Profile is null or undefined");
      return false;
    }
    try {
      userProfileSchema.parse(profile);
      console.log("✅ Profile validation passed:", profile);
      return true;
    } catch (error) {
      console.warn("❌ Profile validation failed:", error);
      return false;
    }
  };

  useEffect(() => {
    console.log('👤 Auth state changed:', { 
      user: !!user, 
      userProfile: !!userProfile,
      profileComplete: userProfile ? isProfileComplete(userProfile) : false 
    });
    
    if (user && userProfile && !isProfileComplete(userProfile)) {
      console.log('📝 Showing profile modal due to incomplete profile');
      setShowProfileModal(true);
    }
  }, [user, userProfile]);

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    // navigate to profile page for completion
    window.location.href = '/profile';
  };


  const handleScanComplete = (data: NutritionData) => {
    console.log('📸 Initial scan data received:', data);
    setScannedData(data);
    setHealthResult(null); // Reset previous results
    setLoading(false); // Ensure loading is false when new scan is complete
  };

  const handleAnalyze = async (data: AnalyzeFoodRequest) => {
    // Use a ref to track if we've already started analyzing
    const analysisStarted = loading;
    
    if (analysisStarted) {
      console.log('⏳ Analysis already in progress, skipping...');
      return;
    }

    // Set loading immediately to prevent double submission
    setLoading(true);

    console.log('🔍 handleAnalyze called with:', { 
      data, 
      userExists: !!user, 
      profileExists: !!userProfile,
      currentScannedData: !!scannedData
    });

    if (!userProfile || !user) {
      console.warn("⚠️ No user profile found:", { user: !!user, profile: !!userProfile });
      setShowProfileModal(true);
      return;
    }

    // Verify the profile is complete before proceeding
    const profileValidation = isProfileComplete(userProfile);
    console.log('🏥 Profile validation:', { 
      isComplete: profileValidation,
      profile: userProfile 
    });

    if (!profileValidation) {
      console.warn("⚠️ Incomplete user profile detected");
      setShowProfileModal(true);
      setToastInfo({
        title: "❌ Incomplete Profile",
        description: "Please complete your health profile first.",
        variant: "destructive"
      });
      setOpen(true);
      return;
    }

    console.log('🍎 Starting Analysis:', {
      foodData: data,
      condition: data.condition,
      foodName: data.foodName
    });
    
    // Set all states at once to prevent race conditions
    setLoading(true);
    setCurrentCondition(data.condition === 'both' ? 'diabetes' : data.condition);
    setCurrentFoodName(data.foodName || '');

    try {
      // Send the raw profile without modifying the condition
      const result = await analyzeFood(data, userProfile);
      console.log('Analysis Result:', result);
      setHealthResult(result);
      
      // Show success toast with meaningful health insight
      const severity = result.prediction === "Safe" ? "default" : "destructive";
      const message = result.prediction === "Safe" 
        ? "This food appears safe for your condition." 
        : "This food may need caution with your condition.";
      
      setToastInfo({
        title: `${result.prediction === "Safe" ? "✅" : "⚠️"} Analysis Complete`,
        description: message,
        variant: severity
      });
      setOpen(true);
    } catch (error) {
      console.error('Error analyzing food:', error);
      setToastInfo({
        title: "❌ Analysis Failed",
        description: "Could not analyze food. Please try again.",
        variant: "destructive"
      });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user || !scannedData || !healthResult) return;
    
    try {
      // Save scan record without health tips
      const scanRecord = {
        userId: user.uid,
        foodName: currentFoodName || "Unnamed Food", 
        nutritionData: scannedData,
        condition: currentCondition,
        prediction: {
          ...healthResult,
        },
      };
      await saveScanRecord(user.uid, scanRecord);

      // Create audit log for successful scan analysis and save
      await createScanAuditLog(
        user.uid,
        'scan.saved',
        `Food scan saved: ${currentFoodName || "Unnamed Food"} (${healthResult.prediction})`,
        'success',
        {
          foodName: currentFoodName || "Unnamed Food",
          prediction: healthResult.prediction,
          condition: currentCondition,
          hasHealthTips: healthResult.healthTip?.length > 0
        }
      );

      // Update user's health tips if available
      if (healthResult.healthTip?.length > 0) {
        await updateUserHealthTips(user.uid, healthResult.healthTip);
      }

      // Regenerate personalized daily tips using LLM based on today's scans
      try {
        await generatePersonalizedDailyTips(user.uid, userProfile || undefined);
      } catch (err) {
        console.error('Error generating personalized daily tips after save:', err);
      }

      setToastInfo({
        title: "✅ Saved!",
        description: "Scan and health tips saved successfully.",
        variant: "default",
      });
      setOpen(true);
      console.log('Scan and tips saved');
    } catch (error) {
      // Create audit log for failed scan save
      await createScanAuditLog(
        user.uid,
        'scan.saved',
        `Failed to save food scan: ${currentFoodName || "Unnamed Food"}`,
        'error',
        {
          foodName: currentFoodName || "Unnamed Food",
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      setToastInfo({
        title: "❌ Error",
        description: "Could not save scan. Please try again.",
        variant: "destructive",
      });
      setOpen(true);
      console.error('Error saving scan and tips:', error);
    }
  };

  return (
    <ToastProvider swipeDirection="right">
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              To provide accurate, personalized health insights, please complete your profile now.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll use this information to customize recommendations and calculate accurate targets.
            </p>
            <Button className="w-full" onClick={handleCompleteProfile}>
              Complete Profile Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">

      <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-profile-title">
          Food Analysis
        </h1>
        <p className="text-muted-foreground">
          Track your health journey with smart food analysis
        </p>
      </div>

      {/* Instructions Hero Section */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-300 dark:border-blue-700">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-500 rounded-lg shadow-lg flex-shrink-0">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                📋 How to Find Nutritional Information
              </h2>
              <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">🔍 Step 1: Locate the Nutrition Facts Label</p>
                  <p>Look for the "Nutrition Facts" panel on the back or side of the product package. It's usually a black and white table.</p>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">📝 Step 2: Find Key Information</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Serving Size:</strong> Located at the top (e.g., "1 cup (240g)")</li>
                    <li><strong>Calories:</strong> Usually the first number after serving size</li>
                    <li><strong>Nutrients:</strong> Listed below calories (carbs, protein, fat, sodium, etc.)</li>
                  </ul>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="font-semibold mb-2">✏️ Step 3: Input the Values</p>
                  <p>Enter each nutrient value into the corresponding field below. <strong>If a nutrient is not listed on the label, simply enter 0.</strong></p>
                </div>

                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">💡 Pro Tip:</p>
                  <p className="text-amber-800 dark:text-amber-200">Pay attention to "per serving" vs "per container" values. Make sure you're entering the per serving amounts!</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {!healthResult && (
          <>
            {loading ? (
              <div className="space-y-4">
                <div className="p-6 rounded-lg shadow-md bg-muted text-center space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
                  <p className="font-medium text-primary">Analyzing your nutrition label...</p>
                  <p className="text-sm text-muted-foreground">Checking against your health profile...</p>
                </div>
                
                <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-2 border-amber-300 dark:border-amber-700">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500 rounded-lg shadow-lg flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-1">
                          <span>⚠️</span> Medical Disclaimer
                        </h3>
                        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                          This analysis is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider before making dietary decisions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : scannedData ? (
              <NutritionForm 
                initialData={scannedData} 
                userCondition={userProfile?.primaryCondition || 'diabetes'}
                onAnalyze={handleAnalyze} 
              />
            ) : (
              <CameraScanner onScanComplete={handleScanComplete} />
            )}
          </>
        )}

        {healthResult && scannedData && (
          <div className="space-y-6">
                {/**
                 * healthResult currently follows the shared schema: { prediction: 'Safe'|'Risky', reasoning }
                 * HealthAssessment expects prediction: 'safe'|'moderate'|'risky' and a numeric confidence.
                 * Map the values conservatively so the UI renders without type errors.
                 */}
                <HealthAssessment
                  prediction={healthResult.prediction === 'Safe' ? 'safe' : 'risky'}
                  reasoning={healthResult.reasoning}
                  condition={currentCondition}
                  nutritionData={scannedData}
                />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setScannedData(null)
                  setHealthResult(null)
                  setCurrentFoodName("")
                }}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                data-testid="button-scan-another"
              >
                Scan Another Item
              </button>
              <button
                onClick={handleSaveToHistory}
                className="flex-1 py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                data-testid="button-save-to-history"
              >
                Save to History
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Toast lives here, OUTSIDE your scanner UI */}
      <Toast open={open} onOpenChange={setOpen} variant={toastInfo.variant}>
        <div className="grid gap-1">
          <ToastTitle>{toastInfo.title}</ToastTitle>
          <ToastDescription>{toastInfo.description}</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}