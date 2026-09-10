import { useField } from "formik";
import { Label } from "@lecode/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lecode/components/ui/tabs";
import { FormEditor } from "@lecode/components/common/FormEditor";
import { Markdown } from "@lecode/components/common/Markdown";

// A Formik markdown field with a Write / Preview toggle. Preview renders through
// the same markdown + mermaid pipeline the solve page uses, so what the admin
// sees here is what the solver gets.
export function MarkdownField({
  name,
  label,
  height = 360,
}: {
  name: string;
  label: string;
  height?: number;
}) {
  const [field, meta] = useField(name);
  const value = (field.value as string) ?? "";
  const showError = meta.touched && !!meta.error;

  return (
    <div className="space-y-1.5">
      <Tabs defaultValue="write">
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="write" className="mt-2">
          <FormEditor name={name} label="" slug="markdown" height={height} />
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          <div
            className="overflow-auto rounded-md border p-4"
            style={{ height }}
          >
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {showError && <p className="text-xs text-destructive">{meta.error}</p>}
    </div>
  );
}
