"use client";

import { useState, useEffect, useRef } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState<(LibraryWithDistance & { score: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ai" | "list">("ai");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const scored = mockLibraries.map((lib) => ({
        ...lib,
        score: Math.round(Math.random() * 40 + 60),
      }));
      setRecommendations(scored.sort((a, b) => b.score - a.score));
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const sendMessage = async () => {
    if (!input.trim() || isAiLoading) return;
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!response.ok) throw new Error("AI \uC751\uB2F5 \uC2E4\uD328");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                assistantContent += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                  return updated;
                });
              } catch { /* skip */ }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "\uC8C4\uC1A1\uD569\uB2C8\uB2E4. AI \uC11C\uBE44\uC2A4\uC5D0 \uC77C\uC2DC\uC801\uC778 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694." }]);
    } finally {
      setIsAiLoading(false);
    }
  };
  const quickQuestions = [
    "\uC9C0\uAE08 \uAC00\uC7A5 \uC5EC\uC720\uB85C\uC6B4 \uB3C4\uC11C\uAD00 \uCD94\uCC9C\uD574\uC918",
    "\uC57C\uAC04\uC5D0 \uC6B4\uC601\uD558\uB294 \uB3C4\uC11C\uAD00 \uC54C\uB824\uC918",
    "\uC11C\uC6B8\uC5D0\uC11C WiFi\uB418\uB294 \uC870\uC6A9\uD55C \uB3C4\uC11C\uAD00\uC740?",
    "\uC8FC\uCC28 \uAC00\uB2A5\uD55C \uB3C4\uC11C\uAD00 \uCD94\uCC9C\uD574\uC918",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="text-center mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text mb-2">\uD83E\uDD16 AI \uB3C4\uC11C\uAD00 \uCD94\uCC9C</h1>
        <p className="text-slate-500">AI\uAC00 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD558\uC5EC \uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4</p>
      </div>
      <div className="flex gap-2 mb-6 justify-center">
        <button onClick={() => setActiveTab("ai")} className={cn("px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300", activeTab === "ai" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200" : "glass text-slate-600 hover:text-slate-900")}>
          \u2728 AI \uCD94\uCC9C
        </button>
        <button onClick={() => setActiveTab("list")} className={cn("px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300", activeTab === "list" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200" : "glass text-slate-600 hover:text-slate-900")}>
          \uD83D\uDCCB \uCD94\uCC9C \uBAA9\uB85D
        </button>
      </div>
      {activeTab === "ai" && (
        <div className="animate-slide-up">
          <div className="glass rounded-2xl overflow-hidden mb-4">
            <div className="h-[450px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">\uD83E\uDD16</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">AI \uB3C4\uC11C\uAD00 \uCD94\uCC9C \uC5B4\uC2DC\uC2A4\uD134\uD2B8</h3>
                  <p className="text-sm text-slate-500 mb-6">\uC804\uAD6D {mockLibraries.length}\uAC1C \uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD558\uC5EC<br />\uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD574\uB4DC\uB9BD\uB2C8\uB2E4.</p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                    {quickQuestions.map((q) => (
                      <button key={q} onClick={() => { setInput(q); setTimeout(() => { const btn = document.getElementById("send-btn"); if (btn) btn.click(); }, 100); }} className="px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-full transition-colors">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">AI</div>)}
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap", msg.role === "user" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md shadow-md" : "bg-white/80 text-slate-800 rounded-bl-md shadow-sm border border-slate-100")}>
                    {msg.content}
                    {msg.role === "assistant" && msg.content === "" && isAiLoading && (
                      <span className="inline-flex gap-1">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                  {msg.role === "user" && (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">\uB098</div>)}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-slate-200/60 p-3">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="\uC5B4\uB5A4 \uB3C4\uC11C\uAD00\uC744 \uCC3E\uACE0 \uACC4\uC2E0\uAC00\uC694?" className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all" disabled={isAiLoading} />
                <button id="send-btn" onClick={sendMessage} disabled={isAiLoading || !input.trim()} className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{isAiLoading ? "..." : "\uC804\uC1A1"}</button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">AI\uAC00 {mockLibraries.length}\uAC1C \uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC88C\uC11D \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4 \u2022 Powered by OpenAI</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (<div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse" />))}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((lib, idx) => (<RecommendCard key={lib.id} library={lib} rank={idx + 1} delay={idx * 100} />))}
            </div>
          )}
        </>
      )}

      <div className="mt-8 glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
        <h3 className="font-bold text-slate-900 mb-4">\uD83D\uDCA1 AI \uC778\uC0AC\uC774\uD2B8</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p>\u2713 \uC804\uAD6D {mockLibraries.length}\uAC1C \uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC88C\uC11D \uD604\uD669\uC744 \uBD84\uC11D\uD569\uB2C8\uB2E4</p>
          <p>\u2713 GPT-4o mini \uBAA8\uB378\uC774 \uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4</p>
          <p>\u2713 \uC2DC\uC124, \uD63C\uC7A1\uB3C4, \uC6B4\uC601\uC2DC\uAC04 \uB4F1\uC744 \uC885\uD569 \uACE0\uB824\uD569\uB2C8\uB2E4</p>
        </div>
      </div>
    </div>
  );
}
function RecommendCard({ library, rank, delay }: { library: LibraryWithDistance & { score: number }; rank: number; delay: number }) {
  const color = getCongestionColor(library.congestionLevel);
  const scoreColor = library.score >= 85 ? "text-emerald-600" : library.score >= 70 ? "text-amber-600" : "text-red-600";
  const scoreBg = library.score >= 85 ? "from-emerald-600 to-emerald-700" : library.score >= 70 ? "from-amber-600 to-amber-700" : "from-red-600 to-red-700";

  return (
    <div style={{ animationDelay: \`\${delay}ms\` }} className="animate-slide-up">
      <a href={\`/library/\${library.id}\`} className="glass rounded-2xl p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 block">
        <div className="flex items-start gap-4">
          <div className={\`w-14 h-14 rounded-full bg-gradient-to-br \${scoreBg} text-white flex items-center justify-center flex-shrink-0 shadow-lg text-lg font-bold\`}>#{rank}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{library.name}</h3>
                <p className="text-xs text-slate-500 truncate">{library.address}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={cn("inline-block px-3 py-1 text-xs font-bold rounded-full shadow-sm", color.light, color.text)}>{library.congestionLevel}</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600">\uC801\uD569\uB3C4</span>
                <span className={\`text-sm font-bold \${scoreColor}\`}>{library.score}/100</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className={\`h-full bg-gradient-to-r \${scoreBg} rounded-full transition-all duration-500 shadow-sm\`} style={{ width: \`\${library.score}%\` }} />
              </div>
            </div>
            <div className="space-y-2">
              {library.rooms.slice(0, 2).map((room) => {
                const roomColor = getCongestionColor(room.congestionLevel);
                return (
                  <div key={room.name} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-medium w-20 truncate">{room.name}</span>
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                      <div className={cn("h-full rounded-full transition-all duration-500 shadow-sm", roomColor.bg)} style={{ width: \`\${room.congestionPercent}%\` }} />
                    </div>
                    <span className={cn("font-bold w-12 text-right", roomColor.text)}>{room.availableSeats}/{room.totalSeats}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {library.nightOperation && <Tag>\uD83C\uDF19 \uC57C\uAC04</Tag>}
              {library.accessible && <Tag>\u267F \uC811\uADFC</Tag>}
              {library.reservable && <Tag>\uD83D\uDCDD \uC608\uC57D</Tag>}
              {library.wifi && <Tag>\uD83D\uDCF6 \uC640\uC774\uD30C\uC774</Tag>}
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </a>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full">{children}</span>;
}
