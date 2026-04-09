"use client";

import { useState, useEffect, useRef } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance } from "@/lib/types";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MagicCard } from "@/components/magicui/magic-card";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Particles } from "@/components/magicui/particles";

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
          const lines = chunk.split("\n");
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
      setMessages((prev) => [...prev, { role: "assistant", content: "\uC8C4\uC1A1\uD569\uB2C8\uB2E4. AI \uC11C\uBE44\uC2A4\uC5D0 \uC77C\uC2DC\uC801\uC778 \uBB48\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const quickQuestions = [
    "\uC9C0\uAE08 \uAC00\uC7A5 \uC5EC\uC720\uB85C\uC6B4 \uB3C4\uC11C\uAD00 \uCD94\uCC9C\uD574\uC918",
    "\uC57C\uAC04\uC5D0 \uC6B4\uC601\uD558\uB294 \uB3C4\uC11C\uAD00 \uC54C\uB424\uC918",
    "\uC11C\uC6B8\uC5D0\uC11C WiFi\uB418\uB294 \uC870\uC6A9\uD55C \uB3C4\uC11C\uAD00\uC748?",
    "\uC8FC\uCC28 \uAC00\uB2A5\uD55C \uB3C4\uC11C\uAD00 \uCD94\uCC9C\uD574\uC918",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
      {/* Background particles */}
      <Particles className="absolute inset-0 -z-10" quantity={30} color="#6366f1" size={0.8} speed={0.2} />

      <div className="text-center mb-4 sm:mb-6 animate-fade-up">
        <AnimatedShinyText className="text-2xl sm:text-3xl font-bold gradient-text-purple mb-1 sm:mb-2" shimmerWidth={150}>
          {"\uD83E\uDD16 AI \uB3C4\uC11C\uAD00 \uCD94\uCC9C"}
        </AnimatedShinyText>
        <p className="text-xs sm:text-base text-slate-500">{"AI\uAC00 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD558\uC5EC \uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4"}</p>
      </div>

      <div className="flex gap-2 mb-6 justify-center">
        <ShimmerButton
          onClick={() => setActiveTab("ai")}
          className={cn("px-5 py-2.5 text-sm font-bold", activeTab === "ai" ? "" : "opacity-50")}
          shimmerColor="rgba(255,255,255,0.2)"
          background={activeTab === "ai" ? "linear-gradient(110deg, #7c3aed, #4f46e5, #7c3aed)" : "linear-gradient(110deg, #94a3b8, #64748b, #94a3b8)"}
        >
          {"\u2728 AI \uCD94\uCC9C"}
        </ShimmerButton>
        <ShimmerButton
          onClick={() => setActiveTab("list")}
          className={cn("px-5 py-2.5 text-sm font-bold", activeTab === "list" ? "" : "opacity-50")}
          shimmerColor="rgba(255,255,255,0.2)"
          background={activeTab === "list" ? "linear-gradient(110deg, #7c3aed, #4f46e5, #7c3aed)" : "linear-gradient(110deg, #94a3b8, #64748b, #94a3b8)"}
        >
          {"\uD83D\uDCCB \uCD94\uCC9C \uBAA9\uB85D"}
        </ShimmerButton>
      </div>

      {activeTab === "ai" && (
        <div className="animate-fade-up">
          <MagicCard className="glass rounded-2xl overflow-hidden mb-4" gradientColor="rgba(124,58,237,0.08)">
            <div className="relative">
              <BorderBeam size={250} duration={15} colorFrom="#7c3aed" colorTo="#2563eb" />
              <div className="h-[350px] sm:h-[450px] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 relative">
                    <div className="text-5xl mb-4 animate-float">{"\uD83E\uDD16"}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{"AI \uB3C4\uC11C\uAD00 \uCD94\uCC9C \uC5B4\uC2DC\uC2A4\uD134\uD2B8"}</h3>
                    <p className="text-sm text-slate-500 mb-6">{"\uC804\uAD6D " + mockLibraries.length + "\uAC1C \uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD558\uC5EC"}<br />{"\uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD574\uB4DC\uB9BD\uB2C8\uB2E4."}</p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                      {quickQuestions.map((q) => (
                        <button key={q} onClick={() => { setInput(q); setTimeout(() => { const btn = document.getElementById("send-btn"); if (btn) btn.click(); }, 100); }} className="px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-full transition-all hover:scale-105 hover:shadow-md">{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")} style={{ animationDelay: `${idx * 50}ms` }}>
                    {msg.role === "assistant" && (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md animate-scale-in">AI</div>)}
                    <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap animate-scale-in", msg.role === "user" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md shadow-md" : "bg-white/80 text-slate-800 rounded-bl-md shadow-sm border border-slate-100")}>
                      {msg.content}
                      {msg.role === "assistant" && msg.content === "" && isAiLoading && (
                        <span className="inline-flex gap-1">
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </div>
                    {msg.role === "user" && (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">{"\uB098"}</div>)}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-slate-200/60 p-3">
                <div className="flex gap-2">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder={"\uC5B4\uB5A4 \uB3C4\uC11C\uAD00\uC744 \uCC3E\uACE0 \uACC4\uC2E0\uAC00\uC694?"} className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all" disabled={isAiLoading} />
                  <ShimmerButton
                    id="send-btn"
                    onClick={sendMessage}
                    disabled={isAiLoading || !input.trim()}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-bold shrink-0 disabled:opacity-50"
                    shimmerColor="rgba(255,255,255,0.2)"
                    background="linear-gradient(110deg, #7c3aed, #4f46e5, #7c3aed)"
                  >
                    {isAiLoading ? "..." : "\uC804\uC1A1"}
                  </ShimmerButton>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">{"AI\uAC00 " + mockLibraries.length + "\uAC1C \uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC88C\uC11D\uC918 \uB370\uC774\uD130\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4 \u2022 Powered by OpenAI"}</p>
              </div>
            </div>
          </MagicCard>
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

      <MagicCard className="mt-8 glass rounded-2xl p-6 animate-fade-up" gradientColor="rgba(124,58,237,0.06)">
        <div className="relative">
          <h3 className="font-bold text-slate-900 mb-4">{"\uD83D\uDCA1 AI \uC778\uC0AC\uC774\uD2B8"}</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>{"\u2713 \uC804\uAD6D " + mockLibraries.length + "\uAC1C \uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC88C\uC11D \uD604\uD669\uC744 \uBD84\uC11D\uD569\uB2C8\uB2E4"}</p>
            <p>{"\u2713 GPT-4o mini \uBAA8\uB378\uC774 \uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4"}</p>
            <p>{"\u2713 \uC2DC\uC124, \uD63C\uC7A1\uB3C4, \uC6B4\uC601\uC2DC\uAC04 \uB4F1\uC744 \uC885\uD569 \uACE0\uB824\uD569\uB2C8\uB2E4"}</p>
          </div>
        </div>
      </MagicCard>
    </div>
  );
}

function RecommendCard({ library, rank, delay }: { library: LibraryWithDistance & { score: number }; rank: number; delay: number }) {
  const color = getCongestionColor(library.congestionLevel);
  const scoreColor = library.score >= 85 ? "text-emerald-600" : library.score >= 70 ? "text-amber-600" : "text-red-600";
  const scoreBg = library.score >= 85 ? "from-emerald-600 to-emerald-700" : library.score >= 70 ? "from-amber-600 to-amber-700" : "from-red-600 to-red-700";

  return (
    <div style={{ animationDelay: `${delay}ms` }} className="animate-fade-up">
      <MagicCard className="glass rounded-2xl overflow-hidden" gradientColor="rgba(124,58,237,0.06)">
        <a href={`/library/${library.id}`} className="block p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${scoreBg} text-white flex items-center justify-center flex-shrink-0 shadow-lg text-sm sm:text-lg font-bold group-hover:scale-110 transition-transform`}>#{rank}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{library.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{library.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn("inline-block px-3 py-1 text-xs font-bold rounded-full shadow-sm", color.light, color.text)}>{library.congestionLevel}</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">{"\uC801\uD569\uB3C4"}</span>
                  <span className={`text-sm font-bold ${scoreColor}`}>{library.score}/100</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full bg-gradient-to-r ${scoreBg} rounded-full transition-all duration-500 shadow-sm`} style={{ width: `${library.score}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                {library.rooms.slice(0, 2).map((room) => {
                  const roomColor = getCongestionColor(room.congestionLevel);
                  return (
                    <div key={room.name} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600 font-medium w-20 truncate">{room.name}</span>
                      <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                        <div className={cn("h-full rounded-full transition-all duration-500 shadow-sm", roomColor.bg)} style={{ width: `${room.congestionPercent}%` }} />
                      </div>
                      <span className={cn("font-bold w-12 text-right", roomColor.text)}>{room.availableSeats}/{room.totalSeats}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {library.nightOperation && <Tag>{"\uD83C\uDF19 \uC57C\uAC04"}</Tag>}
                {library.accessible && <Tag>{"\u267F \uC811\uADFC"}</Tag>}
                {library.reservable && <Tag>{"\uD83D\uDCDD \uC608\uC57D"}</Tag>}
                {library.wifi && <Tag>{"\uD83D\uDCF6 \uC640\uC774\uD30C\uC774"}</Tag>}
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </a>
      </MagicCard>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full hover:bg-violet-100 hover:text-violet-700 transition-colors">{children}</span>;
}
