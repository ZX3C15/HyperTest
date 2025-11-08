import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { userProfileSchema, UserProfile as UserProfileType } from "@shared/schema"
import { getUserProfile } from "@/lib/auth"
import { Form } from "@/components/ui/form"
import BasicInfoSection from "./BasicInfoSection"
import DemographicsSection from "./DemographicSection"
import MedicalSection from "./MedicalSection"
import ProfileActions from "./ProfileActions"
import { User, MapPin, HeartPulse } from "lucide-react"

interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    photoURL?: string
    profile?: UserProfileType | null
  }
  onSaveProfile: (data: UserProfileType) => void
  onSignOut: () => void
}

export default function UserProfile({ user, onSaveProfile, onSignOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Provide a complete default profile shape so form fields are always controlled.
  const emptyProfile: UserProfileType = {
    name: user.profile?.name || '',
    email: user.profile?.email || user.email || '',
    primaryCondition: (user.profile?.primaryCondition as any) || 'diabetes',
    otherConditions: user.profile?.otherConditions || { kidneyDisease: false, heartDisease: false },
    diabetesStatus: user.profile?.diabetesStatus || { bloodSugar: 0 },
    hypertensionStatus: user.profile?.hypertensionStatus || { bloodPressure: { systolic: 120, diastolic: 80 } },
    treatmentManagement: user.profile?.treatmentManagement || {
      diabetesMedication: { medications: [] },
      hypertensionMedication: { medications: [] },
    },
    demographics: user.profile?.demographics || {
      biologicalSex: 'Male',
      age: 18,
      heightCm: 170,
      weightKg: 70,
      activityLevel: 'Sedentary',
    },
  }

  const form = useForm<UserProfileType>({
    resolver: zodResolver(userProfileSchema),
    // Always initialize with the full emptyProfile so all inputs are controlled
    defaultValues: emptyProfile,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return
      const profileData = await getUserProfile(user.id)
      // Merge fetched profile with emptyProfile to ensure all nested keys exist
      if (profileData) {
        const merged = {
          ...emptyProfile,
          ...profileData,
          demographics: { ...emptyProfile.demographics, ...(profileData.demographics || {}) },
          otherConditions: { ...emptyProfile.otherConditions, ...(profileData.otherConditions || {}) },
          diabetesStatus: { ...emptyProfile.diabetesStatus, ...(profileData.diabetesStatus || {}) },
          hypertensionStatus: { ...emptyProfile.hypertensionStatus, ...(profileData.hypertensionStatus || {}) },
          treatmentManagement: {
            diabetesMedication: { ...emptyProfile.treatmentManagement.diabetesMedication, ...(profileData.treatmentManagement?.diabetesMedication || {}) },
            hypertensionMedication: { ...emptyProfile.treatmentManagement.hypertensionMedication, ...(profileData.treatmentManagement?.hypertensionMedication || {}) },
          },
        } as UserProfileType

        form.reset(merged)
      } else {
        form.reset(emptyProfile)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user.id, form])

  const onSubmit = async (data: UserProfileType) => {
    try {
      await onSaveProfile(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Loading profile...</p>

  // Card classes for content (matches Home.tsx)
  const cardClass =
    "p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border-0"

  // Trigger gradient wrapper (for icon)
  const triggerWrapper = (from: string, to: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br ${from} ${to} text-white shadow-lg`

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
          {/* Basic Info */}
          <AccordionItem value="basic">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-blue-500", "to-cyan-500 dark:from-blue-700 dark:to-cyan-700")}>
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Basic Information</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <BasicInfoSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Demographics */}
          <AccordionItem value="demographics">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-emerald-500", "to-lime-500 dark:from-emerald-700 dark:to-lime-700")}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Demographics</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <DemographicsSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Medical Info */}
          <AccordionItem value="medical">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-rose-500", "to-pink-500 dark:from-rose-700 dark:to-pink-700")}>
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Medical Information</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <MedicalSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* (Treatment moved into Medical Information; daily intake removed) */}
        </Accordion>

        <ProfileActions
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          form={form}
          onSubmit={onSubmit}
          onSignOut={onSignOut}
          originalProfile={user.profile}
        />
      </form>
    </Form>
  )
}
