

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { ToastContainer } from 'react-toastify';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "JobMatch - Find Your Dream Job",
  description: "AI-powered job matching platform connecting talented professionals with amazing opportunities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} h-screen overflow-y-scroll bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
