import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "proov.to",
  description: "Production. Priced by you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-sm text-zinc-900 dark:text-zinc-100 font-sans font-normal bg-white dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}
