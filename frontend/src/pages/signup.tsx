import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { useRegisterAPI } from "@lecode/api/auth";
import { registerSchema, type RegisterValues } from "@lecode/validations/auth";
import { useAuth } from "@lecode/lib/auth/AuthContext";
import { errorMessage } from "@lecode/lib/axios";
import { ROUTES } from "@lecode/constants";
import { AuthCard } from "@lecode/components/common/AuthCard";
import { FormField } from "@lecode/components/common/FormField";
import { Button } from "@lecode/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const { setSession, isAuthenticated, ready } = useAuth();
  const register = useRegisterAPI();

  useEffect(() => {
    if (ready && isAuthenticated) router.replace(ROUTES.problems);
  }, [ready, isAuthenticated, router]);

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start solving in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href={ROUTES.login} className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Formik<RegisterValues>
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={registerSchema}
        onSubmit={async (values) => {
          try {
            setSession(await register.mutateAsync(values));
            router.replace(ROUTES.problems);
          } catch (err) {
            toast.error(errorMessage(err, "Could not sign up"));
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField name="name" label="Name" autoComplete="name" />
            <FormField name="email" label="Email" type="email" autoComplete="email" />
            <FormField
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Sign up"}
            </Button>
          </Form>
        )}
      </Formik>
    </AuthCard>
  );
}
