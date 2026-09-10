import type { QuestionDetail } from "@lecode/types";
import { Markdown } from "@lecode/components/common/Markdown";

export function StatementView({ question }: { question: QuestionDetail }) {
  return (
    <article className="space-y-6">
      <h1 className="text-xl font-bold">{question.title}</h1>

      <Markdown>{question.statement}</Markdown>

      {question.samples.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Examples
          </h2>
          {question.samples.map((s, i) => (
            <div key={s.id} className="rounded-md border p-3">
              <p className="mb-2 text-sm font-medium">Example {i + 1}</p>
              <div className="space-y-2">
                <SampleBlock label="Input" value={s.input} />
                <SampleBlock label="Output" value={s.expected_output} />
                {s.explanation && <SampleBlock label="Explanation" value={s.explanation} />}
              </div>
            </div>
          ))}
        </section>
      )}
    </article>
  );
}

function SampleBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <pre className="mt-1 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-xs">
        {value}
      </pre>
    </div>
  );
}
