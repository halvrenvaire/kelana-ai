"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router     = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md animate-slide-up">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Header strip */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-6 text-center">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">
              Selamat datang kembali
            </p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Masuk ke Kelana<span className="text-emerald-200">AI</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-red-500 mt-0.5">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email atau Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  👤
                </span>
                <input
                  type="text"
                  placeholder="email@contoh.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-400
                    transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  🔒
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-400
                    transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium transition"
                >
                  {showPass ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !identifier || !password}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-emerald-600
                hover:bg-emerald-700 active:scale-[0.98] transition shadow-md
                disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Masuk…
                </span>
              ) : "Masuk"}
            </button>

            {/* Footer link */}
            <p className="text-center text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
