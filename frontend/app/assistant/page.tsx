"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  loading?: boolean;
  timestamp: Date;          // ← UX #4: timestamp setiap pesan
}

const SUGGESTED_QUESTIONS = [
  "What is the best time to visit Bali?",
  "How much budget do I need for 5 days in Tokyo?",
  "What are the visa requirements for Istanbul?",
  "What are the must-try foods in Tokyo?",
  "How can I save money while traveling?",
];

// ── Helper: format timestamp ──────────────────────────────────
function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ── Helper: generate conversation title dari pertanyaan pertama
function generateTitle(firstQuestion: string): string {
  if (firstQuestion.length <= 40) return firstQuestion;
  return firstQuestion.slice(0, 37) + "…";
}

export default function AssistantPage() {
  const { authHeader, user } = useAuth();
  const router               = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id:        0,
      role:      "assistant",
      text:      "Halo! Saya KelanaAI Assistant. Tanya apa saja tentang perjalananmu — Bali, Tokyo, Istanbul, tips budget, dan lainnya. Jawaban saya berdasarkan dokumen travel terpercaya. 🌍",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [convTitle, setConvTitle] = useState<string | null>(null); // ← UX #1: conversation title
  const bottomRef               = useRef<HTMLDivElement>(null);
  const chatContainerRef        = useRef<HTMLDivElement>(null);
  const nextId                  = useRef(1);

  // ── UX #2: Auto-scroll — saat pertama buka (scroll ke bawah langsung)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // ── UX #2: Auto-scroll — saat ada pesan baru (smooth)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk(question: string) {
    if (!question.trim() || loading) return;

    // ── UX #1: Set conversation title dari pertanyaan pertama user
    if (!convTitle) {
      setConvTitle(generateTitle(question.trim()));
    }

    const userMsg: Message = {
      id:        nextId.current++,
      role:      "user",
      text:      question.trim(),
      timestamp: new Date(),
    };

    // ── UX #3: Typing indicator — pesan loading dari assistant
    const loadingMsg: Message = {
      id:        nextId.current++,
      role:      "assistant",
      text:      "",
      loading:   true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/ask`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body:    JSON.stringify({ question: question.trim() }),
      });

      if (res.status === 401) { router.push("/login"); return; }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal mendapatkan jawaban.");
      }

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? {
                ...m,
                loading:   false,
                text:      data.answer,
                sources:   data.sources,
                timestamp: new Date(),  // update timestamp saat jawaban diterima
              }
            : m
        )
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? { ...m, loading: false, text: `⚠ ${errMsg}`, timestamp: new Date() }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleAsk(input);
  }

  // Hitung jumlah pesan user (untuk info di header)
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Page header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h1 className="text-xl font-extrabold text-white">KelanaAI Assistant</h1>
                <p className="text-emerald-100 text-xs mt-0.5">
                  Powered by Amazon Bedrock RAG · trusted travel documents
                </p>
              </div>
            </div>

            {/* User chip */}
            {user && (
              <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/90 shrink-0">
                👤 {user.username}
              </div>
            )}
          </div>

          {/* ── UX #1: Conversation title ── */}
          {convTitle && (
            <div className="mt-4 ml-11 flex items-center gap-2">
              <span className="text-emerald-300 text-xs">💬</span>
              <div>
                <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold mb-0.5">
                  Topik percakapan
                </p>
                <p className="text-white font-semibold text-sm">{convTitle}</p>
              </div>
              {userMessageCount > 0 && (
                <span className="ml-auto bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full">
                  {userMessageCount} pertanyaan
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">

          {/* Chat messages */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Chat header bar */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">
                  {convTitle ?? "Percakapan Baru"}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {messages.length - 1} pesan
              </span>
            </div>

            {/* ── Messages area ── */}
            <div
              ref={chatContainerRef}
              className="p-5 space-y-5 max-h-[520px] overflow-y-auto scroll-smooth"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold
                    ${msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {msg.role === "user"
                      ? (user?.username?.charAt(0).toUpperCase() ?? "U")
                      : "🤖"}
                  </div>

                  {/* Bubble + timestamp */}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm
                      ${msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      {/* ── UX #3: Typing indicator ── */}
                      {msg.loading ? (
                        <div className="flex items-center gap-2 py-1">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                          <span className="text-xs text-slate-400 italic">KelanaAI sedang mengetik…</span>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          {/* Sources */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wide">
                                Source
                              </p>
                              {msg.sources.map((src) => (
                                <p key={src} className="text-xs text-emerald-600 font-mono">
                                  📄 {src}
                                </p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* ── UX #4: Timestamp ── */}
                    {!msg.loading && (
                      <span className="text-[10px] text-slate-400 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Suggested questions — hanya tampil di awal */}
          {messages.length <= 1 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
                Pertanyaan populer
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    disabled={loading}
                    className="text-xs px-3 py-2 rounded-xl bg-white border border-slate-200
                      text-slate-600 hover:border-emerald-400 hover:text-emerald-700
                      hover:bg-emerald-50 transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya tentang destinasi, budget, visa, tips perjalanan..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400
                transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white
                text-sm font-semibold transition shadow-md
                disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none
                disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : "Ask →"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Answers are grounded in your uploaded travel documents.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
