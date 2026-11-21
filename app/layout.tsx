import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Roster Management System",
  description: "D2C workforce allocation, brand coverage, and conflict telemetry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
