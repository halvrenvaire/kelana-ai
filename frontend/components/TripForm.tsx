"use client";

import { useState } from "react";
import type { FormValues } from "@/app/page";

interface TripFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

const POPULAR_DESTINATIONS = [
  "Tokyo, Japan",
  "Bali, Indonesia",
  "Paris, France",
  "Bangkok, Thailand",
  "New York, USA",
  "Istanbul, Turkey",
];

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = POPULAR_DESTINATIONS.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  const isValid =
    destination.trim() !== "" && Number(days) >= 1 && Number(budget) >= 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit({
      destination: destination.trim(),
      days: Number(days),
      budget: Number(budget),
    });
  }

  // Budget category hint
  function getBudgetHint(val: number): { label: string; cls: string } | null {
    if (!val) return null;
    if (val < 500)  return { label: "Budget", cls: "badge badge-budget" };
    if (val < 1500) return { label: "Mid-range", cls: "badge badge-mid" };
    if (val < 4000) return { label: "Premium", cls: "badge badge-premium" };
    return { label: "Luxury", cls: "badge badge-luxury" };
  }

  const budgetHint = getBudgetHint(Number(budget));

  return (
    <div className="animate-slide-up bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🗺️</span>
          <h2 className="text-xl font-bold text-slate-900">Rencanakan Perjalanan</h2>
        </div>
        <p className="text-sm text-slate-500 ml-9">
          Isi detail perjalananmu, biarkan AI menyusun itinerary-nya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destinasi */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Destinasi
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              📍
            </span>
            <input
              type="text"
              placeholder="Contoh: Tokyo, Japan"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && destination.length > 0 && filtered.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {filtered.map((d) => (
                <li
                  key={d}
                  onMouseDown={() => {
                    setDestination(d);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition flex items-center gap-2"
                >
                  <span className="text-emerald-500 text-xs">✈</span>
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Durasi & Anggaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Jumlah Hari */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Jumlah Hari
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                📅
              </span>
              <input
                type="number"
                min="1"
                max="30"
                placeholder="5"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {Number(days) > 0 && (
              <p className="mt-1.5 text-xs text-slate-400">
                {Number(days)} hari {Number(days) > 7 ? "· perjalanan panjang 🏕️" : "· perjalanan singkat ✨"}
              </p>
            )}
          </div>

          {/* Anggaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Anggaran (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
                $
              </span>
              <input
                type="number"
                min="1"
                placeholder="2000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {budgetHint && (
              <div className="mt-1.5">
                <span className={budgetHint.cls}>{budgetHint.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-md
            bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]
            disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Sedang menyusun itinerary…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✨ Buat Rencana Perjalanan
            </span>
          )}
        </button>

        {!isValid && !isLoading && (
          <p className="text-center text-xs text-slate-400">
            Lengkapi semua kolom untuk melanjutkan.
          </p>
        )}
      </form>
    </div>
  );
}
