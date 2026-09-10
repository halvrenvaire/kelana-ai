"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TripForm from "@/components/TripForm";
import TripResult from "@/components/TripResult";
import { useAuth } from "@/context/AuthContext";
import type { TripData, FormValues } from "@/types/trip";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://kelana-ai-e20bf1c3.fastapicloud.dev";

export default function CreateTripPage() {
  const { authHeader, user } = useAuth();
  const router = useRouter();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateTrip(values: FormValues) {
    setError(null);
    setIsLoading(true);
    setTripData(null);

    try {
      // 1. Buat trip terlebih dahulu
      const createRes = await fetch(`${API_BASE}/api/v1/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify(values),
      });

      if (createRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(
          errData?.detail ?? "Failed to create trip."
        );
      }

      const trip = await createRes.json();

      // 2. Generate itinerary AI menggunakan ID trip
      const generateRes = await fetch(
        `${API_BASE}/api/v1/trips/${trip.id}/generate`,
        {
          method: "POST",
          headers: {
            ...authHeader(),
          },
        }
      );

      if (generateRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!generateRes.ok) {
        const errData = await generateRes.json().catch(() => ({}));
        throw new Error(
          errData?.detail ?? "Failed to generate trip."
        );
      }

      const data: TripData = await generateRes.json();

      setTripData(data);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "An error occurred.";

      setError(msg);
      console.error("Generate trip error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setTripData(null);
    setError(null);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0ea5e9] mx-auto mb-4"></div>

          <p className="text-[#64748b]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">

              <span
                className="material-symbols-outlined text-[#00668a] text-4xl"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                luggage
              </span>

              <h1 className="text-4xl font-black text-[#0f1419]">
                Create New Trip
              </h1>

            </div>

            <p className="text-lg text-[#64748b]">
              Plan your perfect journey with AI-powered itinerary
              generator 🌍
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">

              <span className="material-symbols-outlined text-red-500 text-xl">
                error
              </span>

              <div className="flex-1">

                <p className="text-sm font-semibold text-red-800">
                  Error
                </p>

                <p className="text-sm text-red-600">
                  {error}
                </p>

              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left: Form */}
            <div>
              <TripForm
                onSubmit={handleGenerateTrip}
                isLoading={isLoading}
              />
            </div>

            {/* Right: Result */}
            <div>

              {isLoading ? (

                <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">

                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00668a] mb-4"></div>

                  <p className="text-sm font-semibold text-[#45464d]">
                    Generating your perfect itinerary...
                  </p>

                  <p className="text-xs text-[#76777d] mt-1">
                    This might take a few seconds
                  </p>

                </div>

              ) : tripData ? (

                <TripResult
                  trip={tripData}
                  onReset={handleReset}
                />

              ) : (

                <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-[#e0e3e5]">

                  <span
                    className="material-symbols-outlined text-[#c6c6cd] text-6xl mb-4"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    flight_takeoff
                  </span>

                  <p className="text-sm font-semibold text-[#76777d] text-center">
                    Fill in the form to generate your trip
                  </p>

                  <p className="text-xs text-[#76777d]/60 text-center mt-1">
                    AI will create a detailed itinerary for you
                  </p>

                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}