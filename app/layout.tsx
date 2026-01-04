import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Poll Maker - Create & Share Polls",
  description: "The easiest way to create and share polls instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-100 via-background to-background dark:from-sky-950 dark:via-background dark:to-background overflow-x-hidden selection:bg-primary/20`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
          <div className="fixed bottom-6 right-6 z-50">
            <ModeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
