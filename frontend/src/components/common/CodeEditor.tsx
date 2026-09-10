import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

// Maps a language slug to a Monaco language id. Unknown slugs fall back to
// plaintext so a newly-added language still edits, just without highlighting.
const MONACO_LANG: Record<string, string> = {
  cpp: "cpp",
  ts: "typescript",
  go: "go",
};

export function CodeEditor({
  slug,
  value,
  onChange,
}: {
  slug: string | undefined;
  value: string;
  onChange: (value: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <Editor
      height="100%"
      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
      language={slug ? (MONACO_LANG[slug] ?? "plaintext") : "plaintext"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
}
