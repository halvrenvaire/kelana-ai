"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00668a] via-[#40c2fd] to-[#00B4D8] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              flight_takeoff
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">KelanaAI</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold text-white hover:text-white/80 transition"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-white text-[#00668a] rounded-xl text-sm font-bold hover:bg-white/90 transition shadow-lg"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span className="text-sm font-semibold text-white">Powered by AWS Bedrock AI</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Rencanakan Perjalanan
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              dengan AI
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            KelanaAI membantu Anda merencanakan liburan impian dengan rekomendasi destinasi, 
            itinerary, dan budget yang dipersonalisasi menggunakan teknologi AI terdepan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-[#00668a] rounded-xl text-lg font-bold hover:bg-white/90 transition shadow-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                rocket_launch
              </span>
              Mulai Sekarang Gratis
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl text-lg font-semibold hover:bg-white/20 transition border border-white/30 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined">info</span>
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          {/* Feature 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Assistant</h3>
            <p className="text-white/80 leading-relaxed">
              Tanya AI tentang destinasi wisata, tips perjalanan, dan rekomendasi berdasarkan knowledge base travel terpercaya.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                route
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Itinerary Cerdas</h3>
            <p className="text-white/80 leading-relaxed">
              Generate itinerary harian lengkap dengan estimasi budget, aktivitas, dan rekomendasi tempat wisata yang disesuaikan.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                savings
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Budget Planner</h3>
            <p className="text-white/80 leading-relaxed">
              Kelola budget perjalanan dengan smart calculator yang membantu Anda travel sesuai kantong tanpa mengorbankan pengalaman.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-5xl font-black text-white mb-2">500+</p>
            <p className="text-white/80 font-medium">Destinasi Wisata</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-black text-white mb-2">1000+</p>
            <p className="text-white/80 font-medium">Trip Direncanakan</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-black text-white mb-2">24/7</p>
            <p className="text-white/80 font-medium">AI Assistant</p>
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="mt-24 text-center bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Siap Menjelajah Dunia?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan mulai rencanakan perjalanan impian Anda dengan bantuan AI.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#00668a] rounded-xl text-lg font-bold hover:bg-white/90 transition shadow-2xl"
          >
            Daftar Gratis
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            © 2026 KelanaAI. Powered by AWS Bedrock. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
