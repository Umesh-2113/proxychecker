import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using a valid font from next/font/google
import "./globals.css";

// Import Inter font (can replace it with any valid font you prefer)
const inter = Inter({
  subsets: ["latin"],  // Subsets you want to include, "latin" for most cases
  variable: "--font-inter",  // CSS variable for the font
});

export const metadata: Metadata = {
  title: "Proxy Checker App",  // Updated title, feel free to adjust
  description: "A tool to check and validate proxies effectively.",  // Updated description
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // Type annotation for children prop
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}  {/* Render children components */}
      </body>
    </html>
  );
}
