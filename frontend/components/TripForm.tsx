"use client";

import { useState } from "react";
import type { FormValues } from "@/app/page";

interface TripFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

const POPULAR_DESTINATIONS = [
  "Tokyo, Japan", "Bali, Indonesia", "Paris, France",
  "Bangkok, Thailand", "New York, USA", "Istanbul, Turkey",
];

const TRAVEL_STYLES = [
  { value: "backpacker", label: "🎒 Backpacker" },
  { value: "family",     label: "👨‍👩‍👧 Family"     },
  { value: "romantic",   label: "💑 Romantic"   },
  { value: "adventure",  label: "🧗 Adventure"  },
  { value: "cultural",   label: "🏛️ Cultural"   },
  { value: "balanced",   label: "⚖️ Balanced"   },
];

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays]               = useState("");
  const [budget, setBudget]           = useState("");
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = POPULAR_DESTINATIONS.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  const isValid =
    destination.trim() !== "" && Number(days) >= 1 && Number(budget) >= 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit({ destination: destination.trim(), days: Number(days), budget: Number(budget), travel_style: travelStyle });
  }

  return (
    <div id="trip-form" className="glass-card rounded-2xl shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1)] p-6 md:p-8 animate-slide-up">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-5 border-b border-[#e0e3e5]/60">
        <span className="material-symbols-outlined text-[#00668a] text-2xl">travel_explore</span>
        <div>
          <h2 className="text-lg font-bold text-[#191c1e]">Plan Your Trip</h2>
          <p className="text-xs text-[#45464d]">Fill in your details — AI will do the rest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Destination */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#45464d] uppercase tracking-wider mb-2">
            Where are you going?
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-xl pointer-events-none">location_on</span>
            <input
              type="text"
              placeholder="Tokyo, Japan"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e] placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a] focus:border-[#00668a] shadow-inner transition disabled:opacity-50"
            />
          </div>
          {showSuggestions && destination.length > 0 && filtered.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full bg-white border border-[#c6c6cd] rounded-xl shadow-lg overflow-hidden">
              {filtered.map((d) => (
                <li
                  key={d}
                  onMouseDown={() => { setDestination(d); setShowSuggestions(false); }}
                  className="px-4 py-2.5 text-sm text-[#45464d] hover:bg-[#ECFEFF] hover:text-[#004d6a] cursor-pointer transition flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-[#00668a]">flight_takeoff</span>
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Days & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#45464d] uppercase tracking-wider mb-2">
              How many days?
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-xl pointer-events-none">calendar_today</span>
              <input
                type="number" min="1" max="30" placeholder="5"
                value={days} onChange={(e) => setDays(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e] placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a] focus:border-[#00668a] shadow-inner transition disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#45464d] uppercase tracking-wider mb-2">
              What&apos;s your budget?
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-xl pointer-events-none">payments</span>
              <input
                type="number" min="1" placeholder="$2,000"
                value={budget} onChange={(e) => setBudget(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e] placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a] focus:border-[#00668a] shadow-inner transition disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Travel Style */}
        <div>
          <label className="block text-xs font-semibold text-[#45464d] uppercase tracking-wider mb-2">
            Travel Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => !isLoading && setTravelStyle(style.value)}
                disabled={isLoading}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition text-left
                  ${travelStyle === style.value
                    ? "bg-[#ECFEFF] border-[#00668a] text-[#004d6a] ring-1 ring-[#00668a]"
                    : "bg-white border-[#c6c6cd] text-[#45464d] hover:border-[#00668a] hover:bg-[#ECFEFF]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-md
            ai-gradient hover:opacity-90 active:scale-[0.98]
            disabled:bg-[#e0e3e5] disabled:text-[#76777d] disabled:shadow-none disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-[#00668a] focus:ring-offset-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Menyusun itinerary…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Generate AI Trip
            </span>
          )}
        </button>

        {!isValid && !isLoading && (
          <p className="text-center text-xs text-[#76777d]">Lengkapi semua kolom untuk melanjutkan.</p>
        )}
      </form>
    </div>
  );
}
