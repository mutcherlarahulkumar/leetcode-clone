import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";

export type MonacoEditor = Parameters<OnMount>[0];

const MONACO_LANG: Record<string, string> = {
  cpp: "cpp",
  ts: "typescript",
  go: "go",
};

export function CodeEditor({
  slug,
  value,
  onChange,
  fontSize = 14,
  onEditorMount,
}: {
  slug: string | undefined;
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  onEditorMount?: (editor: MonacoEditor) => void;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <Editor
      height="100%"
      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
      // known slugs map to a monaco id; anything else (e.g. "markdown") passes through
      language={slug ? (MONACO_LANG[slug] ?? slug) : "plaintext"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={(editor) => onEditorMount?.(editor)}
      options={{
        minimap: { enabled: false },
        fontSize,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 12 },
      }}
    />
  );
}
