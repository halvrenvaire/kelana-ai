"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import TripForm from "@/components/TripForm";
import TripResult from "@/components/TripResult";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export type AppState = "idle" | "loading" | "result" | "error";

export interface TripData {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
}

export interface FormValues {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubmit(values: FormValues) {
    setAppState("loading");
    setErrorMsg("");
    setTripData(null);

    try {
      // Step 1: Buat trip baru
      const createRes = await fetch(`${API_BASE}/api/v1/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal membuat rencana perjalanan.");
      }

      const created: TripData = await createRes.json();

      // Step 2: Generate rekomendasi AI
      const genRes = await fetch(
        `${API_BASE}/api/v1/trips/${created.id}/generate`,
        { method: "POST" }
      );

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal menghasilkan itinerary AI.");
      }

      const withAI: TripData = await genRes.json();
      setTripData(withAI);
      setAppState("result");
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <Hero />

      {/* Main content — floating card overlap */}
      <main className="flex-1 w-full px-4 -mt-16 sm:-mt-20 z-20 pb-20">
        <div className="mx-auto w-full max-w-2xl space-y-8">

          {/* Form Card */}
          {appState !== "result" && (
            <TripForm
              onSubmit={handleSubmit}
              isLoading={appState === "loading"}
            />
          )}

          {/* Error Banner */}
          {appState === "error" && (
            <div className="animate-slide-up rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
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

          {/* Feature Cards — hanya tampil di state idle */}
          {appState === "idle" && <Features />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
