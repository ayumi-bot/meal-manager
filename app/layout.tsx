import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "食事管理アプリ",
  description: "カロリー・栄養・食費を管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
