"use client";

import { useState } from "react";
import type { TripData } from "@/app/page";

interface TripResultProps {
  trip: TripData;
  onReset: () => void;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; badgeCls: string; emoji: string }
> = {
  budget:  { label: "Budget",    badgeCls: "badge badge-budget",  emoji: "🎒" },
  mid:     { label: "Mid-range", badgeCls: "badge badge-mid",     emoji: "✈️" },
  premium: { label: "Premium",   badgeCls: "badge badge-premium", emoji: "🏨" },
  luxury:  { label: "Luxury",    badgeCls: "badge badge-luxury",  emoji: "💎" },
};

function renderMarkdown(text: string): string {
  return text
    // H2: ## Title
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // H3: ### Title
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Bullet: - item
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, (match) => {
      return "<ul>" + match.trimEnd() + "</ul>\n";
    })
    // Paragraphs: blank-line separated text
    .replace(/^(?!<[h|u|l])(.+)$/gm, "<p>$1</p>")
    // Clean up empty <p></p>
    .replace(/<p>\s*<\/p>/g, "");
}

export default function TripResult({ trip, onReset }: TripResultProps) {
  const [copied, setCopied] = useState(false);

  const cat =
    CATEGORY_CONFIG[trip.category?.toLowerCase()] ??
    CATEGORY_CONFIG["mid"];

  const dailyFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(trip.daily_budget);

  const totalFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(trip.budget);

  function handleCopy() {
    if (!trip.ai_recommendation) return;
    navigator.clipboard.writeText(trip.ai_recommendation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Trip Summary Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Colored header strip */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">
                Itinerary siap! 🎉
              </p>
              <h2 className="text-white text-2xl font-bold leading-tight">
                {trip.destination}
              </h2>
            </div>
            <span className="text-3xl mt-0.5">{cat.emoji}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Durasi</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{trip.days}</p>
            <p className="text-xs text-slate-500">hari</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{totalFormatted}</p>
            <p className="text-xs text-slate-500">anggaran</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Per Hari</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{dailyFormatted}</p>
            <p className="text-xs text-slate-500">rata-rata</p>
          </div>
        </div>

        {/* Category badge */}
        <div className="px-6 py-3 flex items-center gap-2 bg-slate-50">
          <span className="text-xs text-slate-500">Kategori perjalanan:</span>
          <span className={cat.badgeCls}>{cat.label}</span>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <h3 className="text-sm font-bold text-slate-900">
              Itinerary dari AI
            </h3>
            <span className="badge badge-mid ml-1">Amazon Bedrock</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <span>⎘</span>
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Itinerary content */}
        <div className="px-6 py-5 max-h-[520px] overflow-y-auto">
          {trip.ai_recommendation ? (
            <div
              className="prose-itinerary"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(trip.ai_recommendation),
              }}
            />
          ) : (
            /* Skeleton loader fallback */
            <div className="space-y-3">
              {[80, 60, 90, 50, 70, 40].map((w, i) => (
                <div
                  key={i}
                  className="skeleton h-3"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition active:scale-[0.98]"
        >
          ← Rencanakan Perjalanan Baru
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {copied ? "✓ Tersalin!" : "⎘ Salin Itinerary"}
        </button>
      </div>
    </div>
  );
}
