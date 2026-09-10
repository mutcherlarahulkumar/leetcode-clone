import { useEffect } from "react";
import { useRouter } from "next/router";
import { ROUTES } from "@lecode/constants";

export default function AdminHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.adminQuestions);
  }, [router]);
  return null;
}
