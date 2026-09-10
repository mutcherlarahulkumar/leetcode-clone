import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { useLoginAPI } from "@lecode/api/auth";
import { loginSchema, type LoginValues } from "@lecode/validations/auth";
import { useAuth } from "@lecode/lib/auth/AuthContext";
import { errorMessage } from "@lecode/lib/axios";
import { ROUTES } from "@lecode/constants";
import { AuthCard } from "@lecode/components/common/AuthCard";
import { FormField } from "@lecode/components/common/FormField";
import { Button } from "@lecode/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const login = useLoginAPI();

  const next = typeof router.query.next === "string" ? router.query.next : ROUTES.problems;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to keep solving."
      footer={
        <>
          New here?{" "}
          <Link href={ROUTES.signup} className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Formik<LoginValues>
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values) => {
          try {
            setSession(await login.mutateAsync(values));
            router.replace(next);
          } catch (err) {
            toast.error(errorMessage(err, "Could not log in"));
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField name="email" label="Email" type="email" autoComplete="email" />
            <FormField
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in…" : "Log in"}
            </Button>
          </Form>
        )}
      </Formik>
    </AuthCard>
  );
}
