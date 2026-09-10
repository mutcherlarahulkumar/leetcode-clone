import { useField } from "formik";
import { Label } from "@lecode/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lecode/components/ui/select";

export interface Option {
  value: string;
  label: string;
}

// Formik-bound shadcn Select. Radix Select is not a native input, so it is
// wired through Formik's setValue/setTouched rather than spreading field props.
export function FormSelect({
  name,
  label,
  options,
  placeholder,
  setValue,
  value,
}: {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  value: string;
  setValue: (name: string, value: string) => void;
}) {
  const [, meta] = useField(name);
  const showError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => setValue(name, v)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && <p className="text-xs text-destructive">{meta.error}</p>}
    </div>
  );
}
