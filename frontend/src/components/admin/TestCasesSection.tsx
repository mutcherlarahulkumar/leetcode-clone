import { Formik, Form } from "formik";
import { toast } from "sonner";
import { FiTrash2 } from "react-icons/fi";
import { useCreateTestCase, useDeleteTestCase } from "@lecode/api/admin/testCases";
import { testCaseSchema, type TestCaseValues } from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { LIMITS } from "@lecode/constants";
import { TestCaseKind, type AdminTestCase } from "@lecode/types";
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

export function TestCasesSection({
  questionId,
  testCases,
  editable,
}: {
  questionId: string;
  testCases: AdminTestCase[];
  editable: boolean;
}) {
  const create = useCreateTestCase(questionId);
  const del = useDeleteTestCase(questionId);
  const sampleCount = testCases.filter((t) => t.kind === TestCaseKind.sample).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test cases</CardTitle>
        <CardDescription>
          {testCases.length}/{LIMITS.MAX_TEST_CASES} · {sampleCount} sample (min{" "}
          {LIMITS.MIN_SAMPLE_CASES} to generate)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testCases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No test cases yet.</p>
        ) : (
          <ul className="space-y-2">
            {testCases.map((tc) => (
              <li key={tc.id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={tc.kind === TestCaseKind.sample ? "default" : "secondary"}>
                    {tc.kind}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{tc.position}</span>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-destructive"
                      aria-label="Delete test case"
                      onClick={async () => {
                        try {
                          await del.mutateAsync(tc.id);
                        } catch (err) {
                          toast.error(errorMessage(err, "Could not delete"));
                        }
                      }}
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Input" value={tc.input} />
                  <Field label="Expected" value={tc.expected_output ?? "(not generated)"} />
                </div>
                {tc.explanation && <Field label="Explanation" value={tc.explanation} />}
              </li>
            ))}
          </ul>
        )}

        {editable ? (
          <Formik<TestCaseValues>
            initialValues={{ kind: TestCaseKind.sample, input: "", explanation: "" }}
            validationSchema={testCaseSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await create.mutateAsync({
                  kind: values.kind,
                  input: values.input,
                  explanation: values.explanation || undefined,
                });
                resetForm();
                toast.success("Test case added");
              } catch (err) {
                toast.error(errorMessage(err, "Could not add test case"));
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-3 rounded-md border border-dashed p-3">
                <p className="text-sm font-medium">Add a test case</p>
                <FormSelect
                  name="kind"
                  label="Kind"
                  value={values.kind}
                  setValue={(n, v) => setFieldValue(n, v)}
                  options={[
                    { value: TestCaseKind.sample, label: "Sample (shown to users)" },
                    { value: TestCaseKind.hidden, label: "Hidden" },
                  ]}
                />
                <FormTextArea name="input" label="Input (stdin)" mono rows={3} />
                {values.kind === TestCaseKind.sample && (
                  <FormTextArea name="explanation" label="Explanation" rows={2} />
                )}
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  Add test case
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unpublish the question to edit its test cases.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-xs">
        {value}
      </pre>
    </div>
  );
}
