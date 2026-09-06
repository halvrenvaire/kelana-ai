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
  const { authHeader, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({ total_trips: 0, total_conversations: 0, this_month_trips: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Trip form states
  const [appState, setAppState] = useState<AppState>("idle");
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // Jangan load stats kalau masih checking auth
    if (authLoading) return;
    
    // Redirect ke login kalau belum login
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Load stats kalau udah login DAN belum pernah load
    if (!statsLoaded) {
      loadStats();
    }
  }, [user, authLoading, statsLoaded]);

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
      setStatsLoaded(true); // Mark sebagai sudah loaded
    } catch (error) {
      console.error("Failed to load stats:", error);
      setStatsLoaded(true); // Tetap mark loaded meski error biar ga infinite loop
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#faf8f5] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              flight_takeoff
            </span>
          </div>
          <p className="text-[#64748b] font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  dashboard
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#0f1419] tracking-tight">Dashboard Overview</h1>
                <p className="text-[#64748b] font-medium">KelanaAI Travel Planner</p>
              </div>
            </div>
            <p className="text-lg text-[#0f1419] font-semibold">Selamat datang kembali, <span className="text-[#0ea5e9]">{user?.username}</span>! 👋</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Total Trips */}
            <div className="bg-white rounded-3xl shadow-lg shadow-blue-100/50 border border-blue-50 p-7 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-100 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      luggage
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#64748b] bg-[#f1f5f9] px-3 py-1.5 rounded-full">All time</span>
                </div>
                <p className="text-5xl font-black text-[#0f1419] mb-2">{stats.total_trips}</p>
                <p className="text-sm text-[#64748b] font-semibold uppercase tracking-wide">Total Trips</p>
                {/* Mini graph placeholder */}
                <div className="mt-4 flex items-end gap-1 h-8">
                  {[40, 60, 45, 75, 55, 80, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-[#0ea5e9] to-[#06b6d4] rounded-t opacity-30" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Conversations */}
            <div className="bg-white rounded-3xl shadow-lg shadow-orange-100/50 border border-orange-50 p-7 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-100 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#f97316]/10 to-transparent rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      chat
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#64748b] bg-[#f1f5f9] px-3 py-1.5 rounded-full">Active</span>
                </div>
                <p className="text-5xl font-black text-[#0f1419] mb-2">{stats.total_conversations}</p>
                <p className="text-sm text-[#64748b] font-semibold uppercase tracking-wide">Conversations</p>
                {/* Activity indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#f97316] to-[#fb923c] rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-xs font-bold text-[#f97316]">60%</span>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] rounded-3xl shadow-lg shadow-purple-200/50 p-7 relative overflow-hidden text-white group hover:shadow-xl hover:shadow-purple-200 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      trending_up
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">This month</span>
                </div>
                <p className="text-5xl font-black mb-2">{stats.this_month_trips}</p>
                <p className="text-sm font-semibold uppercase tracking-wide opacity-90">New Trips</p>
                {/* Sparkline */}
                <div className="mt-4 flex items-end gap-1 h-8">
                  {[30, 50, 40, 70, 60, 55, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
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
            <h2 className="text-2xl font-black text-[#0f1419] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0ea5e9]" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              <button
                onClick={() => router.push("/assistant")}
                className="bg-white rounded-2xl shadow-lg shadow-cyan-100/50 border border-cyan-50 p-7 hover:shadow-xl hover:shadow-cyan-100 transition-all text-left group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-[#0f1419] mb-1 text-lg">AI Assistant</h3>
                    <p className="text-sm text-[#64748b] font-medium">Tanya AI tentang destinasi wisata</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/history")}
                className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 border border-orange-50 p-7 hover:shadow-xl hover:shadow-orange-100 transition-all text-left group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      history
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-[#0f1419] mb-1 text-lg">My Trips</h3>
                    <p className="text-sm text-[#64748b] font-medium">Lihat riwayat perjalanan Anda</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* My Current Trips */}
          {stats.total_trips > 0 && (
            <div>
              <h2 className="text-2xl font-black text-[#0f1419] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0ea5e9]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  explore
                </span>
                My Current Trips
              </h2>
              <div className="grid md:grid-cols-3 gap-5">
                {/* Trip Card Example - These would be loaded from API */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-2xl font-black">Bali</p>
                      <p className="text-sm opacity-90">Indonesia</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#64748b] bg-[#f1f5f9] px-3 py-1 rounded-full">5 Days</span>
                      <span className="text-sm font-bold text-[#0ea5e9]">Rp 5.000.000</span>
                    </div>
                    <p className="text-xs text-[#64748b]">Beach & Culture</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-[#f97316] to-[#fb923c] relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-2xl font-black">Tokyo</p>
                      <p className="text-sm opacity-90">Japan</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#64748b] bg-[#f1f5f9] px-3 py-1 rounded-full">7 Days</span>
                      <span className="text-sm font-bold text-[#f97316]">Rp 15.000.000</span>
                    </div>
                    <p className="text-xs text-[#64748b]">Urban Explorer</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Featured Destinations */}
          <div>
            <h2 className="text-2xl font-black text-[#0f1419] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0ea5e9]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              Featured Upcoming Destinations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Machu Picchu", country: "Peru", color: "from-[#8b5cf6] to-[#a78bfa]" },
                { name: "Santorini", country: "Greece", color: "from-[#0ea5e9] to-[#06b6d4]" },
                { name: "Iceland", country: "Europe", color: "from-[#10b981] to-[#34d399]" },
                { name: "Dubai", country: "UAE", color: "from-[#f97316] to-[#fb923c]" }
              ].map((dest, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                  <div className={`h-32 bg-gradient-to-br ${dest.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <p className="text-lg font-black">{dest.name}</p>
                      <p className="text-xs opacity-90">{dest.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
