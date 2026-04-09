"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { mockLibraries, mockPrediction, mockWeeklyHeatmap, mockBikeStations, mockBuses, mockAccessibleTransport, mockReviews } from "@/lib/mock-data";
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

  const library = mockLibraries.find((l) => l.id === id) || mockLibraries[0];

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-24 md:pb-0">
      {/* ìë¨ ë¤ë¹ */}
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

      {/* ëìê´ ì ë³´ ì¹´ë */}
      <MagicCard className="glass-subtle m-4 rounded-2xl" gradientColor="rgba(37,99,235,0.06)">
        <div className="px-4 py-5 space-y-3 relative">
          <BorderBeam size={200} duration={16} colorFrom="#2563eb" colorTo="#a855f7" />
          <p className="text-sm text-slate-700 font-medium">{"\uD83D\uDCCD"} {library.address}</p>
          <p className="text-sm text-slate-700 font-medium">{"\uD83D\uDD50"} {library.operatingHours.weekday}
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

      {/* í­ */}
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

      {/* í­ ì½íì¸  */}
      <div className="px-4 py-4">
        {activeTab === "\uC5F4\uB78C\uC2E4 \uD604\uD669" && <RoomStatusTab library={library} />}
        {activeTab === "AI \uC608\uCE21" && <PredictionTab />}
        {activeTab === "\uC774\uB3D9\uC218\uB2E8" && <TransportTab />}
        {activeTab === "\uB9AC\uBDF0" && <ReviewTab />}
      </div>
    </div>
  );
}

function RoomStatusTab({ library }: { library: typeof mockLibraries[0] }) {
  const totalPercent = Math.round((library.totalUsed / library.totalSeats) * 100);

  return (
    <div className="space-y-4 animate-fade-up">
      {library.rooms.map((room, idx) => {
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

      {/* ì ì²´ ìì½ */}
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
      <div>
        <h3 className="font-bold text-slate-900 mb-4">{"\uD83D\uDCCA AI \uD63C\uC7A1\uB3C4 \uC608\uCE21 (\uC624\uB298)"}</h3>
        <MagicCard className="glass rounded-2xl p-4" gradientColor="rgba(37,99,235,0.06)">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockPrediction} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <defs>
                <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" />
              <Tooltip formatter={(value: number) => [`${value}%`, "\uD63C\uC7A1\uB3C4"]} contentStyle={{ borderRadius: 16, border: "1px solid rgba(100,116,139,0.2)", backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }} />
              <ReferenceLine x="13:00" stroke="#2563eb" strokeDasharray="5 5" strokeWidth={2} label={{ value: "\uD604\uC7AC", fill: "#2563eb", fontSize: 11, offset: 10 }} />
              <Area type="monotone" dataKey="congestion" stroke="#3b82f6" strokeWidth={3} fill="url(#congestionGradient)" dot={(props: any) => { const { cx, cy, payload } = props; return (<circle key={payload.hour} cx={cx} cy={cy} r={4} fill={getCongestionHex(payload.congestion)} stroke="white" strokeWidth={2} className="shadow-md" />); }} />
            </AreaChart>
          </ResponsiveContainer>
        </MagicCard>
      </div>

      <MagicCard className="glass rounded-2xl p-5 border-l-4 border-blue-600" gradientColor="rgba(37,99,235,0.06)">
        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2 text-lg">{"\u2728 AI \uBD84\uC11D \uC778\uC0AC\uC774\uD2B8"}</h4>
        <p className="text-slate-700 leading-relaxed font-medium">
          {"\uC624\uB298"} <span className="font-bold gradient-text">14:00~15:00</span> {"\uC2DC\uAC04\uB300\uAC00 \uAC00\uC7A5 \uC5EC\uC720\uB85C\uC6B8 \uAC83\uC73C\uB85C \uC608\uC0C1\uB429\uB2C8\uB2E4."}
          {" \uD604\uC7AC \uCD94\uC138 \uAE30\uC900 \uC57D"} <span className="font-bold text-emerald-600">35{"\uC11D"}</span>{"\uC758 \uC794\uC5EC\uC88C\uC11D\uC774 \uC608\uC0C1\uB429\uB2C8\uB2E4."}
        </p>
        <p className="text-slate-600 mt-3 font-medium">
          {"\uD83D\uDCA1 \uC9C0\uAE08 \uCD9C\uBC1C\uD558\uBA74 \uB3C4\uCC29 \uC608\uC0C1 \uC2DC\uC810(12\uBD84 \uD6C4) \uD63C\uC7A1\uB3C4:"}
          <span className="inline-block ml-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">{"58% (\uBCF4\uD1B5)"}</span>
        </p>
      </MagicCard>

      <div>
        <h3 className="font-bold text-slate-900 mb-4">{"\uD83D\uDCC5 \uC694\uC77C\uBCC4 \uD63C\uC7A1\uB3C4 \uD328\uD134"}</h3>
        <MagicCard className="glass rounded-2xl p-4 overflow-x-auto" gradientColor="rgba(37,99,235,0.04)">
          <div className="min-w-[500px]">
            <div className="flex items-center gap-0.5 mb-2">
              <div className="w-8" />
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[9px] text-slate-500 font-medium">
                  {i % 2 === 0 ? `${6 + i}\uC2DC` : ""}
                </div>
              ))}
            </div>
            {mockWeeklyHeatmap.map((row) => (
              <div key={row.day} className="flex items-center gap-0.5 mb-1">
                <div className="w-8 text-xs text-slate-600 font-semibold">{row.day}</div>
                {row.hours.map((val, i) => (
                  <div key={i} className="flex-1 aspect-square rounded transition-all hover:scale-110 shadow-sm hover:shadow-md cursor-pointer" style={{ backgroundColor: getCongestionHex(val) }} title={`${row.day} ${6 + i}\uC2DC: ${val}%`} />
                ))}
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-600">
              <span className="font-medium">{"\uC5EC\uC720"}</span>
              {[20, 40, 60, 80, 95].map((v) => (
                <div key={v} className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: getCongestionHex(v) }} />
              ))}
              <span className="font-medium">{"\uD63C\uC7A1"}</span>
            </div>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}

function TransportTab() {
  return (
    <div className="space-y-4 animate-fade-up">
      <MagicCard className="glass rounded-2xl p-5 border-l-4 border-emerald-600" gradientColor="rgba(16,185,129,0.06)">
        <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4 text-lg">{"\uD83D\uDEB2 \uACF5\uC601\uC790\uC804\uAC70"}</h3>
        {mockBikeStations.map((s) => (
          <div key={s.id} className="mb-4 last:mb-0">
            <p className="text-sm text-emerald-800 font-semibold">{s.name} ({Math.round(s.distance * 1000)}m)</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm" style={{ width: `${(s.availableBikes / s.totalDocks) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-emerald-700 w-16 text-right">{s.availableBikes}/{s.totalDocks}{"\uB300"}</span>
            </div>
          </div>
        ))}
      </MagicCard>

      <MagicCard className="glass rounded-2xl p-5 border-l-4 border-blue-600" gradientColor="rgba(37,99,235,0.06)">
        <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4 text-lg">{"\uD83D\uDE8C \uC2DC\uB0B4\uBC84\uC2A4"}</h3>
        <p className="text-xs text-blue-600 font-medium mb-3">{"\uC815\uB958\uC7A5: "}{mockBuses[0]?.stopName} ({Math.round((mockBuses[0]?.stopDistance || 0) * 1000)}m)</p>
        <div className="space-y-2">
          {mockBuses.map((bus) => (
            <div key={bus.routeNumber} className="flex items-center justify-between glass rounded-xl px-4 py-3 hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold rounded-lg shadow-md">{bus.routeNumber}</span>
                <span className="text-sm text-slate-700 font-medium">{bus.stopName}</span>
              </div>
              <span className={cn("text-sm font-bold", bus.arrivalMinutes <= 3 ? "text-emerald-600" : bus.arrivalMinutes <= 10 ? "text-amber-600" : "text-slate-500")}>
                {bus.arrivalMinutes}{"\uBD84 \uD6C4"}
              </span>
            </div>
          ))}
        </div>
      </MagicCard>

      <MagicCard className="glass rounded-2xl p-5 border-l-4 border-purple-600" gradientColor="rgba(147,51,234,0.06)">
        <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-4 text-lg">{"\u267F \uAD50\uD1B5\uC57D\uC790 \uC774\uB3D9\uC9C0\uC6D4"}</h3>
        <p className="text-sm text-slate-700 font-medium">{mockAccessibleTransport.centerName}</p>
        <p className="text-sm text-slate-700 mt-2 font-medium">
          {"\uC774\uC6A9\uAC00\uB2A5 \uCC28\uB7C9: "}<span className="font-bold gradient-text"><NumberTicker value={mockAccessibleTransport.availableVehicles} />{"\uB300"}</span>
          <span className="text-slate-500"> / {mockAccessibleTransport.totalVehicles}{"\uB300"}</span>
        </p>
        <p className="text-sm text-slate-700 mt-2 font-medium">{"\uC608\uC0C1 \uB300\uAE30\uC2DC\uAC04: \uC57D "}<span className="font-bold">{mockAccessibleTransport.estimatedWait}{"\uBD84"}</span></p>
        <ShimmerButton className="mt-4 w-full py-3 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #7c3aed, #6d28d9, #7c3aed)">
          {"\uC774\uB3D9\uC9C0\uC6D0 \uC694\uCCAD\uD558\uAE30"}
        </ShimmerButton>
      </MagicCard>
    </div>
  );
}

function ReviewTab() {
  const libReviews = mockReviews.slice(0, 3);
  const ratings = [
    { label: "\uC2DC\uC124 \uCCAD\uACB0\uB3C4", score: 4.1 },
    { label: "\uC18C\uC74C \uC218\uC900", score: 4.5, note: "\uC870\uC6A9\uD568" },
    { label: "\uC88C\uC11C \uD3B8\uC548\uD568", score: 3.8 },
    { label: "\uCF58\uC13C\uD2B8/\uC640\uC774\uD30C\uC774", score: 4.0 },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <MagicCard className="glass rounded-2xl py-6 px-4 text-center" gradientColor="rgba(245,158,11,0.08)">
        <div className="relative">
          <div className="text-5xl font-bold gradient-text mb-2"><NumberTicker value={4.2} decimalPlaces={1} delay={200} /></div>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className={cn("w-6 h-6 transition", s <= 4 ? "text-amber-400" : "text-slate-300")} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-slate-600 font-medium">238{"\uAC1C \uB9AC\uBDF0"}</p>
        </div>
      </MagicCard>

      <MagicCard className="glass rounded-2xl p-5" gradientColor="rgba(37,99,235,0.04)">
        <h4 className="font-bold text-slate-900 mb-4">{"\uD83D\uDCC8 \uD3C9\uAC00 \uD56D\uBAA9"}</h4>
        <div className="space-y-4">
          {ratings.map((r) => (
            <div key={r.label} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 flex-1">{r.label}</span>
                <span className="text-sm font-bold gradient-text">{r.score}</span>
                {r.note && <span className="text-xs text-emerald-600 font-semibold">({r.note})</span>}
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm" style={{ width: `${(r.score / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </MagicCard>

      <div className="space-y-3">
        {libReviews.map((review, idx) => (
          <MagicCard key={review.id} className="glass rounded-2xl" gradientColor="rgba(37,99,235,0.03)">
            <div className="p-4 animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {review.userName[0]}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-900">{review.userName}</span>
                  <span className="text-xs text-slate-500 ml-2">{review.createdAt}</span>
                </div>
                <span className="px-2.5 py-0.5 badge-pill bg-slate-200 text-slate-700">{review.mood}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{review.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                <button className="hover:text-blue-600 font-medium transition">{"\uD83D\uDC4D"} {review.helpful}</button>
                <button className="hover:text-blue-600 font-medium transition">{"\uD83D\uDCAC"} {review.comments}</button>
                <button className="hover:text-blue-600 font-medium transition">{"\uD83D\uDCCC \uC800\uC7A5"}</button>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>

      <ShimmerButton className="w-full py-3.5 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)">
        {"\uB9AC\uBDF0 \uC791\uC131\uD558\uAE30"}
      </ShimmerButton>
    </div>
  );
}
