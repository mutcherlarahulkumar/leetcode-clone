import { useState } from "react";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useUpsertTemplate, useDeleteTemplate } from "@lecode/api/admin/templates";
import { useLanguages } from "@lecode/api/languages";
import { templateSchema, type TemplateValues } from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { LANG_SLUG } from "@lecode/constants";
import type { AdminTemplate } from "@lecode/types";
import { LanguageIcon } from "@lecode/components/common/LanguageIcon";
import { FormEditor } from "@lecode/components/common/FormEditor";
import { FormSelect } from "@lecode/components/common/FormSelect";
import { Button } from "@lecode/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lecode/components/ui/card";

const EMPTY: TemplateValues = {
  languageID: "",
  stub: "",
  harness: "#include <iostream>\nusing namespace std;\n\n{{SOLUTION}}\n\nint main() {\n    // read input, call the solution, print the result\n}\n",
};

export function TemplatesSection({
  questionId,
  templates,
}: {
  questionId: string;
  templates: AdminTemplate[];
}) {
  const upsert = useUpsertTemplate(questionId);
  const del = useDeleteTemplate(questionId);
  const languages = useLanguages();
  const enabled = (languages.data ?? []).filter((l) => l.is_enabled);

  const [editing, setEditing] = useState<TemplateValues>(EMPTY);
  const [formKey, setFormKey] = useState(0);

  const load = (t: TemplateValues) => {
    setEditing(t);
    setFormKey((k) => k + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language templates</CardTitle>
        <CardDescription>
          A question offers exactly the languages with a template. The solver edits
          the stub; the harness (with a <code>{"{{SOLUTION}}"}</code> placeholder)
          reads input, calls their function, and prints the result.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates yet.</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-md border p-3">
                <LanguageIcon slug={t.language_slug} className="h-4 w-4" />
                <span className="text-sm font-medium">{t.language_name}</span>
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit template"
                    onClick={() =>
                      load({ languageID: t.language_id, stub: t.stub, harness: t.harness })
                    }
                  >
                    <FiEdit2 />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    aria-label="Delete template"
                    onClick={async () => {
                      try {
                        await del.mutateAsync(t.language_id);
                      } catch (err) {
                        toast.error(errorMessage(err, "Could not delete"));
                      }
                    }}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Formik<TemplateValues>
          key={formKey}
          initialValues={editing}
          validationSchema={templateSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              await upsert.mutateAsync(values);
              toast.success("Template saved");
              resetForm({ values: EMPTY });
              setEditing(EMPTY);
              setFormKey((k) => k + 1);
            } catch (err) {
              toast.error(errorMessage(err, "Could not save template"));
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            const slug =
              LANG_SLUG[enabled.find((l) => l.id === values.languageID)?.name ?? ""] ??
              "plaintext";
            return (
              <Form className="space-y-3 rounded-md border border-dashed p-3">
                <p className="text-sm font-medium">Add / edit a template</p>
                <FormSelect
                  name="languageID"
                  label="Language"
                  placeholder="Pick a language"
                  value={values.languageID}
                  setValue={(n, v) => setFieldValue(n, v)}
                  options={enabled.map((l) => ({ value: l.id, label: `${l.name} ${l.version}` }))}
                />
                <FormEditor name="stub" label="Stub (what the solver sees)" slug={slug} height={200} />
                <FormEditor
                  name="harness"
                  label="Harness (locked; must contain {{SOLUTION}})"
                  slug={slug}
                  height={260}
                />
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  Save template
                </Button>
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
}
