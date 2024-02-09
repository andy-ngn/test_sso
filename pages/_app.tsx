import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session?: Session }>) {
  return (
    <SessionProvider session={session}>
      <div
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Component {...pageProps} />;
      </div>
    </SessionProvider>
  );
}
