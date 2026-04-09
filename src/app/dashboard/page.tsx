"use client";

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from "recharts";
import { mockDashboardKPI, mockHourlyTrend, mockRegionUsage, mockWeeklyHeatmap } from "@/lib/mock-data";
import { getCongestionHex, cn } from "@/lib/utils";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Marquee } from "@/components/magicui/marquee";

const liveStats = [
  { icon: "\uD83D\uDCDA", text: "\uC11C\uC6B8\uC911\uC559\uB3C4\uC11C\uAD00 \uC794\uC5EC 86\uC11D" },
  { icon: "\uD83D\uDD25", text: "\uAC15\uB0A8\uAD6C\uB9BD\uB3C4\uC11C\uAD00 \uD63C\uC7A1 95%" },
  { icon: "\u2728", text: "\uC5EC\uC758\uB3C4\uC5ED\uC12C\uB3C4\uC11C\uAD00 \uC5EC\uC720 \uC0C1\uD0DC" },
  { icon: "\uD83C\uDF19", text: "\uC11C\uC6B8\uB300\uD559\uAD50 \uC911\uC559\uB3C4\uC11C\uAD00 \uC57C\uAC04 \uC6B4\uC601\uC911" },
  { icon: "\uD83D\uDE80", text: "\uB300\uC804\uD55C\uBC24\uB3C4\uC11C\uAD00 \uC88C\uC11D \uC608\uC57D \uAC00\uB2A5" },
  { icon: "\uD83C\uDF1F", text: "\uBD80\uC0B0\uC2DC\uB9BD\uC2DC\uBBFC\uB3C4\uC11C\uAD00 \uC624\uB298 \uBC29\uBB38\uC790 520\uBA85" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 relative">
      {/* í¤ë */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-fade-up">
        <div>
          <AnimatedShinyText className="text-2xl sm:text-3xl font-bold gradient-text" shimmerWidth={150}>
            {"\uD83D\uDCCA"} {"\uC804\uAD6D \uB3C4\uC11C\uAD00 \uB370\uC774\uD130 \uB300\uC2DC\uBCF4\uB4DC"}
          </AnimatedShinyText>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">{"\uC804\uAD6D \uACF5\uACF5\uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC774\uC6A9 \uD604\uD669\uACFC \uD2B8\uB80C\uB4DC\uB97C \uD55C\uB208\uC5D0"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-semibold">{"\uC2E4\uC2DC\uAC04 \uC5C5\uB370\uC774\uD2B8 \uC911"}</span>
        </div>
      </div>

      {/* Live Marquee */}
      <div className="mb-6 rounded-xl overflow-hidden glass-subtle py-2">
        <Marquee pauseOnHover className="[--duration:25s]">
          {liveStats.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-4 text-sm font-medium text-slate-700 whitespace-nowrap">
              <span>{s.icon}</span>
              <span>{s.text}</span>
              <span className="text-slate-300 mx-2">|</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* KPI îmäë ê·¸ë¦¬ë - Magic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/10" gradientColor="rgba(37,99,235,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={8} colorFrom="#2563eb" colorTo="#818cf8" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83C\uDFDB\uFE0F"}</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">+12</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-1 sm:mb-2">{"\uC804\uAD6D \uB3C4\uC11C\uAD00 \uC218"}</p>
            <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1 sm:mb-2">
              <NumberTicker value={mockDashboardKPI.totalLibraries} delay={200} />{"\uAC1C"}
            </p>
            <p className="text-xs text-slate-600">{"\uC2E4\uC2DC\uAC04 \uC5F0\uB3D9 \uC911"}</p>
          </div>
        </MagicCard>

        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/10" gradientColor="rgba(16,185,129,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={10} colorFrom="#10b981" colorTo="#34d399" delay={2} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83D\uDC65"}</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">+8.2%</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-1 sm:mb-2">{"\uD604\uC7AC \uCD1D \uC774\uC6A9\uC790"}</p>
            <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-1 sm:mb-2">
              <NumberTicker value={mockDashboardKPI.currentUsers} delay={400} />{"\uBA85"}
            </p>
            <p className="text-xs text-slate-600">{"\uD604\uC7AC \uCC29\uC11D \uC911"}</p>
          </div>
        </MagicCard>

        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/10" gradientColor="rgba(99,102,241,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={12} colorFrom="#6366f1" colorTo="#a78bfa" delay={4} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83D\uDCCA"}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-1 sm:mb-2">{"\uC804\uAD6D \uD3C9\uADF5 \uC774\uC6A9\uB960"}</p>
            <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent mb-1 sm:mb-2">
              <NumberTicker value={mockDashboardKPI.averageUsageRate} delay={600} decimalPlaces={1} />%
            </p>
            <p className="text-xs text-slate-600">{"\uBCF4\uD1B5 \uC218\uC900"}</p>
            <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-700 transition-all duration-500 rounded-full" style={{ width: `${mockDashboardKPI.averageUsageRate}%` }} />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-amber-500/10" gradientColor="rgba(245,158,11,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={14} colorFrom="#f59e0b" colorTo="#fbbf24" delay={6} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83D\uDCBA"}</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">-2.1%</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-1 sm:mb-2">{"\uC804\uAD6D \uC794\uC5EC\uC88C\uC11D"}</p>
            <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent mb-1 sm:mb-2">
              <NumberTicker value={mockDashboardKPI.totalAvailableSeats} delay={800} />{"\uC11D"}
            </p>
            <p className="text-xs text-slate-600">{"\uCD1D "}{mockDashboardKPI.totalSeats.toLocaleString()}{"\uC11D \uC911"}</p>
          </div>
        </MagicCard>
      </div>

      {/* ì°¨í¸ ê·¸ë¦¬ë */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <MagicCard className="glass rounded-2xl p-6 animate-fade-up" gradientColor="rgba(37,99,235,0.08)">
          <div className="relative">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\u23F0"} {"\uC2DC\uAC04\uB300\uBCC4 \uC774\uC6A9\uB960 \uD2B8\uB80C\uB4DC"}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockHourlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis stroke="#64748b" style={{ fontSize: 10 }} width={35} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(100,116,139,0.2)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="usageRate" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MagicCard>

        <MagicCard className="glass rounded-2xl p-6 animate-fade-up" gradientColor="rgba(99,102,241,0.08)">
          <div className="relative">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\uD83D\uDDFA\uFE0F"} {"\uC9C0\uC5ED\uBCC4 \uC774\uC6A9\uB960"}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockRegionUsage} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="region" stroke="#64748b" style={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} height={50} />
                <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(100,116,139,0.2)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="usageRate" radius={[12, 12, 0, 0]}>
                  {mockRegionUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.usageRate > 70 ? "#ef4444" : entry.usageRate > 50 ? "#f59e0b" : "#22c55e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MagicCard>
      </div>

      {/* íí¸ë§µ */}
      <MagicCard className="glass rounded-2xl p-6 animate-fade-up" gradientColor="rgba(37,99,235,0.06)">
        <div className="relative">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\uD83D\uDCC8"} {"\uC694\uC77C\uBCC4 \uD63C\uC7A1\uB3C4 \uD788\uD2B8\uB9F5"}</h3>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {mockWeeklyHeatmap.map((item, idx) => {
              const avg = item.hours.reduce((a: number, b: number) => a + b, 0) / item.hours.length;
              const intensity = avg;
              const color = intensity < 33 ? "bg-emerald-400" : intensity < 66 ? "bg-amber-400" : "bg-red-400";
              return (
                <div key={idx} className="text-center group">
                  <div className={cn("w-full aspect-square rounded-md sm:rounded-lg shadow-md transition-all hover:scale-110 cursor-pointer group-hover:shadow-lg", color, "opacity-70 hover:opacity-100")} title={`${item.day} ${Math.round(avg)}%`} />
                  <p className="text-[10px] sm:text-xs text-slate-600 mt-1 sm:mt-2 font-medium">{item.day} {Math.round(avg)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </MagicCard>
    </div>
  );
}
