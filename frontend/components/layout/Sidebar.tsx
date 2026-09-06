"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/create-trip", label: "Create Trip", icon: "add_circle" },
    { href: "/assistant", label: "AI Assistant", icon: "smart_toy" },
    { href: "/history", label: "My Trips", icon: "luggage" },
    { href: "/settings", label: "Settings", icon: "settings" },
    { href: "/about", label: "About", icon: "info" },
  ];

  return (
    <aside className="w-64 bg-[#0f1419] text-white h-screen sticky top-0 flex flex-col shadow-2xl">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              flight_takeoff
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold group-hover:text-[#06b6d4] transition">KelanaAI</h1>
            <p className="text-xs text-white/50 font-medium">Travel Planner</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-semibold shadow-lg shadow-cyan-500/30"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined text-xl transition-transform group-hover:scale-110"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      {user && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] border border-white/10 mb-3 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center text-white text-base font-bold shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.username}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm font-semibold border border-red-500/20 hover:border-red-500/40"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
