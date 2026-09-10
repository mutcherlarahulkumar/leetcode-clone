import { useEffect } from "react";
import { useRouter } from "next/router";
import { ROUTES } from "@lecode/constants";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.problems);
  }, [router]);
  return null;
}
