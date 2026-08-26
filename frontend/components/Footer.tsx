import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            Kelana<span className="text-emerald-500">AI</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-400">© 2026 Ishak Halawa</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {[
            { label: "Beranda", href: "/" },
            { label: "Tentang", href: "/about" },
            {
              label: "GitHub",
              href: "https://github.com/halvrenvaire/kelana-ai",
              external: true,
            },
          ].map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
