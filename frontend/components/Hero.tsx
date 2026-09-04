export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center px-4 md:px-8 py-12 overflow-hidden rounded-b-3xl">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(247,249,251,0.4)] via-[rgba(247,249,251,0.55)] to-[#f7f9fb]" />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto gap-6 pt-8">
        {/* AI chip */}
        <span className="inline-flex items-center gap-2 bg-[#ECFEFF] text-[#0090a9] px-3 py-1 rounded-full text-xs font-semibold border border-[#0090a9]/20 shadow-sm">
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          AI-Powered Travel
        </span>

        {/* Headline */}
        <h1 className="text-[40px] md:text-[56px] font-extrabold text-[#191c1e] leading-tight tracking-tight">
          Plan Your Journey <br className="hidden md:block" />
          <span className="ai-gradient-text">with AI.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-[#45464d] max-w-xl leading-relaxed">
          Experience seamless travel planning. Our intelligent agent curates personalized itineraries,
          manages budgets, and discovers hidden gems — all tailored to your preferences.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
          <a
            href="#trip-form"
            className="bg-[#0f172a] text-white px-8 py-3.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 h-12"
          >
            Start Planning
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </a>
          <a
            href="/history"
            className="bg-transparent text-[#00668a] border border-[#00668a] px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-2 h-12"
          >
            View Trip History
          </a>
        </div>

        {/* Destination chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {["🗼 Tokyo", "🌴 Bali", "🗽 New York", "🕌 Istanbul", "🏯 Bangkok"].map((d) => (
            <span
              key={d}
              className="bg-white/70 backdrop-blur-sm border border-[#c6c6cd]/50 text-[#45464d] text-xs px-3 py-1.5 rounded-full font-medium shadow-sm"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
