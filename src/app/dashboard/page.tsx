"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from "recharts";
import { getCongestionHex, cn } from "@/lib/utils";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Marquee } from "@/components/magicui/marquee";
import { Particles } from "@/components/magicui/particles";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

export default function DashboardPage() {
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/libraries");
        const data = await res.json();
        setLibraries(data.libraries || []);
      } catch (err) {
        console.error("Failed to fetch libraries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPI ê³ì°
  const totalLibraries = libraries.length;
  const currentUsers = libraries.reduce((sum: number, l: any) => sum + (l.totalUsed || 0), 0);
  const totalSeats = libraries.reduce((sum: number, l: any) => sum + (l.totalSeats || 0), 0);
  const totalAvailable = libraries.reduce((sum: number, l: any) => sum + (l.totalAvailable || 0), 0);
  const averageUsageRate = totalSeats > 0 ? Math.round((currentUsers / totalSeats) * 100 * 10) / 10 : 0;

  // ì§ì­ë³ ì´ì©ë¥  ê³ì°
  const regionMap = new Map<string, { total: number; used: number }>();
  libraries.forEach((lib: any) => {
    const addr = lib.address || "";
    const region = addr.split(" ")[0] || "ê¸°í";
    const prev = regionMap.get(region) || { total: 0, used: 0 };
    regionMap.set(region, { total: prev.total + (lib.totalSeats || 0), used: prev.used + (lib.totalUsed || 0) });
  });
  const regionUsage = Array.from(regionMap.entries())
    .map(([region, data]) => ({ region, usageRate: data.total > 0 ? Math.round((data.used / data.total) * 100) : 0 }))
    .sort((a, b) => b.usageRate - a.usageRate)
    .slice(0, 10);

  // í¼ì¡ëë³ ëìê´ ë¶ë¥
  const congestionCounts = {
    "ì¬ì ": libraries.filter((l: any) => l.congestionLevel === "ì¬ì ").length,
    "ë³´íµ": libraries.filter((l: any) => l.congestionLevel === "ë³´íµ").length,
    "í¼ì¡": libraries.filter((l: any) => l.congestionLevel === "í¼ì¡").length,
  };

  const pieData = [
    { name: "ì¬ì ", value: congestionCounts["ì¬ì "], color: "#22c55e" },
    { name: "ë³´íµ", value: congestionCounts["ë³´íµ"], color: "#f59e0b" },
    { name: "í¼ì¡", value: congestionCounts["í¼ì¡"], color: "#ef4444" },
  ];

  // ë¼ì´ë¸ íµê³ ë§í´
  const liveStats = libraries.slice(0, 6).map((lib: any) => ({
    icon: lib.congestionLevel === "í¼ì¡" ? "\uD83D\uDD25" : lib.congestionLevel === "ë³´íµ" ? "\u26A0\uFE0F" : "\u2728",
    text: `${lib.name} ${lib.congestionLevel} ${lib.seatUsageRate || 0}%`,
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{"ë°ì´í°ë¥¼ ë¶ë¬ì¤ë ì¤..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 relative overflow-hidden">
      <Particles className="absolute inset-0 -z-10" quantity={40} color="#3b82f6" size={0.6} speed={0.15} />

      {/* í¤ë */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {"\uD83D\uDCCA "}
            <AnimatedGradientText>{"ì êµ­ ëìê´ ë°ì´í° ëìë³´ë"}</AnimatedGradientText>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">{"ì êµ­ ê³µê³µëìê´ì ì¤ìê° ì´ì© íí©ê³¼ í¸ë ëë¥¼ íëì"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-semibold">{"ì¤ìê° ìë°ì´í¸ ì¤"}</span>
        </div>
      </div>

      {/* Live Marquee */}
      {liveStats.length > 0 && (
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
      )}

      {/* KPI ì¹´ë */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/10" gradientColor="rgba(37,99,235,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={8} colorFrom="#2563eb" colorTo="#818cf8" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83C\uDFDB\uFE0F"}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{"ì´ ëìê´"}</p>
            <p className="text-2xl font-bold text-slate-900">
              <NumberTicker value={totalLibraries} />
            </p>
          </div>
        </MagicCard>

        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-violet-500/10" gradientColor="rgba(139,92,246,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={8} colorFrom="#8b5cf6" colorTo="#d946ef" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83D\uDC65"}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{"íì¬ ì´ì©ì"}</p>
            <p className="text-2xl font-bold text-slate-900">
              <NumberTicker value={currentUsers} />
            </p>
          </div>
        </MagicCard>

        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-amber-500/10" gradientColor="rgba(245,158,11,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={8} colorFrom="#f59e0b" colorTo="#ef4444" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83D\uDCCA"}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{"íê·  ì´ì©ë¥ "}</p>
            <p className="text-2xl font-bold text-slate-900">
              <NumberTicker value={averageUsageRate} />%
            </p>
          </div>
        </MagicCard>

        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/10" gradientColor="rgba(16,185,129,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={8} colorFrom="#10b981" colorTo="#06b6d4" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\u2705"}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{"ì´ì© ê°ë¥ ì¢ì­"}</p>
            <p className="text-2xl font-bold text-slate-900">
              <NumberTicker value={totalAvailable} />
            </p>
          </div>
        </MagicCard>
      </div>

      {/* ì°¨í¸ ìì­ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ì§ì­ë³ ì´ì©ë¥  */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">{"ì§ì­ë³ ì´ì©ë¥ "}</h2>
          {regionUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="usageRate" name="ì´ì©ë¥ (%)" radius={[6, 6, 0, 0]}>
                  {regionUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCongestionHex(entry.usageRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-12">{"ë°ì´í° ìì"}</p>
          )}
        </div>

        {/* í¼ì¡ë ë¶í¬ */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">{"í¼ì¡ë ë¶í¬"}</h2>
          {pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-12">{"ë°ì´í° ìì"}</p>
          )}
        </div>
      </div>

      {/* ëìê´ ëª©ë¡ */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{"ëìê´ íí©"}</h2>
        {libraries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">{"ëìê´"}</th>
                  <th className="text-center py-3 px-2 text-slate-500 font-medium">{"í¼ì¡ë"}</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">{"ì´ì©ë¥ "}</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">{"ìì¬ì"}</th>
                </tr>
              </thead>
              <tbody>
                {libraries.slice(0, 20).map((lib: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-2 font-medium text-slate-800 truncate max-w-[200px]">{lib.name}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-semibold",
                          lib.congestionLevel === "ì¬ì " && "bg-green-100 text-green-700",
                          lib.congestionLevel === "ë³´íµ" && "bg-amber-100 text-amber-700",
                          lib.congestionLevel === "í¼ì¡" && "bg-red-100 text-red-700"
                        )}
                      >
                        {lib.congestionLevel || "-"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{lib.seatUsageRate || 0}%</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{lib.totalAvailable || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">{"ëìê´ ë°ì´í°ê° ììµëë¤"}</p>
        )}
      </div>
    </div>
  );
}
