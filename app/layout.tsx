"use client";
import { AuthProvider } from '@/components/AuthProvider';
import FloatingNavbar from '@/components/FloatingNavbar';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <FloatingNavbar />
          <main className="w-full min-h-screen pt-24 bg-transparent">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
