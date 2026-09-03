"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Beranda",   href: "/"          },
  { label: "Assistant", href: "/assistant" },
  { label: "History",   href: "/history"   },
  { label: "Tentang",   href: "/about"     },
];

export default function Navbar() {
  const pathname      = usePathname();
  const router        = useRouter();
  const { user, logout, isLoading } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="text-base font-extrabold text-slate-900 tracking-tight shrink-0">
          Kelana<span className="text-emerald-500">AI</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Nav links — hanya tampil jika sudah login */}
          {user && NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
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

          {/* Auth section */}
          {isLoading ? (
            <div className="w-20 h-7 skeleton rounded-lg ml-2" />
          ) : user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              {/* User chip */}
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                  {user.username}
                </span>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500
                  hover:bg-red-50 hover:text-red-600 transition"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 ml-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500
                  hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
