import { Formik, Form, useField } from "formik";
import { toast } from "sonner";
import { useCreateSolution } from "@lecode/api/admin/solutions";
import { useLanguages } from "@lecode/api/languages";
import { solutionSchema, type SolutionValues } from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { type AdminSolution } from "@lecode/types";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { FormTextArea } from "@lecode/components/common/FormTextArea";
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
  editable,
}: {
  questionId: string;
  solutions: AdminSolution[];
  editable: boolean;
}) {
  const create = useCreateSolution(questionId);
  const languages = useLanguages();
  const enabled = (languages.data ?? []).filter((l) => l.is_enabled);
  const nameOf = (id: string) =>
    languages.data?.find((l) => l.id === id)?.name ?? "unknown";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solutions</CardTitle>
        <CardDescription>
          The reference solution generates expected outputs. Extra solutions are
          for the optimal-time comparison.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {solutions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No solutions yet.</p>
        ) : (
          <ul className="space-y-2">
            {solutions.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-md border p-3">
                <span className="text-sm font-medium">{nameOf(s.language_id)}</span>
                {s.is_reference && <Badge variant="default">reference</Badge>}
                <div className="ml-auto">
                  <StatusBadge status={s.status} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {editable ? (
          <Formik<SolutionValues>
            initialValues={{ languageID: "", code: "", isReference: solutions.length === 0 }}
            validationSchema={solutionSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await create.mutateAsync(values);
                resetForm();
                toast.success("Solution added");
              } catch (err) {
                toast.error(errorMessage(err, "Could not add solution"));
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-3 rounded-md border border-dashed p-3">
                <p className="text-sm font-medium">Add a solution</p>
                <FormSelect
                  name="languageID"
                  label="Language"
                  placeholder="Pick a language"
                  value={values.languageID}
                  setValue={(n, v) => setFieldValue(n, v)}
                  options={enabled.map((l) => ({
                    value: l.id,
                    label: `${l.name} ${l.version}`,
                  }))}
                />
                <FormTextArea name="code" label="Code" mono rows={10} />
                <ReferenceCheckbox />
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  Add solution
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unpublish the question to change its solutions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
