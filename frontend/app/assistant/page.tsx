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
}

const SUGGESTED_QUESTIONS = [
  "What is the best time to visit Bali?",
  "How much budget do I need for 5 days in Tokyo?",
  "What are the visa requirements for Istanbul?",
  "What are the must-try foods in Tokyo?",
  "How can I save money while traveling?",
];

export default function AssistantPage() {
  const { authHeader } = useAuth();
  const router         = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      text: "Halo! Saya KelanaAI Assistant. Tanya apa saja tentang perjalananmu — Bali, Tokyo, Istanbul, tips budget, dan lainnya. Jawaban saya berdasarkan dokumen travel terpercaya. 🌍",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  let   nextId                = useRef(1);

  // Auto scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id:   nextId.current++,
      role: "user",
      text: question.trim(),
    };
    const loadingMsg: Message = {
      id:      nextId.current++,
      role:    "assistant",
      text:    "",
      loading: true,
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
            ? { ...m, loading: false, text: data.answer, sources: data.sources }
            : m
        )
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? { ...m, loading: false, text: `⚠ ${errMsg}` }
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Page header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-extrabold text-white">KelanaAI Assistant</h1>
          </div>
          <p className="text-emerald-100 text-sm ml-11">
            Powered by your trusted travel documents · Amazon Bedrock RAG
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">

          {/* Chat messages */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm
                    ${msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {msg.role === "user" ? "👤" : "🤖"}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
                    ${msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-400 font-medium mb-1">SOURCE</p>
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
