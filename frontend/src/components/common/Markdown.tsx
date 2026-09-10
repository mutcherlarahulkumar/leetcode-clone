import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "@lecode/components/common/Mermaid";

// Tailwind-styled markdown (no typography plugin needed). ```mermaid fences are
// rendered as diagrams; every other fence is a normal code block.
const components: Components = {
  h1: ({ children }) => <h1 className="mt-4 text-xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-4 text-lg font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-3 font-semibold">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal pl-6">{children}</ol>,
  li: ({ children }) => <li className="my-1">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} className="text-primary hover:underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const text = String(children).replace(/\n$/, "");
    if (className === "language-mermaid") return <Mermaid chart={text} />;
    if (className) {
      // fenced block
      return (
        <pre className="my-3 overflow-auto rounded bg-muted p-3 font-mono text-xs">
          <code>{text}</code>
        </pre>
      );
    }
    // inline code
    return <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{text}</code>;
  },
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
