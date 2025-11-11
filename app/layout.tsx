import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Platform - Play, Learn, Analyze",
  description: "Comprehensive online chess platform with live games, daily games, tactical puzzles, and performance analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}
