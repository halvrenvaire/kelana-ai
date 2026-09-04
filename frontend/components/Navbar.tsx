"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home",      href: "/",          icon: "home"    },
  { label: "Assistant", href: "/assistant", icon: "smart_toy" },
  { label: "History",   href: "/history",   icon: "history" },
  { label: "About",     href: "/about",     icon: "info"    },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, isLoading } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Top App Bar ── */}
      <header className="bg-[rgba(247,249,251,0.85)] backdrop-blur-md fixed top-0 w-full z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-8 h-16 max-w-7xl mx-auto">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00668a] text-2xl">explore</span>
            <span className="text-xl font-bold text-[#191c1e] tracking-tight">KelanaAI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 h-16 flex items-center text-sm font-medium transition-colors border-b-2
                  ${isActive(href)
                    ? "text-[#00668a] border-[#00668a] font-bold"
                    : "text-[#45464d] border-transparent hover:text-[#00668a]"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 shimmer rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center text-sm font-bold border border-[#c6c6cd]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-[#191c1e] max-w-[100px] truncate">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-[#45464d] hover:text-[#191c1e] hover:bg-[#eceef0] transition">
                  Masuk
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#191c1e] hover:bg-[#000] transition shadow-sm">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Bottom Nav (Mobile Only) ── */}
      <nav className="fixed bottom-0 w-full z-50 md:hidden bg-[#f7f9fb] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-[#e0e3e5]/50 flex justify-around items-center py-2 px-4">
        {NAV_LINKS.map(({ label, href, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all
                ${active
                  ? "bg-[#40c2fd] text-[#004d6a] scale-90"
                  : "text-[#45464d] hover:bg-[#f2f4f6]"
                }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span className="text-[10px] font-semibold mt-0.5">{label}</span>
            </Link>
          );
        })}
        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center px-3 py-1 rounded-xl text-red-400 hover:bg-red-50 transition"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-[10px] font-semibold mt-0.5">Keluar</span>
          </button>
        )}
      </nav>

      {/* Material Symbols font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
    </>
  );
}
