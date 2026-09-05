"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";
import TripForm from "@/components/TripForm";
import TripResult from "@/components/TripResult";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Stats {
  total_trips: number;
  total_conversations: number;
  this_month_trips: number;
}

export type AppState = "idle" | "loading" | "result" | "error";

export interface TripData {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  travel_style: string | null;
  ai_recommendation: string | null;
}

export interface FormValues {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}

export default function DashboardPage() {
  const { authHeader, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({ total_trips: 0, total_conversations: 0, this_month_trips: 0 });
  const [loading, setLoading] = useState(true);

  // Trip form states
  const [appState, setAppState] = useState<AppState>("idle");
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  async function loadStats() {
    try {
      const [tripsRes, convsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/trips`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/v1/conversations`, { headers: authHeader() }),
      ]);

      if (tripsRes.status === 401 || convsRes.status === 401) {
        router.push("/login");
        return;
      }

      const trips = tripsRes.ok ? await tripsRes.json() : [];
      const convs = convsRes.ok ? await convsRes.json() : [];

      const now = new Date();
      const thisMonth = trips.filter((t: any) => {
        const created = new Date(t.created_at);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      });

      setStats({
        total_trips: trips.length,
        total_conversations: convs.length,
        this_month_trips: thisMonth.length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values: FormValues) {
    setAppState("loading");
    setErrorMsg("");
    setTripData(null);

    try {
      // Step 1: Buat trip baru
      const createRes = await fetch(`${API_BASE}/api/v1/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(values),
      });

      if (createRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal membuat rencana perjalanan.");
      }

      const created: TripData = await createRes.json();

      // Step 2: Generate rekomendasi AI
      const genRes = await fetch(
        `${API_BASE}/api/v1/trips/${created.id}/generate`,
        {
          method: "POST",
          headers: authHeader(),
        }
      );

      if (genRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal menghasilkan itinerary AI.");
      }

      const withAI: TripData = await genRes.json();
      setTripData(withAI);
      setAppState("result");
      
      // Reload stats after creating trip
      loadStats();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setAppState("error");
    }
  }

  function handleReset() {
    setAppState("idle");
    setTripData(null);
    setErrorMsg("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f7fa]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40c2fd] mx-auto mb-4"></div>
            <p className="text-[#76777d]">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#131b2e] mb-2">Dashboard</h1>
            <p className="text-[#76777d]">Selamat datang kembali, {user?.username}! 👋</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Total Trips */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#ECFEFF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00668a] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    luggage
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#76777d] bg-[#f5f7fa] px-2 py-1 rounded-full">All time</span>
              </div>
              <p className="text-3xl font-bold text-[#131b2e] mb-1">{stats.total_trips}</p>
              <p className="text-sm text-[#76777d] font-medium">Total Trips</p>
            </div>

            {/* Conversations */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF4E6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#FF9800] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#76777d] bg-[#f5f7fa] px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-3xl font-bold text-[#131b2e] mb-1">{stats.total_conversations}</p>
              <p className="text-sm text-[#76777d] font-medium">Conversations</p>
            </div>

            {/* This Month */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#9333EA] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    trending_up
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#76777d] bg-[#f5f7fa] px-2 py-1 rounded-full">This month</span>
              </div>
              <p className="text-3xl font-bold text-[#131b2e] mb-1">{stats.this_month_trips}</p>
              <p className="text-sm text-[#76777d] font-medium">New Trips</p>
            </div>
          </div>

          {/* Trip Planner Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00668a] to-[#40c2fd] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  add_location_alt
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#131b2e]">Rencanakan Trip Baru</h2>
                <p className="text-sm text-[#76777d]">Buat itinerary perjalanan dengan AI assistant</p>
              </div>
            </div>

            {/* Form or Result */}
            {appState !== "result" && (
              <TripForm onSubmit={handleSubmit} isLoading={appState === "loading"} />
            )}

            {/* Error Banner */}
            {appState === "error" && (
              <div className="mt-6 animate-slide-up rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <span className="text-red-500 text-lg mt-0.5">⚠</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">Oops, ada yang salah!</p>
                  <p className="text-sm text-red-600 mt-0.5">{errorMsg}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-2 shrink-0"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Result */}
            {appState === "result" && tripData && (
              <TripResult trip={tripData} onReset={handleReset} />
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-[#131b2e] mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/assistant")}
                className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] p-6 hover:shadow-md transition text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ECFEFF] flex items-center justify-center group-hover:scale-110 transition">
                    <span className="material-symbols-outlined text-[#00668a] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#131b2e] mb-1">AI Assistant</h3>
                    <p className="text-xs text-[#76777d]">Tanya AI tentang destinasi wisata</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/history")}
                className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] p-6 hover:shadow-md transition text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF4E6] flex items-center justify-center group-hover:scale-110 transition">
                    <span className="material-symbols-outlined text-[#FF9800] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      history
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#131b2e] mb-1">My Trips</h3>
                    <p className="text-xs text-[#76777d]">Lihat riwayat perjalanan Anda</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
