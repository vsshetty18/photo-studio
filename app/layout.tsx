/**
 * app/layout.tsx
 * -----------------
 * Root layout required by Next.js App Router.
 * Wraps every page (we only have one: page.tsx) and pulls in global CSS.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photo Studio - Face Search",
  description: "Scan a customer's face and find their photos for printing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
