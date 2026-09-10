import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import {
  FiPlay,
  FiSend,
  FiRotateCcw,
  FiAlignLeft,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { useQuestion } from "@lecode/api/questions";
import { useLanguages } from "@lecode/api/languages";
import {
  useCreateSubmission,
  useSubmission,
  useMySubmissions,
  useRunSolution,
} from "@lecode/api/submissions";
import { useAuth } from "@lecode/lib/auth/AuthContext";
import { errorMessage } from "@lecode/lib/axios";
import { ROUTES, BOILERPLATE, LANG_SLUG } from "@lecode/constants";
import { Navbar } from "@lecode/components/common/Navbar";
import { CodeEditor, type MonacoEditor } from "@lecode/components/common/CodeEditor";
import { Console } from "@lecode/components/common/Console";
import { StatementView } from "@lecode/components/common/StatementView";
import { HintsView } from "@lecode/components/common/HintsView";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { LanguageIcon } from "@lecode/components/common/LanguageIcon";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@lecode/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lecode/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lecode/components/ui/select";
import { Button } from "@lecode/components/ui/button";
import { Skeleton } from "@lecode/components/ui/skeleton";

const isReplaceable = (code: string) =>
  code.trim() === "" ||
  Object.values(BOILERPLATE).some((b) => b.trim() === code.trim());

const MIN_FONT = 11;
const MAX_FONT = 22;

export default function SolvePage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { isAuthenticated } = useAuth();

  const question = useQuestion(id);
  const languages = useLanguages();
  const create = useCreateSubmission();
  const run = useRunSolution();

  const [languageID, setLanguageID] = useState("");
  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [submissionId, setSubmissionId] = useState<string>();
  const [lastAction, setLastAction] = useState<"run" | "submit" | null>(null);
  const [consoleTab, setConsoleTab] = useState("testcase");
  const editorRef = useRef<MonacoEditor | null>(null);

  const enabled = useMemo(
    () => (languages.data ?? []).filter((l) => l.is_enabled),
    [languages.data],
  );
  const selected = enabled.find((l) => l.id === languageID);
  const slug = selected ? LANG_SLUG[selected.name] : undefined;

  useEffect(() => {
    if (!languageID && enabled.length > 0) setLanguageID(enabled[0]!.id);
  }, [enabled, languageID]);

  useEffect(() => {
    if (!slug) return;
    const bp = BOILERPLATE[slug] ?? "";
    setCode((prev) => (isReplaceable(prev) ? bp : prev));
  }, [slug]);

  const submission = useSubmission(submissionId);
  const mySubs = useMySubmissions(isAuthenticated ? id : undefined);

  const requireLogin = () => {
    router.push(`${ROUTES.login}?next=${encodeURIComponent(router.asPath)}`);
  };

  const onRun = async () => {
    if (!id) return;
    if (!isAuthenticated) return requireLogin();
    if (!code.trim()) return toast.error("Write some code first");
    setLastAction("run");
    setConsoleTab("result");
    try {
      await run.mutateAsync({ solution: code, languageID, questionID: id });
    } catch (err) {
      toast.error(errorMessage(err, "Run failed"));
    }
  };

  const onSubmit = async () => {
    if (!id) return;
    if (!isAuthenticated) return requireLogin();
    if (!code.trim()) return toast.error("Write some code first");
    setLastAction("submit");
    setConsoleTab("result");
    try {
      const res = await create.mutateAsync({ solution: code, languageID, questionID: id });
      setSubmissionId(res.submissionID);
      mySubs.refetch();
    } catch (err) {
      toast.error(errorMessage(err, "Could not submit"));
    }
  };

  const onReset = () => {
    if (slug) setCode(BOILERPLATE[slug] ?? "");
  };
  const onFormat = () => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };
  const bumpFont = (delta: number) =>
    setFontSize((f) => Math.min(MAX_FONT, Math.max(MIN_FONT, f + delta)));

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="min-h-0 flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* left: description / submissions */}
          <ResizablePanel defaultSize={42} minSize={22}>
            <Tabs defaultValue="description" className="flex h-full flex-col">
              <TabsList className="m-2 w-fit">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="hints">Hints</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="min-h-0 flex-1 overflow-auto p-6 pt-0">
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
              </TabsContent>
              <TabsContent value="hints" className="min-h-0 flex-1 overflow-auto p-6 pt-0">
                {question.data ? (
                  <HintsView hints={question.data.hints} />
                ) : (
                  <Skeleton className="h-40 w-full" />
                )}
              </TabsContent>
              <TabsContent value="submissions" className="min-h-0 flex-1 overflow-auto p-4 pt-0">
                {!isAuthenticated ? (
                  <p className="text-sm text-muted-foreground">
                    Log in to see your submissions for this problem.
                  </p>
                ) : !mySubs.data || mySubs.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No submissions yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {mySubs.data.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                        <StatusBadge status={s.status} />
                        <span className="text-muted-foreground">{s.language}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {s.passed_count}/{s.total_count} · {new Date(s.created_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* right: editor + console */}
          <ResizablePanel defaultSize={58} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={62} minSize={20}>
                <div className="flex h-full flex-col">
                  {/* toolbar */}
                  <div className="flex items-center gap-1 border-b p-2">
                    <Select value={languageID} onValueChange={setLanguageID}>
                      <SelectTrigger className="h-8 w-40">
                        {selected ? (
                          <span className="flex items-center gap-2">
                            <LanguageIcon slug={slug} className="h-4 w-4" />
                            {selected.name}
                          </span>
                        ) : (
                          <SelectValue placeholder="Language" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {enabled.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            <span className="flex items-center gap-2">
                              <LanguageIcon slug={LANG_SLUG[l.name]} className="h-4 w-4" />
                              {l.name} {l.version}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="ml-auto flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Decrease font" onClick={() => bumpFont(-1)}>
                        <FiZoomOut />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Increase font" onClick={() => bumpFont(1)}>
                        <FiZoomIn />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Format code" onClick={onFormat}>
                        <FiAlignLeft />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Reset to boilerplate" onClick={onReset}>
                        <FiRotateCcw />
                      </Button>
                    </div>
                  </div>
                  {/* editor */}
                  <div className="min-h-0 flex-1">
                    <CodeEditor
                      slug={slug}
                      value={code}
                      onChange={setCode}
                      fontSize={fontSize}
                      onEditorMount={(e) => (editorRef.current = e)}
                    />
                  </div>
                  {/* actions */}
                  <div className="flex items-center gap-2 border-t p-2">
                    <Button variant="secondary" size="sm" className="ml-auto" onClick={onRun} disabled={run.isPending}>
                      <FiPlay /> {run.isPending ? "Running…" : "Run"}
                    </Button>
                    <Button size="sm" onClick={onSubmit} disabled={create.isPending}>
                      <FiSend /> {create.isPending ? "Submitting…" : "Submit"}
                    </Button>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={38} minSize={12}>
                <Console
                  tab={consoleTab}
                  onTabChange={setConsoleTab}
                  samples={question.data?.samples ?? []}
                  lastAction={lastAction}
                  runResult={run.data}
                  isRunning={run.isPending}
                  submission={submission.data}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
