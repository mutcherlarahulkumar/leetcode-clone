import { useState } from "react";
import { Formik, Form, useField } from "formik";
import { toast } from "sonner";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  useCreateSolution,
  useUpdateSolution,
  useDeleteSolution,
} from "@lecode/api/admin/solutions";
import { solutionSchema, type SolutionValues } from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import type { AdminSolution, AdminTemplate } from "@lecode/types";
import { LanguageIcon } from "@lecode/components/common/LanguageIcon";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { FormEditor } from "@lecode/components/common/FormEditor";
import { FormSelect } from "@lecode/components/common/FormSelect";
import { Button } from "@lecode/components/ui/button";
import { Badge } from "@lecode/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lecode/components/ui/card";

function ReferenceCheckbox() {
  const [field] = useField({ name: "isReference", type: "checkbox" });
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" {...field} />
      Reference solution (produces the expected outputs)
    </label>
  );
}

export function SolutionsSection({
  questionId,
  solutions,
  templates,
}: {
  questionId: string;
  solutions: AdminSolution[];
  templates: AdminTemplate[];
}) {
  const create = useCreateSolution(questionId);
  const update = useUpdateSolution(questionId);
  const del = useDeleteSolution(questionId);

  // solutions can only be in a language that has a template, and they start from
  // that template's stub -- the admin solves under the same conditions as a user
  const templateOf = (languageID: string) =>
    templates.find((t) => t.language_id === languageID);
  const nameOf = (languageID: string) => templateOf(languageID)?.language_name ?? "unknown";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [initial, setInitial] = useState<SolutionValues>({
    languageID: "",
    code: "",
    isReference: solutions.length === 0,
  });
  const [formKey, setFormKey] = useState(0);

  const startNew = () => {
    setEditingId(null);
    setInitial({ languageID: "", code: "", isReference: solutions.length === 0 });
    setFormKey((k) => k + 1);
  };
  const startEdit = (s: AdminSolution, code: string) => {
    setEditingId(s.id);
    setInitial({ languageID: s.language_id, code, isReference: s.is_reference });
    setFormKey((k) => k + 1);
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solutions</CardTitle>
          <CardDescription>Add a language template first (previous step).</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solutions</CardTitle>
        <CardDescription>
          Write the solution as a function body, exactly like a solver — it starts
          from the language&apos;s stub and runs inside its harness. The reference
          solution generates the expected outputs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {solutions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No solutions yet.</p>
        ) : (
          <ul className="space-y-2">
            {solutions.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-md border p-3">
                <LanguageIcon slug={templateOf(s.language_id)?.language_slug} className="h-4 w-4" />
                <span className="text-sm font-medium">{nameOf(s.language_id)}</span>
                {s.is_reference && <Badge variant="default">reference</Badge>}
                <div className="ml-auto flex items-center gap-1">
                  <StatusBadge status={s.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit solution"
                    onClick={() => {
                      // the list has no code; seed the editor from the stub so the
                      // admin re-writes it, or they can paste their prior code
                      startEdit(s, templateOf(s.language_id)?.stub ?? "");
                    }}
                  >
                    <FiEdit2 />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    aria-label="Delete solution"
                    onClick={async () => {
                      try {
                        await del.mutateAsync(s.id);
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

        <Formik<SolutionValues>
          key={formKey}
          initialValues={initial}
          validationSchema={solutionSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              if (editingId) {
                await update.mutateAsync({
                  solutionId: editingId,
                  code: values.code,
                  isReference: values.isReference,
                });
                toast.success("Solution updated");
              } else {
                await create.mutateAsync(values);
                toast.success("Solution added");
              }
              resetForm();
              startNew();
            } catch (err) {
              toast.error(errorMessage(err, "Could not save solution"));
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            const tmpl = templateOf(values.languageID);
            return (
              <Form className="space-y-3 rounded-md border border-dashed p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {editingId ? "Edit solution" : "Add a solution"}
                  </p>
                  {editingId && (
                    <Button type="button" variant="ghost" size="sm" onClick={startNew}>
                      Cancel edit
                    </Button>
                  )}
                </div>
                <FormSelect
                  name="languageID"
                  label="Language"
                  placeholder="Pick a templated language"
                  value={values.languageID}
                  setValue={(n, v) => {
                    setFieldValue(n, v);
                    // seed with the stub when starting fresh in a new language
                    if (!editingId) setFieldValue("code", templateOf(v)?.stub ?? "");
                  }}
                  options={templates.map((t) => ({
                    value: t.language_id,
                    label: t.language_name,
                  }))}
                />
                <FormEditor
                  name="code"
                  label="Solution (function body)"
                  slug={tmpl?.language_slug ?? "plaintext"}
                  height={240}
                />
                <ReferenceCheckbox />
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {editingId ? "Save changes" : "Add solution"}
                </Button>
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
}
