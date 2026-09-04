import Link from "next/link";
import type { TripData } from "@/app/page";

interface TripCardProps { trip: TripData; }

const DESTINATION_ICONS: Record<string, string> = {
  japan: "🗼", tokyo: "🗼", bali: "🌴", indonesia: "🌴",
  paris: "🗼", france: "🗼", "new york": "🗽", usa: "🗽",
  bangkok: "🏯", thailand: "🏯", istanbul: "🕌", turkey: "🕌",
  london: "🎡", singapore: "🦁", dubai: "🏙️", sydney: "🦘",
  seoul: "🏙️", amsterdam: "🌷", rome: "🏛️", barcelona: "⛪",
};

function getIcon(dest: string) {
  const low = dest.toLowerCase();
  for (const [k, v] of Object.entries(DESTINATION_ICONS)) {
    if (low.includes(k)) return v;
  }
  return "✈️";
}

const CATEGORY_CONFIG: Record<string, { label: string; cls: string }> = {
  backpacker: { label: "Backpacker", cls: "badge badge-budget"  },
  budget:     { label: "Budget",     cls: "badge badge-budget"  },
  standard:   { label: "Standard",   cls: "badge badge-mid"     },
  mid:        { label: "Mid-range",  cls: "badge badge-mid"     },
  premium:    { label: "Premium",    cls: "badge badge-premium" },
  luxury:     { label: "Luxury",     cls: "badge badge-luxury"  },
};

const STYLE_CONFIG: Record<string, { label: string; emoji: string }> = {
  backpacker: { label: "Backpacker", emoji: "🎒" },
  family:     { label: "Family",     emoji: "👨‍👩‍👧" },
  romantic:   { label: "Romantic",   emoji: "💑" },
  adventure:  { label: "Adventure",  emoji: "🧗" },
  cultural:   { label: "Cultural",   emoji: "🏛️" },
  balanced:   { label: "Balanced",   emoji: "⚖️" },
  solo:       { label: "Solo",       emoji: "🧍" },
  couple:     { label: "Couple",     emoji: "💑" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function TripCard({ trip }: TripCardProps) {
  const icon     = getIcon(trip.destination);
  const cat      = CATEGORY_CONFIG[trip.category?.toLowerCase()] ?? { label: trip.category, cls: "badge badge-mid" };
  const style    = STYLE_CONFIG[trip.travel_style?.toLowerCase() ?? "balanced"] ?? { label: trip.travel_style, emoji: "✈️" };
  const hasAI    = !!trip.ai_recommendation;

  return (
    <div className="group bg-white rounded-2xl border border-[#e0e3e5] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1)] hover:border-[#40c2fd] transition-all duration-200 overflow-hidden flex flex-col">

      {/* Header */}
      <div className="bg-[#131b2e] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">{trip.destination}</h3>
            <p className="text-[#7c839b] text-xs mt-0.5">Trip #{trip.id}</p>
          </div>
        </div>
        {hasAI && (
          <span className="badge badge-ai">
            <span className="material-symbols-outlined text-xs">auto_awesome</span>
            AI
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-[#eceef0] border-b border-[#eceef0]">
        {[
          { label: "Durasi", value: String(trip.days), unit: "hari" },
          { label: "Budget", value: fmt(trip.budget),  unit: "total" },
          { label: "Per Hari", value: fmt(trip.daily_budget), unit: "avg", highlight: true },
        ].map((s) => (
          <div key={s.label} className="px-3 py-3 text-center">
            <p className="text-[10px] text-[#76777d] uppercase tracking-wide font-medium">{s.label}</p>
            <p className={`text-base font-bold mt-0.5 ${s.highlight ? "text-[#00668a]" : "text-[#191c1e]"}`}>{s.value}</p>
            <p className="text-[10px] text-[#76777d]">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="px-5 py-3 flex flex-wrap gap-2 flex-1">
        <span className={cat.cls}>{cat.label}</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f2f4f6] text-[#45464d] border border-[#e0e3e5]">
          {style.emoji} {style.label}
        </span>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-[#f2f4f6] border-t border-[#e0e3e5]">
        <Link
          href={`/history/${trip.id}`}
          className="flex items-center justify-between text-xs font-semibold text-[#45464d] hover:text-[#00668a] transition group-hover:text-[#00668a]"
        >
          <span>View Trip</span>
          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
