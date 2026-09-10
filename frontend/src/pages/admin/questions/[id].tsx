import { useEffect, type ReactElement } from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { FiPlay, FiRotateCcw } from "react-icons/fi";
import {
  useAdminQuestion,
  useUpdateQuestion,
  useGenerateQuestion,
  useUnpublishQuestion,
} from "@lecode/api/admin/questions";
import {
  createQuestionSchema,
  type CreateQuestionValues,
} from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { QuestionStatus } from "@lecode/types";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { QuestionStatusBadge } from "@lecode/components/common/QuestionStatusBadge";
import { TestCasesSection } from "@lecode/components/admin/TestCasesSection";
import { SolutionsSection } from "@lecode/components/admin/SolutionsSection";
import { FormField } from "@lecode/components/common/FormField";
import { FormTextArea } from "@lecode/components/common/FormTextArea";
import { Button } from "@lecode/components/ui/button";
import { Skeleton } from "@lecode/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@lecode/components/ui/card";

export default function EditQuestionPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  const { data: q, isLoading, isError, refetch } = useAdminQuestion(id);
  const update = useUpdateQuestion(id ?? "");
  const generate = useGenerateQuestion(id ?? "");
  const unpublish = useUnpublishQuestion(id ?? "");

  // reflect ready/failed without a manual refresh while the worker runs
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

  const editable =
    q.status === QuestionStatus.draft || q.status === QuestionStatus.generation_failed;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{q.title}</h1>
        <QuestionStatusBadge status={q.status} />
        <div className="ml-auto flex gap-2">
          {editable && (
            <Button
              onClick={async () => {
                try {
                  await generate.mutateAsync();
                  toast.success("Generation started");
                } catch (err) {
                  toast.error(errorMessage(err, "Could not generate"));
                }
              }}
              disabled={generate.isPending}
            >
              <FiPlay /> Generate &amp; publish
            </Button>
          )}
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
        </div>
      </div>

      {q.status === QuestionStatus.generation_failed && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Generation failed — the reference solution errored on its own inputs. Fix
          the solution or test cases, then generate again.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Statement</CardTitle>
        </CardHeader>
        <CardContent>
          {editable ? (
            <Formik<CreateQuestionValues>
              initialValues={{ title: q.title, slug: q.slug, statement: q.statement }}
              validationSchema={createQuestionSchema}
              onSubmit={async (values) => {
                try {
                  await update.mutateAsync(values);
                  toast.success("Saved");
                } catch (err) {
                  toast.error(errorMessage(err, "Could not save"));
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <FormField name="title" label="Title" />
                  <FormField name="slug" label="Slug" />
                  <FormTextArea name="statement" label="Statement (markdown)" rows={12} />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save statement"}
                  </Button>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="whitespace-pre-wrap text-sm text-foreground/90">
              {q.statement}
            </div>
          )}
        </CardContent>
      </Card>

      <TestCasesSection questionId={id} testCases={q.testCases} editable={editable} />
      <SolutionsSection questionId={id} solutions={q.solutions} editable={editable} />
    </div>
  );
}

EditQuestionPage.getLayout = (page: ReactElement) => withAdminLayout(page);
