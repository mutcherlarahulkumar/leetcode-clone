import { useState, type ReactElement, type ReactNode } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { makeQueryClient } from "@lecode/lib/queryClient";
import { AuthProvider } from "@lecode/lib/auth/AuthContext";
import { cn } from "@lecode/lib/utils";
// relative, NOT the @lecode alias: Next serves global CSS reliably from a
// relative path but silently drops an aliased global CSS import in `next dev`.
import "../styles/globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Pages may declare a layout (app shell vs admin shell) via getLayout.
export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const [queryClient] = useState(makeQueryClient);
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        {/* default tab title + icon; a page can override the title with its own <Head> */}
        <title>lecode</title>
        <meta name="description" content="Practice data structures and algorithms in the browser." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <div className={cn(sans.variable, mono.variable, "font-sans antialiased")}>
            {getLayout(<Component {...pageProps} />)}
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
