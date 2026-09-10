import type { ReactElement } from "react";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { useLanguages } from "@lecode/api/languages";
import { useCreateLanguage, useUpdateLanguage } from "@lecode/api/admin/languages";
import { languageSchema, type LanguageValues } from "@lecode/validations/admin";
import { errorMessage } from "@lecode/lib/axios";
import { withAdminLayout } from "@lecode/lib/layouts/AdminLayout";
import { FormField } from "@lecode/components/common/FormField";
import { Button } from "@lecode/components/ui/button";
import { Badge } from "@lecode/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lecode/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lecode/components/ui/table";

export default function AdminLanguagesPage() {
  const languages = useLanguages();
  const create = useCreateLanguage();
  const update = useUpdateLanguage();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Languages</h1>

      <Card>
        <CardHeader>
          <CardTitle>Registered languages</CardTitle>
          <CardDescription>
            A new language is created disabled. Add its worker image by hand, then
            enable it here — enabling alone does not make it runnable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(languages.data ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground">{l.version}</TableCell>
                  <TableCell>
                    <Badge variant={l.is_enabled ? "success" : "secondary"}>
                      {l.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await update.mutateAsync({ id: l.id, isEnabled: !l.is_enabled });
                        } catch (err) {
                          toast.error(errorMessage(err, "Could not update"));
                        }
                      }}
                    >
                      {l.is_enabled ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a language</CardTitle>
          <CardDescription>slug must match a worker image key.</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik<LanguageValues>
            initialValues={{ slug: "", name: "", version: "" }}
            validationSchema={languageSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await create.mutateAsync(values);
                resetForm();
                toast.success("Language created (disabled)");
              } catch (err) {
                toast.error(errorMessage(err, "Could not create language"));
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="grid gap-4 sm:grid-cols-3">
                <FormField name="slug" label="Slug" placeholder="rust" />
                <FormField name="name" label="Name" placeholder="Rust" />
                <FormField name="version" label="Version" placeholder="1.83" />
                <div className="sm:col-span-3">
                  <Button type="submit" disabled={isSubmitting}>
                    Add language
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

AdminLanguagesPage.getLayout = (page: ReactElement) => withAdminLayout(page);
