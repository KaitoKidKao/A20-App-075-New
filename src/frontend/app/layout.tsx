import type { Metadata } from "next";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";
import { ThemeController } from "@/components/ThemeController";

export const metadata: Metadata = {
  title: "UDL Hearing Support Platform",
  description: "Realtime captions, summaries, and visual learning support for accessible lectures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="antialiased h-full"
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col font-sans overflow-x-hidden">
        <ThemeController />
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
