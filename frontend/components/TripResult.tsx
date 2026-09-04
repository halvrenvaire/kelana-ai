"use client";

import { useState } from "react";
import type { TripData } from "@/app/page";

interface TripResultProps { trip: TripData; onReset: () => void; }

const CATEGORY_CONFIG: Record<string, { label: string; cls: string; emoji: string }> = {
  backpacker: { label: "Backpacker", cls: "badge badge-budget",  emoji: "🎒" },
  budget:     { label: "Budget",     cls: "badge badge-budget",  emoji: "🎒" },
  standard:   { label: "Standard",   cls: "badge badge-mid",     emoji: "✈️" },
  mid:        { label: "Mid-range",  cls: "badge badge-mid",     emoji: "✈️" },
  premium:    { label: "Premium",    cls: "badge badge-premium", emoji: "🏨" },
  luxury:     { label: "Luxury",     cls: "badge badge-luxury",  emoji: "💎" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, (m) => "<ul>" + m.trimEnd() + "</ul>\n")
    .replace(/^(?!<[h|u|l])(.+)$/gm, "<p>$1</p>")
    .replace(/<p>\s*<\/p>/g, "");
}

export default function TripResult({ trip, onReset }: TripResultProps) {
  const [copied, setCopied] = useState(false);

  const cat = CATEGORY_CONFIG[trip.category?.toLowerCase()] ?? CATEGORY_CONFIG["standard"];

  function handleCopy() {
    if (!trip.ai_recommendation) return;
    navigator.clipboard.writeText(trip.ai_recommendation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="animate-slide-up space-y-4">

      {/* Trip Summary Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Main info card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#e0e3e5] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7bd0ff]/10 rounded-full blur-3xl" />
          <div className="z-10">
            {/* AI chip */}
            <span className="badge badge-ai mb-3 inline-flex">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              AI Generated
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1e] tracking-tight mb-2">
              {trip.destination}
            </h1>
            <p className="text-sm text-[#45464d] mb-6 max-w-md">
              Your AI-curated itinerary is ready — personalized to your budget and travel style.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-[#eceef0] pt-4 z-10">
            {[
              { icon: "calendar_month", text: `${trip.days} Days` },
              { icon: "payments",       text: `${fmt(trip.budget)} Budget` },
              { icon: "hotel_class",    text: cat.label },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 bg-[#f2f4f6] px-3 py-2 rounded-lg">
                <span className="material-symbols-outlined text-[#00668a] text-lg">{item.icon}</span>
                <span className="text-sm font-medium text-[#191c1e]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-gradient-to-br from-[#ECFEFF] to-white rounded-2xl border border-[#A5F3FC] p-6 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-[#00668a] text-2xl">insights</span>
            </div>
            <h3 className="font-bold text-[#191c1e] mb-3">Budget Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: "Total Budget", value: fmt(trip.budget) },
                { label: "Per Day",      value: fmt(trip.daily_budget), highlight: true },
                { label: "Duration",     value: `${trip.days} days` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-xs text-[#45464d]">{r.label}</span>
                  <span className={`text-sm font-bold ${r.highlight ? "text-[#00668a]" : "text-[#191c1e]"}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={cat.cls}>{cat.emoji} {cat.label}</span>
          </div>
        </div>
      </div>

      {/* AI Itinerary Card */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)]">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00668a]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            <h3 className="text-sm font-bold text-[#191c1e]">Your AI-Generated Itinerary</h3>
            <span className="badge badge-ai ml-1">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              Bedrock
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-[#45464d] hover:text-[#00668a] px-2.5 py-1.5 rounded-lg hover:bg-[#ECFEFF] border border-transparent hover:border-[#40c2fd] transition"
          >
            <span className="material-symbols-outlined text-base">{copied ? "check" : "content_copy"}</span>
            {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[540px] overflow-y-auto">
          {trip.ai_recommendation ? (
            <div
              className="prose-itinerary"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(trip.ai_recommendation) }}
            />
          ) : (
            <div className="space-y-3">
              {[80, 60, 90, 50, 70, 40].map((w, i) => (
                <div key={i} className="shimmer h-3" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-5 rounded-xl border-2 border-[#e0e3e5] text-[#45464d] text-sm font-semibold hover:border-[#00668a] hover:text-[#00668a] hover:bg-[#ECFEFF] transition active:scale-[0.98]"
        >
          ← Plan New Trip
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-3 px-5 rounded-xl ai-gradient text-white text-sm font-semibold transition shadow-md hover:opacity-90 active:scale-[0.98]"
        >
          {copied ? "✓ Tersalin!" : "⎘ Salin Itinerary"}
        </button>
      </div>
    </div>
  );
}
