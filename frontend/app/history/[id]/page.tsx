"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import TripResult from "@/components/TripResult";
import type { TripData } from "@/app/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip]     = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/trips/${id}`);
        if (!res.ok) throw new Error("Trip tidak ditemukan.");
        const data: TripData = await res.json();
        setTrip(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      <main className="flex-1 w-full px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-2xl">

          {/* Back link */}
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition"
          >
            ← Kembali ke History
          </Link>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              <div className="skeleton h-32 rounded-2xl" />
              <div className="skeleton h-48 rounded-2xl" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-red-700 font-semibold">{error}</p>
              <Link href="/history" className="mt-3 inline-block text-sm text-red-500 underline">
                Kembali ke History
              </Link>
            </div>
          )}

          {/* Result */}
          {!loading && trip && (
            <TripResult
              trip={trip}
              onReset={() => window.location.href = "/history"}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
