import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { TRPCReactProvider } from "@/trpc/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Reel: what's trending in movies", template: "%s · Reel" },
  description:
    "Discover the movies everyone is watching today, powered by TMDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <TRPCReactProvider>
          <SiteHeader />
          <main>{children}</main>
          <footer className="mx-auto max-w-7xl px-4 py-10 text-xs text-muted-foreground sm:px-6">
            Data from{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified
            by TMDB.
          </footer>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
