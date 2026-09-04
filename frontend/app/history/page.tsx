"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import TripCard from "@/components/TripCard";
import { useAuth } from "@/context/AuthContext";
import type { TripData } from "@/app/page";

const API_BASE   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE  = 9;

type FetchState = "loading" | "ok" | "error";

export default function HistoryPage() {
  const { authHeader, user } = useAuth();
  const router               = useRouter();

  const [trips, setTrips]   = useState<TripData[]>([]);
  const [status, setStatus] = useState<FetchState>("loading");
  const [page, setPage]     = useState(1);

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`${API_BASE}/api/v1/trips`, { headers: authHeader() });
        if (res.status === 401) { router.push("/login"); return; }
        if (!res.ok) throw new Error();
        const data: TripData[] = await res.json();
        setTrips(data.slice().reverse());
        setStatus("ok");
      } catch { setStatus("error"); }
    }
    if (user) load();
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));
  const paginated  = trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Page Header */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-0">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] tracking-tight mb-2">
          Your Trip History
        </h1>
        <p className="text-base text-[#45464d] max-w-2xl">
          Review your past explorations, AI-generated itineraries, and travel expenses.
          {user && <span className="text-[#00668a] font-medium"> @{user.username}</span>}
        </p>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Loading */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Big skeleton */}
            <div className="md:col-span-8 shimmer h-64 rounded-2xl" />
            <div className="md:col-span-4 shimmer h-64 rounded-2xl" />
            {[1,2,3].map((i) => <div key={i} className="md:col-span-4 shimmer h-48 rounded-2xl" />)}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">⚠️</span>
            <h2 className="text-lg font-bold text-[#191c1e]">Gagal memuat data</h2>
            <p className="text-sm text-[#45464d] mt-1 mb-6">Pastikan backend berjalan di <code className="bg-[#eceef0] px-1.5 py-0.5 rounded text-xs">localhost:8000</code></p>
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-[#00668a] text-white text-sm font-semibold hover:bg-[#004d6a] transition">
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "ok" && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🧳</span>
            <h2 className="text-lg font-bold text-[#191c1e]">Belum ada perjalanan</h2>
            <p className="text-sm text-[#45464d] mt-1 mb-6">Buat rencana perjalanan pertamamu sekarang!</p>
            <a href="/" className="px-5 py-2.5 rounded-xl ai-gradient text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Buat Perjalanan
            </a>
          </div>
        )}

        {/* Trips — Bento Grid */}
        {status === "ok" && trips.length > 0 && (
          <>
            {/* Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#45464d]">
                <span className="font-semibold text-[#191c1e]">{trips.length}</span> perjalanan ditemukan
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-[#76777d]">Halaman {page} dari {totalPages}</p>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.map((trip, i) => (
                <div key={trip.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#45464d] hover:bg-[#eceef0] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-full text-sm font-semibold transition
                        ${page === p
                          ? "bg-[#131b2e] text-white shadow-sm"
                          : "text-[#191c1e] hover:bg-[#eceef0]"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#45464d] hover:bg-[#eceef0] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
