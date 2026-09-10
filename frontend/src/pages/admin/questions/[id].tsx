import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { FiPlay, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import {
  useAdminQuestion,
  useUpdateQuestion,
  useGenerateQuestion,
  useUnpublishQuestion,
  useDeleteQuestion,
} from "@lecode/api/admin/questions";
import {
  createQuestionSchema,
  type CreateQuestionValues,
} from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { buildHints, arrayToLines } from "@lecode/lib/hints";
import { QuestionStatus } from "@lecode/types";
import { ROUTES } from "@lecode/constants";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { QuestionStatusBadge } from "@lecode/components/common/QuestionStatusBadge";
import { Stepper } from "@lecode/components/admin/Stepper";
import { TestCasesSection } from "@lecode/components/admin/TestCasesSection";
import { SolutionsSection } from "@lecode/components/admin/SolutionsSection";
import { FormField } from "@lecode/components/common/FormField";
import { FormEditor } from "@lecode/components/common/FormEditor";
import { FormTextArea } from "@lecode/components/common/FormTextArea";
import { Button } from "@lecode/components/ui/button";
import { Skeleton } from "@lecode/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@lecode/components/ui/card";

const STEPS = [
  { key: "details", label: "Details" },
  { key: "tests", label: "Test cases" },
  { key: "solutions", label: "Solutions" },
  { key: "publish", label: "Publish" },
];

export default function EditQuestionPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const [step, setStep] = useState(0);

  const { data: q, isLoading, isError, refetch } = useAdminQuestion(id);
  const update = useUpdateQuestion(id ?? "");
  const generate = useGenerateQuestion(id ?? "");
  const unpublish = useUnpublishQuestion(id ?? "");
  const remove = useDeleteQuestion();

  const generating = q?.status === QuestionStatus.generating;
  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => refetch(), 2000);
    return () => clearInterval(t);
  }, [generating, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (isError || !q || !id) {
    return <p className="text-sm text-destructive">Question not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{q.title}</h1>
        <QuestionStatusBadge status={q.status} />
      </div>

      <Stepper steps={STEPS} current={step} onSelect={setStep} />

      {/* Step 1 — details */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik<CreateQuestionValues & { hintsText: string; misconceptionsText: string }>
              initialValues={{
                title: q.title,
                slug: q.slug,
                statement: q.statement,
                hintsText: arrayToLines(q.hints, "hints"),
                misconceptionsText: arrayToLines(q.hints, "misconceptions"),
              }}
              validationSchema={createQuestionSchema}
              enableReinitialize
              onSubmit={async (values) => {
                try {
                  await update.mutateAsync({
                    title: values.title,
                    slug: values.slug,
                    statement: values.statement,
                    hints: buildHints(values.hintsText, values.misconceptionsText),
                  });
                  toast.success("Saved — question is a draft again until published");
                  setStep(1);
                } catch (err) {
                  toast.error(errorMessage(err, "Could not save"));
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <FormField name="title" label="Title" />
                  <FormField name="slug" label="Slug" />
                  <FormEditor name="statement" label="Statement (markdown)" slug="markdown" height={360} />
                  <FormTextArea name="hintsText" label="Hints (one per line)" rows={3} />
                  <FormTextArea name="misconceptionsText" label="Misconceptions (one per line)" rows={3} />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save & continue"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — test cases */}
      {step === 1 && (
        <>
          <TestCasesSection questionId={id} testCases={q.testCases} editable />
          <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </>
      )}

      {/* Step 3 — solutions */}
      {step === 2 && (
        <>
          <SolutionsSection questionId={id} solutions={q.solutions} editable />
          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </>
      )}

      {/* Step 4 — publish */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {q.status === QuestionStatus.generation_failed && (
              <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Publishing failed — the reference solution errored on its own inputs.
                Fix the solution or test cases, then publish again.
              </p>
            )}
            {q.status === QuestionStatus.ready && (
              <p className="rounded-md border border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/10 p-3 text-sm">
                Live. Any edit will move it back to draft and require re-publishing.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Publishing runs the reference solution against every test case. It only
              goes live if the solution succeeds.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  try {
                    await generate.mutateAsync();
                    toast.success("Publishing — running the reference solution…");
                  } catch (err) {
                    toast.error(errorMessage(err, "Could not publish"));
                  }
                }}
                disabled={generate.isPending || generating}
              >
                <FiPlay /> {generating ? "Publishing…" : "Generate & publish"}
              </Button>
              {q.status !== QuestionStatus.draft && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await unpublish.mutateAsync();
                      toast.success("Reverted to draft");
                    } catch (err) {
                      toast.error(errorMessage(err, "Could not unpublish"));
                    }
                  }}
                  disabled={unpublish.isPending}
                >
                  <FiRotateCcw /> Unpublish
                </Button>
              )}
              <Button
                variant="destructive"
                className="ml-auto"
                onClick={async () => {
                  if (!window.confirm("Delete this question permanently?")) return;
                  try {
                    await remove.mutateAsync(id);
                    toast.success("Question deleted");
                    router.push(ROUTES.adminQuestions);
                  } catch (err) {
                    toast.error(errorMessage(err, "Could not delete"));
                  }
                }}
                disabled={remove.isPending}
              >
                <FiTrash2 /> Delete question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepNav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onNext}>Next</Button>
    </div>
  );
}

EditQuestionPage.getLayout = (page: ReactElement) => withAdminLayout(page);
