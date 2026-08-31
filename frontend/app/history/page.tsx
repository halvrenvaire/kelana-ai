"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import TripCard from "@/components/TripCard";
import { useAuth } from "@/context/AuthContext";
import type { TripData } from "@/app/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 9;

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
        const res = await fetch(`${API_BASE}/api/v1/trips`, {
          headers: authHeader(),
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Gagal memuat data.");
        const data: TripData[] = await res.json();
        setTrips(data.slice().reverse());
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    }

    if (user) load();
  }, [user]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));
  const paginated  = trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Page header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗂️</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trip History
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base ml-12">
            {user ? `Perjalanan milik @${user.username}` : "Semua rencana perjalananmu."}
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-5xl">

          {/* Loading skeleton */}
          {status === "loading" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="skeleton h-20 rounded-none" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">⚠️</span>
              <h2 className="text-lg font-bold text-slate-800">Gagal memuat data</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Pastikan backend sedang berjalan di{" "}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">localhost:8000</code>
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Empty state */}
          {status === "ok" && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4">🧳</span>
              <h2 className="text-lg font-bold text-slate-800">Belum ada perjalanan</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Buat rencana perjalanan pertamamu sekarang!
              </p>
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
              >
                ✨ Buat Perjalanan
              </a>
            </div>
          )}

          {/* Trip grid */}
          {status === "ok" && trips.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">{trips.length}</span> perjalanan ditemukan
                </p>
                {totalPages > 1 && (
                  <p className="text-xs text-slate-400">Halaman {page} dari {totalPages}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((trip, i) => (
                  <div key={trip.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <TripCard trip={trip} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600
                      hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50
                      disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Sebelumnya
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition
                            ${page === p ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600
                      hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50
                      disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
