"use client";

import { useState, useEffect } from "react";
import { getCongestionColor, cn } from "@/lib/utils";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Marquee } from "@/components/magicui/marquee";
import { Particles } from "@/components/magicui/particles";

const alerts = [
  { id: 1, type: "warning", title: "\uD63C\uC7A1\uB3C4 90% \uCD08\uACFC \uB3C4\uC11C\uAD00 \uBC1C\uC0DD", time: "2\uBD84 \uC804", icon: "\u26A0\uFE0F" },
  { id: 2, type: "info", title: "\uC57C\uAC04 \uC6B4\uC601 \uB3C4\uC11C\uAD00 \uD655\uC778", time: "15\uBD84 \uC804", icon: "\uD83C\uDF19" },
  { id: 3, type: "success", title: "\uC2E0\uADDC \uB3C4\uC11C\uAD00 \uC5F0\uB3D9 \uC644\uB8CC", time: "1\uC2DC\uAC04 \uC804", icon: "\u2705" },
  { id: 4, type: "warning", title: "API \uC5F0\uACB0 \uBD88\uC548\uC815 \uAC10\uC9C0", time: "30\uBD84 \uC804", icon: "\uD83D\uDD27" },
  { id: 5, type: "info", title: "\uC8FC\uAC04 \uBCF4\uACE0\uC11C \uC0DD\uC131 \uC644\uB8CC", time: "2\uC2DC\uAC04 \uC804", icon: "\uD83D\uDCCA" },
];

const systemMetrics = [
  { label: "API \uC751\uB2F5\uC2DC\uAC04", value: "42ms", status: "good", icon: "\u26A1" },
  { label: "API \uC5F0\uACB0 \uC0C1\uD0DC", value: "\uC815\uC0C1", status: "good", icon: "\uD83D\uDCE1" },
  { label: "\uC2E4\uC2DC\uAC04 \uC5C5\uB370\uC774\uD2B8 \uC8FC\uAE30", value: "60\uCD08", status: "good", icon: "\uD83D\uDD04" },
  { label: "\uB370\uC774\uD130 \uC18C\uC2A4", value: "data.go.kr", status: "good", icon: "\uD83D\uDCBE" },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<"overview" | "libraries" | "alerts" | "settings">("overview");
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

  const totalLibraries = libraries.length;
  const crowdedLibraries = libraries.filter((l: any) => l.congestionLevel === "\uD63C\uC7A1").length;
  const normalLibraries = libraries.filter((l: any) => l.congestionLevel === "\uBCF4\uD1B5").length;
  const freeLibraries = libraries.filter((l: any) => l.congestionLevel === "\uC5EC\uC720").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 relative min-h-screen">
      {/* Background */}
      <Particles className="fixed inset-0 -z-10" quantity={40} color="#2563eb" size={0.6} speed={0.15} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-fade-up">
        <div>
          <AnimatedShinyText className="text-2xl sm:text-3xl font-bold gradient-text" shimmerWidth={150}>
            {"\uD83D\uDD27 \uAD00\uB9AC\uC790 \uB300\uC2DC\uBCF4\uB4DC"}
          </AnimatedShinyText>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{"\uC804\uAD6D \uB3C4\uC11C\uAD00 \uC2DC\uC2A4\uD15C \uBAA8\uB2C8\uD130\uB9C1 \uBC0F \uAD00\uB9AC"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-600 glass rounded-full px-3 py-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-semibold">{"\uC2DC\uC2A4\uD15C \uC815\uC0C1"}</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">{"\uB9C8\uC9C0\uB9C9 \uB3D9\uAE30: 30\uCD08 \uC804"}</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {(["\uAC1C\uC694", "\uB3C4\uC11C\uAD00 \uAD00\uB9AC", "\uC54C\uB9BC", "\uC124\uC815"] as const).map((tab, i) => {
          const sections = ["overview", "libraries", "alerts", "settings"] as const;
          const icons = ["\uD83D\uDCCA", "\uD83C\uDFDB\uFE0F", "\uD83D\uDD14", "\u2699\uFE0F"];
          return (
            <button
              key={tab}
              onClick={() => setActiveSection(sections[i])}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300",
                activeSection === sections[i]
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "glass text-slate-600 hover:text-slate-900 hover:scale-105"
              )}
            >
              {icons[i]} {tab}
            </button>
          );
        })}
      </div>

      {/* Overview Section */}
      {activeSection === "overview" && (
        <div className="space-y-6 animate-fade-up">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MagicCard className="glass p-5 hover:scale-105 transition-all duration-300" gradientColor="rgba(37,99,235,0.12)">
              <div className="relative">
                <BorderBeam size={100} duration={8} colorFrom="#2563eb" colorTo="#818cf8" />
                <span className="text-2xl">{"\uD83C\uDFDB\uFE0F"}</span>
                <p className="text-xs text-slate-500 font-medium mt-2">{"\uCD1D \uB3C4\uC11C\uAD00"}</p>
                <p className="text-2xl font-bold gradient-text mt-1">{loading ? "..." : <><NumberTicker value={totalLibraries} delay={200} />{"\uAC1C"}</>}</p>
              </div>
            </MagicCard>

            <MagicCard className="glass p-5 hover:scale-105 transition-all duration-300" gradientColor="rgba(239,68,68,0.12)">
              <div className="relative">
                <BorderBeam size={100} duration={10} colorFrom="#ef4444" colorTo="#f97316" delay={2} />
                <span className="text-2xl">{"\uD83D\uDD25"}</span>
                <p className="text-xs text-slate-500 font-medium mt-2">{"\uD63C\uC7A1 \uB3C4\uC11C\uAD00"}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{loading ? "..." : <><NumberTicker value={crowdedLibraries} delay={400} />{"\uAC1C"}</>}</p>
              </div>
            </MagicCard>

            <MagicCard className="glass p-5 hover:scale-105 transition-all duration-300" gradientColor="rgba(245,158,11,0.12)">
              <div className="relative">
                <BorderBeam size={100} duration={12} colorFrom="#f59e0b" colorTo="#fbbf24" delay={4} />
                <span className="text-2xl">{"\u26A0\uFE0F"}</span>
                <p className="text-xs text-slate-500 font-medium mt-2">{"\uBCF4\uD1B5 \uB3C4\uC11C\uAD00"}</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{loading ? "..." : <><NumberTicker value={normalLibraries} delay={600} />{"\uAC1C"}</>}</p>
              </div>
            </MagicCard>

            <MagicCard className="glass p-5 hover:scale-105 transition-all duration-300" gradientColor="rgba(34,197,94,0.12)">
              <div className="relative">
                <BorderBeam size={100} duration={14} colorFrom="#22c55e" colorTo="#4ade80" delay={6} />              <span className="text-2xl">{"\u2705"}</span>
                <p className="text-xs text-slate-500 font-medium mt-2">{"\uC5EC\uC720 \uB3C4\uC11C\uAD00"}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{loading ? "..." : <><NumberTicker value={freeLibraries} delay={800} />{"\uAC1C"}</>}</p>
              </div>
            </MagicCard>
          </div>

          {/* System Metrics */}
          <MagicCard className="glass rounded-2xl p-6" gradientColor="rgba(37,99,235,0.06)">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\u26A1 \uC2DC\uC2A4\uD15C \uC0C1\uD0DC"}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {systemMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center gap-3 glass-subtle rounded-xl p-3">
                  <span className="text-xl">{metric.icon}</span>
                  <div>
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className="text-sm font-bold text-slate-900">{metric.value}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </MagicCard>

          {/* Live Alert Marquee */}
          <MagicCard className="glass rounded-2xl overflow-hidden" gradientColor="rgba(37,99,235,0.04)">
            <div className="p-4">
              <h3 className="font-bold text-slate-900 mb-3">{"\uD83D\uDD14 \uC2E4\uC2DC\uAC04 \uC54C\uB9BC"}</h3>
              <Marquee pauseOnHover vertical className="h-[200px] [--duration:20s]">
                {alerts.map((alert) => (
                  <div key={alert.id} className={cn("flex items-start gap-3 p-3 rounded-xl mb-2 transition-all hover:scale-[1.01]",
                    alert.type === "warning" ? "bg-amber-50 border border-amber-200" :
                    alert.type === "success" ? "bg-emerald-50 border border-emerald-200" :
                    "bg-blue-50 border border-blue-200"
                  )}>
                    <span className="text-lg">{alert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </MagicCard>
        </div>
      )}

      {/* Libraries Management Section */}
      {activeSection === "libraries" && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-900">{"\uC804\uAD6D \uB3C4\uC11C\uAD00 \uBAA9\uB85D"}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{"\uCD1D "}{totalLibraries}{"\uAC1C \uB3C4\uC11C\uAD00"}</span>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">{"\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..."}</p>
            </div>
          ) : libraries.length === 0 ? (
            <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(37,99,235,0.04)">
              <p className="text-slate-600 font-medium">{"\uC5F0\uB3D9\uB41C \uB3C4\uC11C\uAD00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
            </MagicCard>
          ) : libraries.map((lib: any, idx: number) => {
            const color = getCongestionColor(lib.congestionLevel);
            const usagePercent = lib.totalSeats > 0 ? Math.round((lib.totalUsed / lib.totalSeats) * 100) : 0;
            return (
              <MagicCard key={lib.id} className="glass rounded-2xl overflow-hidden" gradientColor="rgba(37,99,235,0.04)">
                <div className="p-4 animate-fade-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-2 rounded-full self-stretch shadow-md", color.bg)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{lib.name}</h4>
                          <p className="text-xs text-slate-500 truncate">{lib.address}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn("px-2.5 py-1 text-xs font-bold rounded-full shadow-sm", color.light, color.text)}>
                            {lib.congestionLevel}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{usagePercent}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden shadow-inner mb-2">
                        <div className={cn("h-full rounded-full transition-all duration-500", color.bg)} style={{ width: `${usagePercent}%` }} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{"\uCD1C "}{lib.totalSeats}{"\uC11D"}</span>
                        <span>{"\uC794\uC5EC "}<span className="font-bold text-slate-700">{lib.totalAvailable}</span>{"\uC11D"}</span>
                        <span>{"\uBC29\uBB38\uC790 "}{lib.todayVisitors}{"\uBA85"}</span>
                        {lib.nightOperation && <span className="text-indigo-600 font-medium">{"\uD83C\uDF19 \uC57C\uAC04"}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            );
          })}
        </div>
      )}

      {/* Alerts Section */}
      {activeSection === "alerts" && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-900">{"\uC54C\uB9BC \uC13C\uD130"}</h3>
            <ShimmerButton className="px-4 py-2 text-xs" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)">
              {"\uBAA8\uB450 \uC77D\uC74C \uCC98\uB9AC"}
            </ShimmerButton>
          </div>

          {/* Alert Rules */}
          <MagicCard className="glass rounded-2xl p-5" gradientColor="rgba(37,99,235,0.06)">
            <h4 className="font-bold text-slate-900 mb-3">{"\uD83D\uDCCB \uC54C\uB9BC \uADDC\uCE59"}</h4>
            <div className="space-y-3">
              {[
                { rule: "\uD63C\uC7A1\uB3C4 90% \uC774\uC0C1 \uC2DC \uACBD\uACE0", enabled: true, type: "warning" },
                { rule: "API \uC5F0\uACB0 \uB04A\uAE40 \uC2DC \uC54C\uB9BC", enabled: true, type: "error" },
                { rule: "\uC2E0\uADDC \uB3C4\uC11C\uAD00 \uC5F0\uB3D9 \uC644\uB8CC \uC2DC \uC54C\uB9BC", enabled: true, type: "success" },
                { rule: "\uC8FC\uAC04 \uBCF4\uACE0\uC11C \uC0DD\uC131 \uC644\uB8CC \uC2DC \uC54C\uB9BC", enabledalse, type: "info" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between glass-subtle rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full",
                      item.type === "warning" ? "bg-amber-500" :
                      item.type === "error" ? "bg-red-500" :
                      item.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                    )} />
                    <span className="text-sm font-medium text-slate-700">{item.rule}</span>
                  </div>
                  <div className={cn("w-10 h-5 rounded-full transition-colors cursor-pointer flex items-center",
                    item.enabled ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                  )}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-md mx-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </MagicCard>

          {/* Alert History */}
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <MagicCard key={`${alert.id}-${idx}`} className="glass rounded-xl overflow-hidden" gradientColor={
                alert.type === "warning" ? "rgba(245,158,11,0.08)" :
                alert.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(37,99,235,0.08)"
              }>
                <div className="p-4 flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <span className="text-lg">{alert.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.time}</p>
                  </div>
                  <button className="text-xs text-blue-600 font-medium hover:text-blue-800 transition">{"\uD655\uC778"}</button>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      )}

      {/* Settings Section */}
      {activeSection === "settings" && (
        <div className="space-y-6 animate-fade-up">
          <MagicCard className="glass rounded-2xl p-6" gradientColor="rgba(37,99,235,0.06)">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\u2699\uFE0F \uC2DC\uC2A4\uD15C \uC124\uC815"}</h3>
            <div className="space-y-4">
              {[
                { label: "\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130 \uC5C5\uB370\uC774\uD2B8 \uC8FC\uAE30", value: "60\uCD08", type: "select" },
                { label: "\uD63C\uC7A1\uB3C4 \uACBD\uACE0 \uC784\uACC4\uAC12", value: "90%", type: "input" },
                { label: "\uC790\uB3D9 \uBCF4\uACE0\uC11C \uC0DD\uC131", value: true, type: "toggle" },
                { label: "API \uC5F0\uACB0 \uBAA8\uB2C8\uD130\uB9C1", value: true, type: "toggle" },
                { label: "\uC774\uBA54\uC77C \uC54C\uB9BC", value: false, type: "toggle" },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between glass-subtle rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{setting.label}</span>
                  {setting.type === "toggle" ? (
                    <div className={cn("w-10 h-5 rounded-full transition-colors cursor-pointer flex items-center",
                      setting.value ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                    )}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-md mx-0.5" />
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-blue-600">{setting.value as string}</span>
                  )}
                </div>
              ))}
            </div>
          </MagicCard>

          <MagicCard className="glass rounded-2xl p-6" gradientColor="rgba(37,99,235,0.06)">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\uD83D\uDD10 \uAD00\uB9AC\uC790 \uC815\uBCF4"}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 glass-subtle rounded-xl p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">{"\uAD00"}</div>
                <div>
                  <p className="font-bold text-slate-900">{"\uAD00\uB9AC\uC790"}</p>
                  <p className="text-xs text-slate-500">admin@seatlink.kr</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{"\uCD5C\uACE0 \uAD00\uB9AC\uC790"}</span>
              </div>
            </div>
          </MagicCard>

          <MagicCard className="glass rounded-2xl p-6" gradientColor="rgba(37,99,235,0.06)">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">{"\uD83D\uDCBE \uB370\uC774\uD130 \uAD00\uB9AC"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShimmerButton className="w-full py-3 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)">
                {"\uD83D\uDCC4 \uBCF4\uACE0\uC11C \uC0DD\uC131"}
              </ShimmerButton>
              <ShimmerButton className="w-full py-3 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #10b981, #059669, #10b981)">
                {"\uD83D\uDCE5 \uB370\uC774\uD130 \uB0B4\uBCF4\uB0B4\uAE30"}
              </ShimmerButton>
              <ShimmerButton className="w-full py-3 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #f59e0b, #d97706, #f59e0b)">
                {"\uD83D\uDD04 \uCE90\uC2DC \uCD08\uAE30\uD654"}
              </ShimmerButton>
              <ShimmerButton className="w-full py-3 text-sm" shimmerColor="rgba(255,255,255,0.2)" background="linear-gradient(110deg, #8b5cf6, #7c3aed, #8b5cf6)">
                {"\uD83D\uDEE0\uFE0F \uC2DC\uC2A4\uD15C \uC810\uAC80"}
              </ShimmerButton>
            </div>
          </MagicCard>
        </div>
      )}
    </div>
  );
}
