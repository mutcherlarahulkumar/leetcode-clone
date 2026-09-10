import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

// Renders a mermaid diagram on the client. mermaid touches the DOM and can't run
// during SSR, so it is imported and invoked inside an effect; on a parse error
// the raw source is shown rather than crashing the page.
export function Mermaid({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "strict",
        });
        const { svg: out } = await mermaid.render(`m${rawId}`, chart);
        if (!cancelled) {
          setSvg(out);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, rawId]);

  if (failed) {
    return (
      <pre className="overflow-auto rounded bg-muted p-3 font-mono text-xs">{chart}</pre>
    );
  }
  return (
    <div
      className="my-4 flex justify-center"
      // svg is produced by mermaid from our own admin-authored statement
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
