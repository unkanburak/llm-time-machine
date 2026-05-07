import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Time Machine",
  description: "1966 → 2026, sohbet ederek öğren — chat with LLMs across history.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
