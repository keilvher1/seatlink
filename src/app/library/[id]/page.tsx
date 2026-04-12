"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getCongestionColor, getCongestionHex, cn } from "@/lib/utils";
import { MagicCard } from "@/components/magicui/magic-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const TABS = ["\uC5F4\uB78C\uC2E4 \uD604\uD669", "AI \uC608\uCE21", "\uC774\uB3D9\uC218\uB2E8", "\uB9AC\uBDF0"] as const;

export default function LibraryDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("\uC5F4\uB78C\uC2E4 \uD604\uD669");
  const [isFav, setIsFav] = useState(false);
  const [library, setLibrary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/libraries");
        const data = await res.json();
        const libs = data.libraries || [];
        const found = libs.find((l: any) => l.id === id);
        setLibrary(found || libs[0] || null);
      } catch (err) {
        console.error("Failed to fetch library:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{"\uB3C4\uC11C\uAD00 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..."}</p>
        </div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">{"\uB3C4\uC11C\uAD00 \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
          <a href="/" className="text-blue-600 mt-2 inline-block font-medium">{"\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-24 md:pb-0">
      {/* \uC0C1\uB2E8 \uB124\uBE44 */}
      <div className="sticky top-14 z-40 glass">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {"\uB4A4\uB85C"}
          </a>
          <h1 className="font-bold text-lg text-slate-900">{library.name}</h1>
          <button onClick={() => setIsFav(!isFav)} className="p-1.5 rounded-full hover:bg-red-50 transition transform hover:scale-110">
            <svg className={cn("w-6 h-6 transition", isFav ? "fill-red-500 text-red-500" : "text-slate-400")} fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* \uB3C4\uC11C\uAD00 \uC815\uBCF4 \uCE74\uB4DC */}
      <MagicCard className="glass-subtle m-4 rounded-2xl" gradientColor="rgba(37,99,235,0.06)">
        <div className="px-4 py-5 space-y-3 relative">
          <BorderBeam size={200} duration={16} colorFrom="#2563eb" colorTo="#a855f7" />
          <p className="text-sm text-slate-700 font-medium">{"\uD83D\uDCCD"} {library.address}</p>
          <p className="text-sm text-slate-700 font-medium">{"\uD83D\uDD50"} {library.operatingHours?.weekday || "N/A"}
            {library.nightOperation && <span className="ml-2 px-2.5 py-0.5 badge-success text-xs">{"\uD83C\uDF19 \uC57C\uAC04\uC6B4\uC601"}</span>}
          </p>
          <p className="text-sm text-slate-700 font-medium">{"\u260E\uFE0F"} {library.phone}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {library.accessible && <span className="badge-pill bg-purple-100 text-purple-700">{"\u267F \uC811\uADFC\uAC00\uB2A5"}</span>}
            {library.wifi && <span className="badge-pill bg-emerald-100 text-emerald-700">{"\uD83D\uDCF6 \uC640\uC774\uD30C\uC774"}</span>}
            {library.parking && <span className="badge-pill bg-amber-100 text-amber-700">{"\uD83C\uDD7F\uFE0F \uC8FC\uCC28\uAC00\uB2A5"}</span>}
            {library.reservable && <span className="badge-pill bg-cyan-100 text-cyan-700">{"\uD83D\uDCDD \uC608\uC57D\uAC00\uB2A5"}</span>}
          </div>
          <div className="pt-2 border-t border-slate-200/50">
            <p className="text-xs text-slate-600">{"\uC624\uB298 \uBC29\uBB38\uC790"} <span className="font-bold text-slate-900">{library.todayVisitors}{"\uBA85"}</span></p>
          </div>
        </div>
      </MagicCard>

      {/* \uD0ED */}
      <div className="sticky top-[104px] z-30 glass mx-4 rounded-t-2xl flex mt-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-xs sm:text-sm font-semibold transition-all duration-300",
              activeTab === tab
                ? "tab-active bg-gradient-to-b from-blue-50 to-transparent"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* \uD0ED \uCF58\uD150\uCE20 */}
      <div className="px-4 py-4">
        {activeTab === "\uC5F4\uB78C\uC2E4 \uD604\uD669" && <RoomStatusTab library={library} />}
        {activeTab === "AI \uC608\uCE21" && <PredictionTab />}
        {activeTab === "\uC774\uB3D9\uC218\uB2E8" && <TransportTab />}
        {activeTab === "\uB9AC\uBDF0" && <ReviewTab />}
      </div>
    </div>
  );
}

function RoomStatusTab({ library }: { library: any }) {
  const totalSeats = library.totalSeats || 1;
  const totalPercent = Math.round(((library.totalUsed || 0) / totalSeats) * 100);
  const rooms = library.rooms || [];

  if (rooms.length === 0) {
    return (
      <div className="space-y-4 animate-fade-up">
        <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(37,99,235,0.05)">
          <p className="text-slate-600 font-medium">{"\uC5F4\uB78C\uC2E4 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
          <p className="text-sm text-slate-500 mt-1">{"\uCD1D \uC88C\uC11D: "}{library.totalSeats || 0}{"\uC11D"}</p>
        </MagicCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {rooms.map((room: any, idx: number) => {
        const color = getCongestionColor(room.congestionLevel);
        return (
          <MagicCard key={room.name} className="glass rounded-2xl" gradientColor="rgba(37,99,235,0.05)">
            <div className="p-5 animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900">{room.name}</span>
                <span className={cn("px-3 py-1 text-xs font-bold rounded-full shadow-sm", color.light, color.text)}>
                  {room.congestionLevel}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden mb-3 shadow-inner">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 shadow-md congestion-bar-animated", color.bg)}
                  style={{ width: `${room.congestionPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">{"\uC0AC\uC6A9"} {room.usedSeats}{"\uC11D"} / {"\uCD1D"} {room.totalSeats}{"\uC11D"}</span>
                <span className={cn("font-bold text-lg", color.text)}>{"\uC794\uC5EC"} <NumberTicker value={room.availableSeats} delay={idx * 200} />{"\uC11D"}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{"\uB9C8\uC9C0\uB9C9 \uC5C5\uB370\uC774\uD2B8: "}{room.lastUpdated}</p>
            </div>
          </MagicCard>
        );
      })}

      {/* \uC804\uCCB4 \uC694\uC57D */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/30 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <h3 className="font-bold text-lg mb-4 relative z-10">{"\uD83D\uDCCA"} {"\uC804\uCCB4 \uC88C\uC11D \uD604\uD669"}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <svg className="w-24 h-24 sm:w-28 sm:h-28 -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={getCongestionHex(totalPercent)} strokeWidth="14" strokeDasharray={`${totalPercent * 2.64} ${264 - totalPercent * 2.64}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold"><NumberTicker value={totalPercent} delay={300} />%</span>
              <span className="text-xs text-slate-300 mt-1">{"\uC774\uC6A9\uB960"}</span>
            </div>
          </div>
          <div className="flex sm:flex-col gap-4 sm:gap-3 text-sm w-full sm:w-auto justify-center">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-0.5 sm:gap-4">
              <span className="text-slate-300 text-xs">{"\uCD1D \uC88C\uC11D"}</span>
              <span className="font-bold">{library.totalSeats}{"\uC11D"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-0.5 sm:gap-4">
              <span className="text-slate-300 text-xs">{"\uC0AC\uC6A9 \uC911"}</span>
              <span className="font-bold text-red-300">{library.totalUsed}{"\uC11D"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-0.5 sm:gap-4">
              <span className="text-slate-300 text-xs">{"\uC794\uC5EC"}</span>
              <span className="font-bold text-emerald-300"><NumberTicker value={library.totalAvailable} delay={500} />{"\uC11D"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionTab() {
  return (
    <div className="space-y-6 animate-fade-up">
      <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(37,99,235,0.06)">
        <div className="py-8">
          <span className="text-5xl mb-4 block">{"\uD83D\uDCCA"}</span>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{"AI \uD63C\uC7A1\uB3C4 \uC608\uCE21"}</h3>
          <p className="text-slate-600 font-medium">{"\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130 \uAE30\uBC18 AI \uC608\uCE21 \uC11C\uBE44\uC2A4\uB97C \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4."}</p>
          <p className="text-sm text-slate-500 mt-2">{"\uACE7 \uC2DC\uAC04\uB300\uBCC4 \uD63C\uC7A1\uB3C4 \uC608\uCE21\uACFC \uC694\uC77C\uBCC4 \uD328\uD134 \uBD84\uC11D\uC744 \uC81C\uACF5\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."}</p>
        </div>
      </MagicCard>
    </div>
  );
}

function TransportTab() {
  return (
    <div className="space-y-4 animate-fade-up">
      <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(16,185,129,0.06)">
        <div className="py-8">
          <span className="text-5xl mb-4 block">{"\uD83D\uDE8C"}</span>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{"\uC774\uB3D9\uC218\uB2E8 \uC815\uBCF4"}</h3>
          <p className="text-slate-600 font-medium">{"\uACF5\uC601\uC790\uC804\uAC70, \uC2DC\uB0B4\uBC84\uC2A4, \uAD50\uD1B5\uC57D\uC790 \uC774\uB3D9\uC9C0\uC6D0 \uC815\uBCF4\uB97C \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4."}</p>
          <p className="text-sm text-slate-500 mt-2">{"\uACE7 \uC2E4\uC2DC\uAC04 \uAD50\uD1B5 \uC815\uBCF4\uB97C \uC81C\uACF5\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."}</p>
        </div>
      </MagicCard>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className="space-y-5 animate-fade-up">
      <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(245,158,11,0.08)">
        <div className="py-8">
          <span className="text-5xl mb-4 block">{"\u2B50"}</span>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{"\uB9AC\uBDF0"}</h3>
          <p className="text-slate-600 font-medium">{"\uB3C4\uC11C\uAD00 \uB9AC\uBDF0 \uC11C\uBE44\uC2A4\uB97C \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4."}</p>
          <p className="text-sm text-slate-500 mt-2">{"\uACE7 \uC774\uC6A9\uC790 \uD6C4\uAE30\uC640 \uD3C9\uC810\uC744 \uC81C\uACF5\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."}</p>
        </div>
      </MagicCard>

      <ShimmerButton className="w-full py-3.5 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)">
        {"\uB9AC\uBDF0 \uC791\uC131\uD558\uAE30"}
      </ShimmerButton>
    </div>
  );
}
