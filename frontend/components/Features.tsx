type FeatureItem = {
  emoji: string;
  judul: string;
  isi: string;
};

const daftarFitur: FeatureItem[] = [
  {
    emoji: "🗓️",
    judul: "Itinerary Harian",
    isi: "Jadwal pagi, siang, dan malam tersusun rapi untuk setiap hari perjalananmu.",
  },
  {
    emoji: "💰",
    judul: "Sesuai Anggaran",
    isi: "Rekomendasi aktivitas dan akomodasi yang menyesuaikan kantongmu secara otomatis.",
  },
  {
    emoji: "🤖",
    judul: "Ditenagai AI",
    isi: "Dibuat oleh Amazon Bedrock — fleksibel, kontekstual, bukan template kaku.",
  },
];

function FeatureCard({ emoji, judul, isi }: FeatureItem) {
  return (
    <div className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 text-center">
      <div className="w-11 h-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-2xl mx-auto mb-3 transition-colors">
        {emoji}
      </div>
      <h3 className="font-bold text-slate-900 text-sm mb-1">{judul}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{isi}</p>
    </div>
  );
}

export default function Features() {
  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Kenapa KelanaAI?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {daftarFitur.map((f) => (
          <FeatureCard key={f.judul} {...f} />
        ))}
      </div>
    </div>
  );
}
