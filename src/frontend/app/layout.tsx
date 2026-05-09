import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";
import { ThemeController } from "@/components/ThemeController";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UDL Hearing Support Platform",
  description: "Trợ năng phụ đề và tóm tắt bài giảng theo thời gian thực",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable} antialiased h-full`}
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
