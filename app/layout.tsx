import { Inter } from "next/font/google";
import { DataInitializer } from "@/components/DataInitializer";

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light scheme-only-dark">
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <DataInitializer>
          {children}
        </DataInitializer>
      </body>
    </html>
  );
}
