import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-8 bg-[#f2f4f6] border-t border-[#e0e3e5]/50 mt-auto">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00668a]">explore</span>
          <span className="text-base font-bold text-[#191c1e]">KelanaAI</span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-[#45464d] text-center opacity-80 flex flex-col md:flex-row items-center gap-2">
          © 2026 KelanaAI. Built with Next.js, FastAPI &amp; Amazon Bedrock.
          <span className="inline-flex items-center gap-1 bg-[#ECFEFF] text-[#0891B2] px-2 py-0.5 rounded text-xs border border-[#CFFAFE] font-medium">
            <span className="material-symbols-outlined text-xs">auto_awesome</span>
            Powered by Amazon Bedrock
          </span>
        </p>

        {/* Links */}
        <nav className="flex items-center gap-1">
          {[
            { label: "Home",    href: "/"        },
            { label: "History", href: "/history" },
            { label: "About",   href: "/about"   },
            { label: "GitHub",  href: "https://github.com/halvrenvaire/kelana-ai", external: true },
          ].map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="px-3 py-1.5 text-xs text-[#45464d] hover:text-[#00668a] hover:bg-[#ECFEFF] rounded-lg transition"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
