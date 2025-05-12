import { Analytics } from "@vercel/analytics/next"; // ✅ Import the Analytics component
import type { Metadata } from "next";
import "./globals.css";  // Path to your global styles
import { inter } from "./inter";  // Your inter font setup

export const metadata: Metadata = {
  title: "Proxy Checker App",
  description: "A tool to check and validate proxies effectively.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Analytics />  {/* ✅ Add the Analytics component */}
      </body>
    </html>
  );
}
