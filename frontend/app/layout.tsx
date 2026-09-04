import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KelanaAI — Plan Your Journey with AI",
  description:
    "KelanaAI creates personalized daily itineraries within your budget, powered by Amazon Bedrock.",
  keywords: ["travel planner", "AI itinerary", "kelana ai", "rencana perjalanan"],
  authors: [{ name: "Ishak Halawa" }],
  openGraph: {
    title: "KelanaAI — Plan Your Journey with AI",
    description: "Personalized itineraries within your budget, powered by AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface pt-16 md:pb-0 pb-[72px]">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
