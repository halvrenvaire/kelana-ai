import Link from "next/link";
import Footer from "@/components/Footer";

export default function About() {
  const teknologi = [
    { nama: "Python & FastAPI", peran: "REST API dan business logic" },
    { nama: "PostgreSQL & SQLAlchemy", peran: "Penyimpanan data permanen" },
    { nama: "Amazon Bedrock", peran: "Menghasilkan itinerary dengan AI" },
    { nama: "Next.js & Tailwind", peran: "Antarmuka pengguna" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">
            Kembali ke beranda
          </Link>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold text-white">
            Tentang KelanaAI
          </h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Perencana perjalanan yang menyusun itinerary harian menggunakan
            kecerdasan buatan, bukan aturan yang kaku.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-6 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-xl font-semibold text-slate-900">
            Teknologi yang Digunakan
          </h2>

          <div className="mt-6 space-y-3">
            {teknologi.map((t) => (
              <div
                key={t.nama}
                className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-slate-900">{t.nama}</span>
                <span className="mt-1 text-sm text-slate-500 sm:mt-0">
                  {t.peran}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
            <h3 className="font-semibold text-emerald-900">
              Prinsip Arsitektur
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-emerald-800">
              Logika bisnis dipisahkan sepenuhnya dari antarmuka. Fungsi yang
              sama dipakai ulang oleh aplikasi konsol, REST API, maupun endpoint
              AI - tanpa satu baris pun diubah.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
