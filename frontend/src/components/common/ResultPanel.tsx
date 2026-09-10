import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { isPending, STATUS_LABEL } from "@lecode/constants";
import { SubmissionStatus, TestCaseKind, type SubmissionDetail } from "@lecode/types";
import { StatusBadge } from "@lecode/components/common/StatusBadge";
import { cn } from "@lecode/lib/utils";

const Mono = ({ children }: { children: string }) => (
  <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-xs">
    {children === "" ? "(empty)" : children}
  </pre>
);

export function ResultPanel({
  submission,
  isFetching,
}: {
  submission: SubmissionDetail | undefined;
  isFetching: boolean;
}) {
  if (!submission) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Run your code to see results here.
      </div>
    );
  }

  if (isPending(submission.status)) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <FiLoader className="animate-spin" /> Judging…
      </div>
    );
  }

  const accepted = submission.status === SubmissionStatus.accepted;
  const cases = submission.results?.cases ?? [];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <StatusBadge status={submission.status} />
        <span className="text-sm text-muted-foreground">
          {submission.passed_count}/{submission.total_count} passed
        </span>
        {submission.results?.totalMs != null && (
          <span className="ml-auto text-xs text-muted-foreground">
            {submission.results.totalMs} ms
          </span>
        )}
        {isFetching && <FiLoader className="animate-spin text-muted-foreground" />}
      </div>

      {/* compile / judge errors have no per-case detail, just the message */}
      {submission.status === SubmissionStatus.compile_error && submission.output && (
        <div>
          <p className="mb-1 text-sm font-medium">{STATUS_LABEL[submission.status]}</p>
          <Mono>{submission.output}</Mono>
        </div>
      )}

      <div className="space-y-3">
        {cases.map((c, i) => {
          const ok = c.status === SubmissionStatus.accepted;
          return (
            <div key={c.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                {ok ? (
                  <FiCheckCircle className="text-[hsl(var(--success))]" />
                ) : (
                  <FiXCircle className="text-destructive" />
                )}
                <span>
                  {c.kind === TestCaseKind.sample ? `Sample ${i + 1}` : `Hidden case ${i + 1}`}
                </span>
                <span className={cn("ml-auto text-xs", ok ? "text-[hsl(var(--success))]" : "text-destructive")}>
                  {STATUS_LABEL[c.status]}
                </span>
              </div>

              {/* only sample cases carry input/expected/actual */}
              {c.kind === TestCaseKind.sample && (
                <div className="mt-2 grid gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Input</p>
                    <Mono>{c.input ?? ""}</Mono>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Expected</p>
                      <Mono>{c.expected ?? ""}</Mono>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Your output</p>
                      <Mono>{c.actual ?? ""}</Mono>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {accepted && (
        <p className="text-center text-sm font-medium text-[hsl(var(--success))]">
          All tests passed 🎉
        </p>
      )}
    </div>
  );
}
