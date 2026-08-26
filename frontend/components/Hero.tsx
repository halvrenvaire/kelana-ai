export default function Hero() {
  return (
    <section className="relative w-full h-[400px] sm:h-[460px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />

      {/* Gradient overlays — top dark, bottom heavier for card overlap */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />

      {/* Subtle grid texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-xl mx-auto space-y-4">
        {/* Brand pill */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/90 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Powered by Amazon Bedrock
        </div>

        {/* Wordmark */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
          Kelana<span className="text-emerald-400">AI</span>
        </h1>

        {/* Tagline */}
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
          Itinerary harian yang tersusun rapi, sesuai anggaranmu — dibuat AI dalam hitungan detik.
        </p>

        {/* Destination chips */}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {["🗼 Tokyo", "🌴 Bali", "🗽 New York", "🏯 Istanbul"].map((dest) => (
            <span
              key={dest}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full"
            >
              {dest}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade into background color */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>
  );
}
