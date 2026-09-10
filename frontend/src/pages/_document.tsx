import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  // suppressHydrationWarning: next-themes sets the theme class on <html> before
  // React hydrates, which would otherwise flag a mismatch.
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
