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
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is the best time to visit Bali?",
  "How much budget do I need for 5 days in Tokyo?",
  "What are the visa requirements for Istanbul?",
  "What are the must-try foods in Tokyo?",
  "How can I save money while traveling?",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function generateTitle(q: string): string {
  return q.length <= 40 ? q : q.slice(0, 37) + "…";
}

export default function AssistantPage() {
  const { authHeader, user } = useAuth();
  const router               = useRouter();

  const [messages, setMessages]     = useState<Message[]>([
    {
      id: 0, role: "assistant",
      text: "Halo! Saya KelanaAI Assistant. Tanya apa saja tentang perjalananmu — Bali, Tokyo, Istanbul, tips budget, dan lainnya. Jawaban saya berdasarkan dokumen travel terpercaya. 🌍",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [convTitle, setConvTitle]   = useState<string | null>(null);   // UX #1
  const [convId, setConvId]         = useState<number | null>(null);   // conversation ID dari DB

  const bottomRef        = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const nextId           = useRef(1);

  // UX #2: scroll ke bawah saat pertama buka
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // UX #2: smooth scroll saat ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Buat conversation baru di backend ────────────────────────
  async function ensureConversation(): Promise<number> {
    if (convId) return convId;

    const res = await fetch(`${API_BASE}/api/v1/conversations`, {
      method:  "POST",
      headers: authHeader(),
    });

    if (res.status === 401) { router.push("/login"); throw new Error("401"); }
    if (!res.ok) throw new Error("Gagal membuat conversation.");

    const data = await res.json();
    setConvId(data.id);
    return data.id;
  }

  async function handleAsk(question: string) {
    if (!question.trim() || loading) return;

    // UX #1: set title dari pertanyaan pertama
    if (!convTitle) setConvTitle(generateTitle(question.trim()));

    const userMsg: Message = {
      id: nextId.current++, role: "user",
      text: question.trim(), timestamp: new Date(),
    };

    // UX #3: typing indicator
    const loadingMsg: Message = {
      id: nextId.current++, role: "assistant",
      text: "", loading: true, timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      // Pastikan conversation sudah ada di DB
      const cid = await ensureConversation();

      // Kirim ke POST /api/v1/conversations/{id}/messages
      const res = await fetch(`${API_BASE}/api/v1/conversations/${cid}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body:    JSON.stringify({ message: question.trim() }),
      });

      if (res.status === 401) { router.push("/login"); return; }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal mendapatkan jawaban.");
      }

      const data = await res.json();

      // Update judul conversation dari backend jika berubah
      if (data.conversation_title && data.conversation_title !== "New Conversation") {
        setConvTitle(generateTitle(data.conversation_title));
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? { ...m, loading: false, text: data.content, sources: data.sources, timestamp: new Date() }
            : m
        )
      );
    } catch (err) {
      if (err instanceof Error && err.message === "401") return;
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setMessages((prev) =>
        prev.map((m) =>
          m.loading ? { ...m, loading: false, text: `⚠ ${errMsg}`, timestamp: new Date() } : m
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

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Page header */}
      <div className="bg-[#131b2e] px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#40c2fd] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <div>
                <h1 className="text-xl font-extrabold text-white">KelanaAI Assistant</h1>
                <p className="text-[#7c839b] text-xs mt-0.5">
                  Powered by Amazon Bedrock RAG · trusted travel documents
                </p>
              </div>
            </div>
            {user && (
              <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/90 shrink-0 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#00668a] flex items-center justify-center text-white text-xs font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {user.username}
              </div>
            )}
          </div>

          {/* UX #1: Conversation title */}
          {convTitle && (
            <div className="mt-4 ml-12 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#40c2fd] text-sm">chat</span>
              <div className="flex-1">
                <p className="text-xs text-[#7c839b] uppercase tracking-wider font-semibold mb-0.5">
                  Topik percakapan
                </p>
                <p className="text-white font-semibold text-sm">{convTitle}</p>
              </div>
              {userMessageCount > 0 && (
                <span className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full shrink-0">
                  {userMessageCount} pertanyaan
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">

          {/* Chat card */}
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] overflow-hidden">

            {/* Chat header bar */}
            <div className="px-5 py-3 border-b border-[#eceef0] flex items-center justify-between bg-[#f2f4f6]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00668a]" />
                <span className="text-xs font-semibold text-[#45464d]">
                  {convTitle ?? "Percakapan Baru"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {convId && (
                  <span className="text-xs text-[#76777d] bg-[#ECFEFF] px-2 py-0.5 rounded-full border border-[#CFFAFE]">
                    ID #{convId}
                  </span>
                )}
                <span className="text-xs text-[#76777d]">{messages.length - 1} pesan</span>
              </div>
            </div>

            {/* Messages area */}
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold
                      ${msg.role === "user" ? "bg-[#131b2e] text-white" : "bg-[#ECFEFF] text-[#00668a]"}`}
                  >
                    {msg.role === "user"
                      ? (user?.username?.charAt(0).toUpperCase() ?? "U")
                      : <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    }
                  </div>

                  {/* Bubble + timestamp */}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm
                        ${msg.role === "user"
                          ? "bg-[#131b2e] text-white rounded-tr-none"
                          : "bg-[#f2f4f6] border border-[#e0e3e5] text-[#191c1e] rounded-tl-none"
                        }`}
                    >
                      {/* UX #3: Typing indicator */}
                      {msg.loading ? (
                        <div className="flex items-center gap-2 py-1">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-[#76777d] rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 bg-[#76777d] rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-[#76777d] rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                          <span className="text-xs text-[#76777d] italic">KelanaAI sedang mengetik…</span>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#e0e3e5]">
                              <p className="text-xs text-[#76777d] font-semibold mb-1 uppercase tracking-wide">Source</p>
                              {msg.sources.map((src) => (
                                <p key={src} className="text-xs text-[#00668a] font-mono flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">description</span>
                                  {src}
                                </p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* UX #4: Timestamp */}
                    {!msg.loading && (
                      <span className="text-[10px] text-[#76777d] px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="space-y-2">
              <p className="text-xs text-[#76777d] font-semibold uppercase tracking-wider px-1">
                Pertanyaan populer
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    disabled={loading}
                    className="text-xs px-3 py-2 rounded-xl bg-white border border-[#e0e3e5] text-[#45464d]
                      hover:border-[#00668a] hover:text-[#004d6a] hover:bg-[#ECFEFF] transition disabled:opacity-50"
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
              className="flex-1 px-4 py-3 bg-white border border-[#c6c6cd] rounded-xl text-sm text-[#191c1e]
                placeholder:text-[#76777d]/60 focus:outline-none focus:ring-2 focus:ring-[#00668a]
                focus:border-[#00668a] shadow-inner transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl ai-gradient text-white text-sm font-semibold
                transition shadow-md hover:opacity-90 disabled:bg-[#e0e3e5]
                disabled:text-[#76777d] disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">send</span>
                  Ask
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#76777d]">
            Answers are grounded in your uploaded travel documents · conversations saved automatically
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
