"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Stats {
  total_trips: number;
  total_conversations: number;
}

export default function DashboardPage() {
  const { user, authHeader } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({ total_trips: 0, total_conversations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    fetchStats();
  }, [user, router]);

  async function fetchStats() {
    try {
      const [tripsRes, convsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/trips`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/v1/conversations`, { headers: authHeader() }),
      ]);

      const trips = tripsRes.ok ? await tripsRes.json() : [];
      const convs = convsRes.ok ? await convsRes.json() : [];

      setStats({
        total_trips: trips.length,
        total_conversations: convs.length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#faf8f5]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0ea5e9] mx-auto mb-4"></div>
            <p className="text-[#64748b]">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-[#0f1419] mb-2">Dashboard</h1>
            <p className="text-lg text-[#64748b]">Selamat datang kembali, <span className="text-[#0ea5e9] font-semibold">{user.username}</span>! 👋</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Total Trips */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    luggage
                  </span>
                </div>
                <div>
                  <p className="text-5xl font-black text-[#0f1419]">{stats.total_trips}</p>
                  <p className="text-sm text-[#64748b] font-semibold uppercase">Total Trips</p>
                </div>
              </div>
            </div>

            {/* Conversations */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                </div>
                <div>
                  <p className="text-5xl font-black text-[#0f1419]">{stats.total_conversations}</p>
                  <p className="text-sm text-[#64748b] font-semibold uppercase">Conversations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-black text-[#0f1419] mb-5">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <button
                onClick={() => router.push("/assistant")}
                className="bg-white rounded-2xl shadow-lg p-7 hover:shadow-xl transition-all text-left group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-[#0f1419] mb-1 text-lg">AI Assistant</h3>
                    <p className="text-sm text-[#64748b]">Tanya AI tentang destinasi wisata</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/history")}
                className="bg-white rounded-2xl shadow-lg p-7 hover:shadow-xl transition-all text-left group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      history
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-[#0f1419] mb-1 text-lg">My Trips</h3>
                    <p className="text-sm text-[#64748b]">Lihat riwayat perjalanan</p>
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
