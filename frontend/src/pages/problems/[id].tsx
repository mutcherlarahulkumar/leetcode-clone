import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { FiPlay } from "react-icons/fi";
import { useQuestion } from "@lecode/api/questions";
import { useLanguages } from "@lecode/api/languages";
import { useCreateSubmission, useSubmission } from "@lecode/api/submissions";
import { useAuth } from "@lecode/lib/auth/AuthContext";
import { errorMessage } from "@lecode/lib/axios";
import { ROUTES } from "@lecode/constants";
import { Navbar } from "@lecode/components/common/Navbar";
import { CodeEditor } from "@lecode/components/common/CodeEditor";
import { ResultPanel } from "@lecode/components/common/ResultPanel";
import { StatementView } from "@lecode/components/common/StatementView";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@lecode/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lecode/components/ui/select";
import { Button } from "@lecode/components/ui/button";
import { Skeleton } from "@lecode/components/ui/skeleton";

export default function SolvePage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { isAuthenticated } = useAuth();

  const question = useQuestion(id);
  const languages = useLanguages();
  const create = useCreateSubmission();

  const [languageID, setLanguageID] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [submissionId, setSubmissionId] = useState<string>();

  const enabled = useMemo(
    () => (languages.data ?? []).filter((l) => l.is_enabled),
    [languages.data],
  );
  const slug = enabled.find((l) => l.id === languageID);

  // default to the first enabled language once they load
  useEffect(() => {
    if (!languageID && enabled.length > 0) setLanguageID(enabled[0]!.id);
  }, [enabled, languageID]);

  const submission = useSubmission(submissionId);

  const onSubmit = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      router.push(`${ROUTES.login}?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (!code.trim()) {
      toast.error("Write some code first");
      return;
    }
    if (!languageID) {
      toast.error("Pick a language");
      return;
    }
    try {
      const res = await create.mutateAsync({ solution: code, languageID, questionID: id });
      setSubmissionId(res.submissionID);
    } catch (err) {
      toast.error(errorMessage(err, "Could not submit"));
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="min-h-0 flex-1">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={45} minSize={25}>
            <div className="h-full overflow-auto p-6">
              {question.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : question.isError || !question.data ? (
                <p className="text-sm text-destructive">Problem not found.</p>
              ) : (
                <StatementView question={question.data} />
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={55} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={65} minSize={20}>
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 border-b p-2">
                    <Select value={languageID} onValueChange={setLanguageID}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {enabled.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name} {l.version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={onSubmit}
                      disabled={create.isPending}
                    >
                      <FiPlay /> {create.isPending ? "Submitting…" : "Submit"}
                    </Button>
                  </div>
                  <div className="min-h-0 flex-1">
                    <CodeEditor slug={slug?.name ? slugFor(slug.name) : undefined} value={code} onChange={setCode} />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={35} minSize={15}>
                <div className="h-full overflow-auto">
                  <ResultPanel submission={submission.data} isFetching={submission.isFetching} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

// The languages list exposes name/version but not the slug (a worker detail),
// while Monaco keys on the slug. Map the display name back to a slug for
// highlighting; unknown names fall back to plaintext in the editor.
function slugFor(name: string): string | undefined {
  const map: Record<string, string> = { "C++": "cpp", TypeScript: "ts", Go: "go" };
  return map[name];
}
