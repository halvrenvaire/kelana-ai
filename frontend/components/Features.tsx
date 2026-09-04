const FEATURES = [
  {
    icon:  "travel_explore",
    title: "Daily Itinerary",
    desc:  "Morning, afternoon & evening schedule — neatly structured for every day of your trip.",
  },
  {
    icon:  "payments",
    title: "Budget-Optimized",
    desc:  "Activity and accommodation recommendations automatically calibrated to your budget.",
  },
  {
    icon:  "auto_awesome",
    title: "Powered by AI",
    desc:  "Built on Amazon Bedrock — flexible, contextual answers, not rigid templates.",
  },
];

export default function Features() {
  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-semibold text-[#76777d] uppercase tracking-widest">
        Why KelanaAI?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group bg-white rounded-2xl border border-[#e0e3e5] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-[#40c2fd] transition-all p-5 text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-[#ECFEFF] group-hover:bg-[#40c2fd]/20 flex items-center justify-center mx-auto mb-3 transition-colors">
              <span className="material-symbols-outlined text-[#00668a] text-2xl">{f.icon}</span>
            </div>
            <h3 className="font-bold text-[#191c1e] text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-[#45464d] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
