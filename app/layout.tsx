import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import FloatingNavbar from '@/components/FloatingNavbar';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'CoderNautics',
  description: 'Find and Share Code Solutions',
};

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
        <ConvexClientProvider>
          <AuthProvider>
            <FloatingNavbar />
            <main className="w-full min-h-screen pt-24 bg-transparent">
              {children}
            </main>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
