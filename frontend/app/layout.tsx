import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KelanaAI — Rencanakan Perjalananmu dengan AI",
  description:
    "KelanaAI membantu kamu membuat itinerary perjalanan harian yang tersusun rapi sesuai anggaran, ditenagai oleh Amazon Bedrock.",
  keywords: ["travel planner", "AI itinerary", "kelana ai", "rencana perjalanan"],
  authors: [{ name: "Ishak Halawa" }],
  openGraph: {
    title: "KelanaAI — Rencanakan Perjalananmu dengan AI",
    description: "Itinerary harian yang tersusun rapi, sesuai anggaran, ditenagai AI.",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
