import { useField } from "formik";
import { Input } from "@lecode/components/ui/input";
import { Label } from "@lecode/components/ui/label";
import { cn } from "@lecode/lib/utils";

// Formik-bound text field with a label and inline error. Keeps every form's
// field markup identical instead of repeating error wiring per page.
export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [field, meta] = useField(name);
  const showError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(showError && "border-destructive focus-visible:ring-destructive")}
        {...field}
      />
      {showError && <p className="text-xs text-destructive">{meta.error}</p>}
    </div>
  );
}
