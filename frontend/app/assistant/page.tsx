"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

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

  const [conversations, setConversations] = useState<Conversation[]>([]);
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

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  async function loadConversations() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/conversations`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }

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

      // Reload conversation list
      loadConversations();

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

  function startNewConversation() {
    setConvId(null);
    setConvTitle(null);
    setMessages([
      {
        id: 0, role: "assistant",
        text: "Halo! Saya KelanaAI Assistant. Tanya apa saja tentang perjalananmu — Bali, Tokyo, Istanbul, tips budget, dan lainnya. Jawaban saya berdasarkan dokumen travel terpercaya. 🌍",
        timestamp: new Date(),
      },
    ]);
    nextId.current = 1;
  }

  async function loadConversation(id: number) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/conversations/${id}`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setConvId(data.id);
        setConvTitle(data.title);
        
        // Convert messages to UI format
        const uiMessages: Message[] = data.messages.map((m: any, idx: number) => ({
          id: idx,
          role: m.role,
          text: m.content,
          sources: m.sources,
          timestamp: new Date(m.created_at),
        }));
        
        setMessages(uiMessages.length > 0 ? uiMessages : [
          {
            id: 0, role: "assistant",
            text: "Halo! Saya KelanaAI Assistant. Tanya apa saja tentang perjalananmu.",
            timestamp: new Date(),
          },
        ]);
        nextId.current = uiMessages.length + 1;
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      {/* Conversation List Sidebar */}
      <aside className="w-80 bg-white border-r border-[#e0e3e5] h-screen sticky top-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#e0e3e5]">
          <button
            onClick={startNewConversation}
            className="w-full px-4 py-3 rounded-xl ai-gradient text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <span className="material-symbols-outlined text-[#76777d] text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                chat_bubble
              </span>
              <p className="text-sm text-[#76777d]">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left px-3 py-3 rounded-xl transition hover:bg-[#f5f7fa] ${
                  convId === conv.id ? "bg-[#ECFEFF] border border-[#40c2fd]/30" : "border border-transparent"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#00668a] text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#131b2e] truncate">{conv.title}</p>
                    <p className="text-xs text-[#76777d]">
                      {new Date(conv.created_at).toLocaleDateString("id-ID", { 
                        day: "numeric", 
                        month: "short" 
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white px-6 py-4 border-b border-[#e0e3e5] sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#40c2fd] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <div>
                <h1 className="text-lg font-bold text-[#131b2e]">
                  {convTitle ?? "New Conversation"}
                </h1>
                <p className="text-xs text-[#76777d]">
                  Powered by Amazon Bedrock RAG
                </p>
              </div>
            </div>
            {convId && (
              <span className="text-xs text-[#76777d] bg-[#ECFEFF] px-3 py-1.5 rounded-full border border-[#CFFAFE]">
                ID #{convId}
              </span>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div
              ref={chatContainerRef}
              className="space-y-5"
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
                          : "bg-white border border-[#e0e3e5] text-[#191c1e] rounded-tl-none shadow-sm"
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
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-[#e0e3e5] px-6 py-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto">
            {/* Suggested questions */}
            {messages.length <= 1 && (
              <div className="mb-4">
                <p className="text-xs text-[#76777d] font-semibold uppercase tracking-wider mb-2 px-1">
                  Pertanyaan populer
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAsk(q)}
                      disabled={loading}
                      className="text-xs px-3 py-2 rounded-xl bg-[#f5f7fa] border border-[#e0e3e5] text-[#45464d]
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

            <p className="text-center text-xs text-[#76777d] mt-3">
              Answers are grounded in your uploaded travel documents · conversations saved automatically
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
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
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
  );
}
