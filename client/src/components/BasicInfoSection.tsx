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
  import { User, Mail, Calendar, Activity } from "lucide-react";

export default function BasicInfoSection({ form, isEditing }: { form: any; isEditing: boolean }) {
  const maskSensitive = (value: string) => {
    if (!value) return "";
    const [name, domain] = value.split("@");
    return name && domain ? `${name[0]}***@${domain}` : value;
  };

  return (
    <div className="p-6 rounded-2xl border border-border shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-blue-500" />
                Full Name
              </FormLabel>
              <FormControl>
                <Input {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-blue-500" />
                Email
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={isEditing ? field.value : maskSensitive(field.value)}
                  disabled={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age is now part of demographics - moved to Demographics section */}

        {/* Primary Condition moved to Medical section */}
      </div>
    </div>
  );
}

