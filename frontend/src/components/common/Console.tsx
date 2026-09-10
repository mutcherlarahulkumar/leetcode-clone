import { FiCheckCircle, FiLoader, FiXCircle } from "react-icons/fi";
import { SubmissionStatus, type RunResult, type SampleCase, type SubmissionDetail } from "@lecode/types";
import { STATUS_LABEL, isPending } from "@lecode/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lecode/components/ui/tabs";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { ResultPanel } from "@lecode/components/common/ResultPanel";
import { cn } from "@lecode/lib/utils";

const Block = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-xs">
      {value === "" ? "(empty)" : value}
    </pre>
  </div>
);

export function Console({
  tab,
  onTabChange,
  samples,
  lastAction,
  runResult,
  isRunning,
  submission,
}: {
  tab: string;
  onTabChange: (v: string) => void;
  samples: SampleCase[];
  lastAction: "run" | "submit" | null;
  runResult: RunResult | undefined;
  isRunning: boolean;
  submission: SubmissionDetail | undefined;
}) {
  return (
    <Tabs value={tab} onValueChange={onTabChange} className="flex h-full flex-col">
      <TabsList className="m-2 w-fit">
        <TabsTrigger value="testcase">Testcase</TabsTrigger>
        <TabsTrigger value="result">Result</TabsTrigger>
      </TabsList>

      <TabsContent value="testcase" className="min-h-0 flex-1 overflow-auto p-4 pt-0">
        {samples.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sample cases.</p>
        ) : (
          <div className="space-y-3">
            {samples.map((s, i) => (
              <div key={s.id} className="rounded-md border p-3">
                <p className="mb-2 text-sm font-medium">Case {i + 1}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Block label="Input" value={s.input} />
                  <Block label="Expected" value={s.expected_output} />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="result" className="min-h-0 flex-1 overflow-auto">
        {isRunning ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <FiLoader className="animate-spin" /> Running…
          </div>
        ) : lastAction === "submit" ? (
          <ResultPanel
            submission={submission}
            isFetching={!!submission && isPending(submission.status)}
          />
        ) : lastAction === "run" && runResult ? (
          <RunResultView result={runResult} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Run or submit to see results.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function RunResultView({ result }: { result: RunResult }) {
  if (!result.compiled) {
    return (
      <div className="space-y-2 p-4">
        <StatusBadge status={SubmissionStatus.compile_error} />
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-xs">
          {result.compileOutput}
        </pre>
      </div>
    );
  }
  const passed = result.cases.filter((c) => c.status === SubmissionStatus.accepted).length;
  const allOk = passed === result.cases.length;
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold",
            allOk ? "text-[hsl(var(--success))]" : "text-destructive",
          )}
        >
          {allOk ? <FiCheckCircle /> : <FiXCircle />}
          {allOk ? "All samples passed" : "Sample failed"}
        </span>
        <span className="text-sm text-muted-foreground">
          {passed}/{result.cases.length} passed
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{result.totalMs} ms</span>
      </div>
      {result.cases.map((c, i) => {
        const ok = c.status === SubmissionStatus.accepted;
        return (
          <div key={c.id} className="rounded-md border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              {ok ? (
                <FiCheckCircle className="text-[hsl(var(--success))]" />
              ) : (
                <FiXCircle className="text-destructive" />
              )}
              Case {i + 1}
              <span className={cn("ml-auto text-xs", ok ? "text-[hsl(var(--success))]" : "text-destructive")}>
                {STATUS_LABEL[c.status]}
              </span>
            </div>
            <div className="space-y-2">
              <Block label="Input" value={c.input} />
              <div className="grid grid-cols-2 gap-2">
                <Block label="Expected" value={c.expected} />
                <Block label="Your output" value={c.actual} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
