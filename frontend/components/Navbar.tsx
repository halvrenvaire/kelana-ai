"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Beranda",  href: "/"        },
  { label: "History",  href: "/history" },
  { label: "Tentang",  href: "/about"   },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-base font-extrabold text-slate-900 tracking-tight">
          Kelana<span className="text-emerald-500">AI</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                  ${active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
