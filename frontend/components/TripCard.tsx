import Link from "next/link";
import type { TripData } from "@/app/page";

interface TripCardProps {
  trip: TripData;
}

/* ── Destination → emoji flag / landmark ── */
const DESTINATION_ICONS: Record<string, string> = {
  japan: "🗼", tokyo: "🗼",
  bali: "🌴", indonesia: "🌴",
  paris: "🗽", france: "🗼",
  "new york": "🗽", usa: "🗽", america: "🗽",
  bangkok: "🏯", thailand: "🏯",
  istanbul: "🕌", turkey: "🕌",
  london: "🎡", "united kingdom": "🎡", uk: "🎡",
  rome: "🏛️", italy: "🏛️",
  barcelona: "⛪", spain: "⛪",
  singapore: "🦁",
  dubai: "🏙️", uae: "🏙️",
  sydney: "🦘", australia: "🦘",
  seoul: "🏙️", korea: "🏙️",
  amsterdam: "🌷", netherlands: "🌷",
  prague: "🏰", "czech republic": "🏰",
};

function getDestinationIcon(destination: string): string {
  const lower = destination.toLowerCase();
  for (const [key, icon] of Object.entries(DESTINATION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "✈️";
}

/* ── Category config ── */
const CATEGORY_CONFIG: Record<string, { label: string; cls: string }> = {
  backpacker: { label: "Backpacker", cls: "badge badge-budget"  },
  budget:     { label: "Budget",     cls: "badge badge-budget"  },
  standard:   { label: "Standard",   cls: "badge badge-mid"     },
  mid:        { label: "Mid-range",  cls: "badge badge-mid"     },
  premium:    { label: "Premium",    cls: "badge badge-premium" },
  luxury:     { label: "Luxury",     cls: "badge badge-luxury"  },
};

function getCategoryBadge(category: string) {
  return (
    CATEGORY_CONFIG[category?.toLowerCase()] ??
    { label: category ?? "Standard", cls: "badge badge-mid" }
  );
}

/* ── Travel style config ── */
const STYLE_CONFIG: Record<string, { label: string; emoji: string; cls: string }> = {
  backpacker: { label: "Backpacker", emoji: "🎒", cls: "bg-amber-50  text-amber-700  border-amber-200"  },
  family:     { label: "Family",     emoji: "👨‍👩‍👧", cls: "bg-blue-50   text-blue-700   border-blue-200"   },
  romantic:   { label: "Romantic",   emoji: "💑", cls: "bg-pink-50   text-pink-700   border-pink-200"   },
  adventure:  { label: "Adventure",  emoji: "🧗", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  cultural:   { label: "Cultural",   emoji: "🏛️", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  balanced:   { label: "Balanced",   emoji: "⚖️", cls: "bg-slate-50  text-slate-600  border-slate-200"  },
  solo:       { label: "Solo",       emoji: "🧍", cls: "bg-teal-50   text-teal-700   border-teal-200"   },
  couple:     { label: "Couple",     emoji: "💑", cls: "bg-pink-50   text-pink-700   border-pink-200"   },
};

function getStyleBadge(style: string | null) {
  const key = style?.toLowerCase() ?? "balanced";
  return STYLE_CONFIG[key] ?? { label: style ?? "Balanced", emoji: "✈️", cls: "bg-slate-50 text-slate-600 border-slate-200" };
}

/* ── Currency formatter ── */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ── Component ── */
export default function TripCard({ trip }: TripCardProps) {
  const icon        = getDestinationIcon(trip.destination);
  const catBadge    = getCategoryBadge(trip.category);
  const styleBadge  = getStyleBadge(trip.travel_style);
  const hasAI       = !!trip.ai_recommendation;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-200 overflow-hidden flex flex-col">

      {/* Card header strip */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">
              {trip.destination}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Trip #{trip.id}</p>
          </div>
        </div>
        {/* AI indicator */}
        <div className={`w-2 h-2 rounded-full ${hasAI ? "bg-emerald-400" : "bg-slate-500"}`}
             title={hasAI ? "Itinerary AI tersedia" : "Belum ada itinerary AI"} />
      </div>

      {/* Card body */}
      <div className="px-5 py-4 flex-1 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Durasi</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{trip.days}</p>
            <p className="text-xs text-slate-400">hari</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Budget</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(trip.budget)}</p>
            <p className="text-xs text-slate-400">total</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Per Hari</p>
            <p className="text-base font-bold text-emerald-600 mt-0.5">{formatCurrency(trip.daily_budget)}</p>
            <p className="text-xs text-slate-400">avg</p>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {/* Category badge */}
          <span className={catBadge.cls}>{catBadge.label}</span>

          {/* Travel style badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleBadge.cls}`}>
            <span>{styleBadge.emoji}</span>
            {styleBadge.label}
          </span>

          {/* AI badge */}
          {hasAI && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              🤖 AI Ready
            </span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <Link
          href={`/history/${trip.id}`}
          className="flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-emerald-600 transition group-hover:text-emerald-600"
        >
          <span>Lihat detail itinerary</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
