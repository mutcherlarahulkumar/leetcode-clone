import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { useCreateQuestion } from "@lecode/api/admin/questions";
import {
  createQuestionSchema,
  type CreateQuestionValues,
} from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { buildHints } from "@lecode/lib/hints";
import { ROUTES } from "@lecode/constants";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { FormField } from "@lecode/components/common/FormField";
import { FormEditor } from "@lecode/components/common/FormEditor";
import { FormTextArea } from "@lecode/components/common/FormTextArea";
import { Button } from "@lecode/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@lecode/components/ui/card";

type NewQuestionForm = CreateQuestionValues & {
  hintsText: string;
  misconceptionsText: string;
};

export default function NewQuestionPage() {
  const router = useRouter();
  const create = useCreateQuestion();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">New question</h1>
      <Card>
        <CardHeader>
          <CardTitle>Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik<NewQuestionForm>
            initialValues={{ title: "", slug: "", statement: "", hintsText: "", misconceptionsText: "" }}
            validationSchema={createQuestionSchema}
            onSubmit={async (values) => {
              try {
                const q = await create.mutateAsync({
                  title: values.title,
                  slug: values.slug || undefined,
                  statement: values.statement,
                  hints: buildHints(values.hintsText, values.misconceptionsText),
                });
                toast.success("Draft created");
                router.push(ROUTES.adminQuestion(q.id));
              } catch (err) {
                toast.error(errorMessage(err, "Could not create question"));
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <FormField name="title" label="Title" placeholder="Two Sum" />
                <FormField
                  name="slug"
                  label="Slug (optional — derived from title if empty)"
                  placeholder="two-sum"
                />
                <FormEditor
                  name="statement"
                  label="Statement (markdown — supports mermaid)"
                  slug="markdown"
                  height={360}
                />
                <FormTextArea
                  name="hintsText"
                  label="Hints (one per line, optional)"
                  rows={3}
                />
                <FormTextArea
                  name="misconceptionsText"
                  label="Misconceptions (one per line, optional)"
                  rows={3}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create draft"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

NewQuestionPage.getLayout = (page: ReactElement) => withAdminLayout(page);
