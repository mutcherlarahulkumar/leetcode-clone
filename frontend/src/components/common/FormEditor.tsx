import { useField } from "formik";
import { Label } from "@lecode/components/ui/label";
import { CodeEditor } from "@lecode/components/common/CodeEditor";
import { cn } from "@lecode/lib/utils";

// Formik-bound Monaco editor. Admins get a real editor for statements (markdown)
// and solution code (language-aware) rather than a plain textarea.
export function FormEditor({
  name,
  label,
  slug,
  height = 320,
}: {
  name: string;
  label: string;
  slug: string; // monaco language id: "markdown" | "cpp" | "ts" | "go"
  height?: number;
}) {
  const [field, meta, helpers] = useField(name);
  const showError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "overflow-hidden rounded-md border",
          showError && "border-destructive",
        )}
        style={{ height }}
      >
        <CodeEditor
          slug={slug}
          value={field.value ?? ""}
          onChange={(v) => helpers.setValue(v)}
        />
      </div>
      {showError && <p className="text-xs text-destructive">{meta.error}</p>}
    </div>
  );
}
