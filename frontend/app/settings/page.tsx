"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://kelana-ai-e20bf1c3.fastapicloud.dev";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export default function SettingsPage() {
  const { authHeader, user, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/profile`, {
        headers: authHeader(),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUsername(data.username);
        setEmail(data.email);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    // Validasi password baru
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok!" });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter!" });
      return;
    }

    setSaving(true);

    try {
      const body: any = {};
      
      if (username !== profile?.username) body.username = username;
      if (email !== profile?.email) body.email = email;
      if (newPassword) {
        body.current_password = currentPassword;
        body.new_password = newPassword;
      }

      // Jika tidak ada perubahan
      if (Object.keys(body).length === 0) {
        setMessage({ type: "error", text: "Tidak ada perubahan yang disimpan." });
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/v1/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Gagal update profile");
      }

      setMessage({ type: "success", text: data.message || "Profile berhasil diupdate!" });
      setProfile(data.user);
      setUsername(data.user.username);
      setEmail(data.user.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Reload user context jika username berubah
      if (body.username) {
        window.location.reload();
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f7fa]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40c2fd] mx-auto mb-4"></div>
            <p className="text-[#76777d]">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#131b2e] mb-2">Settings</h1>
            <p className="text-[#76777d]">Kelola profil dan preferensi akun Anda</p>
          </div>

          {/* Alert Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  {message.type === "success" ? "check_circle" : "error"}
                </span>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden">
            {/* Section: Account Info */}
            <div className="p-6 border-b border-[#e0e3e5]">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#40c2fd] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_circle
                </span>
                <h2 className="text-xl font-bold text-[#131b2e]">Informasi Akun</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#131b2e] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full px-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e]
                      placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a]
                      focus:border-[#00668a] transition"
                    minLength={3}
                    maxLength={50}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#131b2e] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e]
                      placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a]
                      focus:border-[#00668a] transition"
                    required
                  />
                </div>
              </form>
            </div>

            {/* Section: Change Password */}
            <div className="p-6 border-b border-[#e0e3e5]">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#40c2fd] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
                <h2 className="text-xl font-bold text-[#131b2e]">Ganti Password</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#131b2e] mb-2">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password lama"
                    className="w-full px-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e]
                      placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a]
                      focus:border-[#00668a] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#131b2e] mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e]
                      placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a]
                      focus:border-[#00668a] transition"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#131b2e] mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full px-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e]
                      placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a]
                      focus:border-[#00668a] transition"
                  />
                </div>

                {newPassword && (
                  <div className="text-xs text-[#76777d] bg-[#f5f7fa] p-3 rounded-lg">
                    <p className="font-semibold mb-1">Tips Password:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Minimal 6 karakter</li>
                      <li>Kombinasi huruf besar, kecil, dan angka lebih aman</li>
                      <li>Jangan gunakan password yang mudah ditebak</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-[#f5f7fa] flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2.5 rounded-xl border border-[#e0e3e5] bg-white text-[#45464d] text-sm font-semibold
                  hover:bg-[#f5f7fa] transition"
              >
                Batal
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl ai-gradient text-white text-sm font-semibold
                  transition shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-red-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
                <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
              </div>
              <p className="text-sm text-[#76777d] mb-4">
                Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
              <button
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin logout?")) {
                    logout();
                    router.push("/login");
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold
                  hover:bg-red-600 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
