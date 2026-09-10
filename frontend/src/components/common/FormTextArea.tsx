import { useField } from "formik";
import { Label } from "@lecode/components/ui/label";
import { Textarea } from "@lecode/components/ui/textarea";
import { cn } from "@lecode/lib/utils";

export function FormTextArea({
  name,
  label,
  placeholder,
  rows = 4,
  mono = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  const [field, meta] = useField(name);
  const showError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        className={cn(mono && "font-mono text-xs", showError && "border-destructive")}
        {...field}
      />
      {showError && <p className="text-xs text-destructive">{meta.error}</p>}
    </div>
  );
}
