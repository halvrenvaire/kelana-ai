"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Stats {
  totalTrips: number;
  totalConversations: number;
  recentActivity: string;
}

export default function DashboardPage() {
  const { authHeader, user, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    totalConversations: 0,
    recentActivity: "No recent activity",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStats();
    }
  }, [user, isLoading, router]);

  async function fetchStats() {
    try {
      // Fetch trips
      const tripsRes = await fetch(`${API_BASE}/api/v1/trips`, {
        headers: authHeader(),
      });
      const trips = tripsRes.ok ? await tripsRes.json() : [];

      // Fetch conversations
      const convsRes = await fetch(`${API_BASE}/api/v1/conversations`, {
        headers: authHeader(),
      });
      const convs = convsRes.ok ? await convsRes.json() : [];

      setStats({
        totalTrips: trips.length,
        totalConversations: convs.length,
        recentActivity: trips.length > 0 || convs.length > 0 ? "Active" : "No recent activity",
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00668a]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#131b2e] mb-2">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-[#76777d]">Here's your travel planning overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Trips */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ECFEFF] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00668a] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  luggage
                </span>
              </div>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-3xl font-bold text-[#131b2e]">{stats.totalTrips}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-[#76777d] mb-1">Total Trips</h3>
            <p className="text-xs text-[#76777d]">All planned trips</p>
          </div>

          {/* Total Conversations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#D97706] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  chat
                </span>
              </div>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-3xl font-bold text-[#131b2e]">{stats.totalConversations}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-[#76777d] mb-1">AI Conversations</h3>
            <p className="text-xs text-[#76777d]">With KelanaAI Assistant</p>
          </div>

          {/* Activity Status */}
          <div className="bg-gradient-to-br from-[#00668a] to-[#40c2fd] rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  trending_up
                </span>
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                {stats.recentActivity}
              </span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Activity Status</h3>
            <p className="text-xs opacity-90">Your travel planning is on track</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#131b2e] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan New Trip */}
            <Link
              href="/history"
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5] hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00668a] to-[#40c2fd] flex items-center justify-center group-hover:scale-110 transition">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    add_circle
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#131b2e] mb-1">Plan New Trip</h3>
                  <p className="text-sm text-[#76777d]">Create a personalized travel itinerary</p>
                </div>
              </div>
            </Link>

            {/* Ask AI Assistant */}
            <Link
              href="/assistant"
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5] hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D97706] to-[#FBBF24] flex items-center justify-center group-hover:scale-110 transition">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#131b2e] mb-1">Ask AI Assistant</h3>
                  <p className="text-sm text-[#76777d]">Get travel advice powered by RAG</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5]">
          <h2 className="text-xl font-bold text-[#131b2e] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00668a]" style={{ fontVariationSettings: "'FILL' 1" }}>
              tips_and_updates
            </span>
            Getting Started with KelanaAI
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ECFEFF] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#00668a]">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#131b2e] text-sm mb-1">Plan Your First Trip</h4>
                <p className="text-sm text-[#76777d]">
                  Go to <Link href="/history" className="text-[#00668a] hover:underline">My Trips</Link> and create a new trip with your destination, budget, and preferences.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#D97706]">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#131b2e] text-sm mb-1">Chat with AI Assistant</h4>
                <p className="text-sm text-[#76777d]">
                  Visit <Link href="/assistant" className="text-[#00668a] hover:underline">AI Assistant</Link> to ask travel questions. Answers are grounded in trusted travel documents.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E0E7FF] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#4F46E5]">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#131b2e] text-sm mb-1">Generate AI Recommendations</h4>
                <p className="text-sm text-[#76777d]">
                  For each trip, generate personalized AI recommendations powered by Amazon Bedrock.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
