import { Button } from "@/components/ui/button"

interface ProfileActionsProps {
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  form: any
  onSubmit: (data: any) => Promise<void>
  onSignOut: () => void
  originalProfile?: any
}

export default function ProfileActions({
  isEditing,
  setIsEditing,
  form,
  onSubmit,
  onSignOut,
  originalProfile,
}: ProfileActionsProps) {
  return (
    <div className="flex justify-center gap-4 pt-6">
      {isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Reset to the original profile values
              form.reset(originalProfile)
              setIsEditing(false)
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:opacity-90"
          >
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:opacity-90"
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onSignOut}
            className="shadow-md"
          >
            Sign Out
          </Button>
        </>
      )}
    </div>
  )
}
