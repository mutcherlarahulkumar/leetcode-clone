import { Markdown } from "@lecode/components/common/Markdown";

// hints is free-form jsonb; by convention it holds { hints: string[],
// misconceptions: string[] }. Anything missing is simply not shown.
const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {items.map((item, i) => (
        <div key={i} className="rounded-md border p-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">#{i + 1}</div>
          <Markdown>{item}</Markdown>
        </div>
      ))}
    </section>
  );
}

export function HintsView({ hints }: { hints: Record<string, unknown> | null }) {
  const tips = asStringArray(hints?.hints);
  const misconceptions = asStringArray(hints?.misconceptions);

  if (tips.length === 0 && misconceptions.length === 0) {
    return <p className="text-sm text-muted-foreground">No hints for this problem.</p>;
  }

  return (
    <div className="space-y-6">
      {tips.length > 0 && <Section title="Hints" items={tips} />}
      {misconceptions.length > 0 && (
        <Section title="Common misconceptions" items={misconceptions} />
      )}
    </div>
  );
}
