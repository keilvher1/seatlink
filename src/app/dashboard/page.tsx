"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from "recharts";
import { getCongestionHex, cn } from "@/lib/utils";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
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

  // KPI \uACC4\uC0B0
  const totalLibraries = libraries.length;
  const currentUsers = libraries.reduce((sum: number, l: any) => sum + (l.totalUsed || 0), 0);
  const totalSeats = libraries.reduce((sum: number, l: any) => sum + (l.totalSeats || 0), 0);
  const totalAvailable = libraries.reduce((sum: number, l: any) => sum + (l.totalAvailable || 0), 0);
  const averageUsageRate = totalSeats > 0 ? Math.round((currentUsers / totalSeats) * 100 * 10) / 10 : 0;

  // \uC9C0\uC5ED\uBCC4 \uC774\uC6A9\uB960 \uACC4\uC0B0
  const regionMap = new Map<string, { total: number; used: number }>();
  libraries.forEach((lib: any) => {
    const addr = lib.address || "";
    const region = addr.split(" ")[0] || "\uAE30\uD0C0";
    const prev = regionMap.get(region) || { total: 0, used: 0 };
    regionMap.set(region, { total: prev.total + (lib.totalSeats || 0), used: prev.used + (lib.totalUsed || 0) });
  });
  const regionUsage = Array.from(regionMap.entries())
    .map(([region, data]) => ({ region, usageRate: data.total > 0 ? Math.round((data.used / data.total) * 100) : 0 }))
    .sort((a, b) => b.usageRate - a.usageRate)
    .slice(0, 10);

  // \uD63C\uC7A1\uB3C4\uBCC4 \uB3C4\uC11C\uAD00 \uBD84\uB958
  const congestionCounts = {
    "\uC5EC\uC720": libraries.filter((l: any) => l.congestionLevel === "\uC5EC\uC720").length,
    "\uBCF4\uD1B5": libraries.filter((l: any) => l.congestionLevel === "\uBCF4\uD1B5").length,
    "\uD63C\uC7A1": libraries.filter((l: any) => l.congestionLevel === "\uD63C\uC7A1").length,
  };

  // \uB77C\uC774\uBE0C \uD1B5\uACC4 \uB9C8\uD034
  const liveStats = libraries.slice(0, 6).map((lib: any) => ({
    icon: lib.congestionLevel === "\uD63C\uC7A1" ? "\uD83D\uDD25" : lib.congestionLevel === "\uBCF4\uD1B5" ? "\u26A0\uFE0F" : "\u2728",
    text: `${lib.name} ${lib.congestionLevel} ${lib.seatUsageRate || 0}%`,
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{"\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 relative overflow-hidden">
      {/* Background Effects */}
      <Particles className="absolute inset-0 -z-10" quantity={40} color="#3b82f6" size={0.6} speed={0.15} />
      {/* \uD5E4\uB354 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {"\uD83D\uDCCA "}
            <AnimatedGradientText>{"\uC804\uAD6D \uB3C4\uC11C\uAD00 \uB370\uC774\uD130 \uB300\uC2DC\uBCF4\uB4DC"}</AnimatedGradientText>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">{"\uC804\uAD6D \uACF5\uACF5\uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC774\uC6A9 \uD604\uD669\uACFC \uD2B8\uB80C\uB4DC\uB97C \uD55C\uB208\uC5D0"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-semibold">{"\uC2E4\uC2DC\uAC04 \uC5C5\uB370\uC774\uD2B8 \uC911"}</span>
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

      {/* KPI \uCE74\uB4DC */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MagicCard className="glass p-4 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/10" gradientColor="rgba(37,99,235,0.12)">
          <div className="relative">
            <BorderBeam size={120} duration={8} colorFrom="#2563eb" colorTo="#818cf8" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{"\uD83C\uDFDB\uFE0F"}</span>
            </div>
            <p className="text-[10px] sm:text-xs textÛ]KMLÛ[YY][HXLHÛNXLÈPÎ
PQ
PÐÍPÌLP×PQPÌNOÜÛ\ÜÓ[YOH^[ÈÛN^LÛXÛËYÜYY[]Ë\ÛKXYKMËXYKMÌËXÛ\]^^][Ü\[XLHÛNXL[X\XÚÙ\[YO^ÝÝ[X\Y\ßH[^O^ÌHÏÈPPÌPÈBÜÛ\ÜÓ[YOH^^È^\Û]KMÈPÌMPÌ×PPÌ
PÍQPÑHPÎLLHOÜÙ]ÓXYÚXÐØ\XYÚXÐØ\Û\ÜÓ[YOHÛ\ÜÈMÝ\ØØ[KLL
H[Ú][ÛX[\][ÛLÌÚYÝË[ÈÚYÝËY[Y\[MLÌLÜYY[ÛÛÜHØJMN
KLKLH]Û\ÜÓ[YOH[]]HÜ\X[HÚ^O^ÌLH\][Û^ÌLHÛÛÜÛOHÌLNHÛÛÜÏHÌÍÎNH[^O^ÌHÏ]Û\ÜÓ[YOH^][\Ë\Ý\\ÝYKX]ÙY[XLÈÜ[Û\ÜÓ[YOH^LÞÈQÑQÍHOÜÜ[Ù]Û\ÜÓ[YOH^VÌLHÛN^^È^\Û]KMLÛ[YY][HXLHÛNXLÈQ

PÍÐPÈPÑQPÍÍÍPÍNWPÍÎLOÜÛ\ÜÓ[YOH^[ÈÛN^LÛXÛËYÜYY[]Ë\ÛKY[Y\[MËY[Y\[MÌËXÛ\]^^][Ü\[XLHÛNXL[X\XÚÙ\[YO^ØÝ\[\Ù\ßH[^O^ÍHÏÈPN
HBÜÛ\ÜÓ[YOH^^È^\Û]KMÈQ

PÍÐPÈPÐÌWPÌLQPÎLLHOÜÙ]ÓXYÚXÐØ\XYÚXÐØ\Û\ÜÓ[YOHÛ\ÜÈMÝ\ØØ[KLL
H[Ú][ÛX[\][ÛLÌÚYÝË[ÈÚYÝËZ[YÛËMLÌLÜYY[ÛÛÜHØJNKLKLH]Û\ÜÓ[YOH[]]HÜ\X[HÚ^O^ÌLH\][Û^ÌLHÛÛÜÛOHÍÍHÛÛÜÏHØMÎH[^O^ÍHÏ]Û\ÜÓ[YOH^][\Ë\Ý\\ÝYKX]ÙY[XLÈÜ[Û\ÜÓ[YOH^LÞÈQÑQÐÐHOÜÜ[Ù]Û\ÜÓ[YOH^VÌLHÛN^^È^\Û]KMLÛ[YY][HXLHÛNXLÈPÎ
PQ
QÐÎWPQLPÍÍÍPÍNWPMOÜÛ\ÜÓ[YOH^[ÈÛN^LÛXÛËYÜYY[]Ë\ÛKZ[YÛËMËZ[YÛËMÌËXÛ\]^^][Ü\[XLHÛNXL[X\XÚÙ\[YO^Ø]\YÙU\ØYÙT]_H[^O^ÍHXÚ[X[XÙ\Ï^Ì_HÏBÜÛ\ÜÓ[YOH^^È^\Û]KMØ]\YÙU\ØYÙT]H
ÈPÍQP×PÍÌ]\YÙU\ØYÙT]HH
ÌÈPÑQPHQ
Ð×PÍÐLH^ÈPÌNPÎLOÜ]Û\ÜÓ[YOH]LÈLKHË\Û]KLÝ[YY[Ý\ÝËZY[]Û\ÜÓ[YOHY[ËYÜYY[]Ë\ÛKZ[YÛËMËZ[YÛËMÌ[Ú][ÛX[\][ÛMLÝ[YY[Ý[O^ÞÈÚY	Ø]\YÙU\ØYÙT]_IX_HÏÙ]Ù]ÓXYÚXÐØ\XYÚXÐØ\Û\ÜÓ[YOHÛ\ÜÈMÝ\ØØ[KLL
H[Ú][ÛX[\][ÛLÌÚYÝË[ÈÚYÝËX[X\MLÌLÜYY[ÛÛÜHØJ
KMNLKLH]Û\ÜÓ[YOH[]]HÜ\X[HÚ^O^ÌLH\][Û^ÌMHÛÛÜÛOHÙNYLÛÛÜÏHÙ[^O^ÍHÏ]Û\ÜÓ[YOH^][\Ë\Ý\\ÝYKX]ÙY[XLÈÜ[Û\ÜÓ[YOH^LÞÈQÑQÐHOÜÜ[Ù]Û\ÜÓ[YOH^VÌLHÛN^^È^\Û]KMLÛ[YY][HXLHÛNXLÈPÎ
PQ
PÍÎMPÍQP×PÎ×PÌLQOÜÛ\ÜÓ[YOH^[ÈÛN^LÛXÛËYÜYY[]Ë\ÛKX[X\MËX[X\MÌËXÛ\]^^][Ü\[XLHÛNXL[X\XÚÙ\[YO^ÝÝ[]Z[X_H[^O^ÎHÏÈPÌLQBÜÛ\ÜÓ[YOH^^È^\Û]KMÈPÑQ^ÝÝ[ÙX]ËÓØØ[TÝ[Ê
_^ÈPÌLQPÎLLHOÜÙ]ÓXYÚXÐØ\Ù]ËÊPÐÌQPQPPP×PÈ
ßB]Û\ÜÓ[YOHÜYÎÜYXÛÛËLØ\MXMËÊQ
Ð×PÍÐLWPÐÍP
QÑPÈ
ßBXYÚXÐØ\Û\ÜÓ[YOHÛ\ÜÈÝ[YLM[[X]KYYK]\ÜYY[ÛÛÜHØJÍËNKÍK
H]Û\ÜÓ[YOH[]]HÈÛ\ÜÓ[YOHÛXÛ^\Û]KNLXM^[ÈÈQÑQÐÐHHÈQ
Ð×PÍÐLWPÐÍP
QÑPÈOÚÏ]Û\ÜÓ[YOHÜYÜYXÛÛËLÈØ\M^XÙ[\]Û\ÜÓ[YOHMÛ\ÜË\ÝXHÝ[Y^]Û\ÜÓ[YOH^LÞÛXÛ^Y[Y\[M[X\XÚÙ\[YO^ØÛÛÙ\Ý[ÛÛÝ[ÖÈPÍQP×PÍÌ_H[^O^ÌHÏÙ]Û\ÜÓ[YOH^^È^\Û]KM]LHÛ[YY][HÈPÍQP×PÍÌOÜÙ]]Û\ÜÓ[YOHMÛ\ÜË\ÝXHÝ[Y^]Û\ÜÓ[YOH^LÞÛXÛ^X[X\M[X\XÚÙ\[YO^ØÛÛÙ\Ý[ÛÛÝ[ÖÈPÑQPH_H[^O^ÍHÏÙ]Û\ÜÓ[YOH^^È^\Û]KM]LHÛ[YY][HÈPÑQPHOÜÙ]]Û\ÜÓ[YOHMÛ\ÜË\ÝXHÝ[Y^]Û\ÜÓ[YOH^LÞÛXÛ^\YM[X\XÚÙ\[YO^ØÛÛÙ\Ý[ÛÛÝ[ÖÈQ
Ð×PÍÐLH_H[^O^ÍHÏÙ]Û\ÜÓ[YOH^^È^\Û]KM]LHÛ[YY][HÈQ
Ð×PÍÐLHOÜÙ]Ù]Ù]ÓXYÚXÐØ\ËÊPÎPÌPÍQQPÐÍPÍÍÍPÍNWPM
ßBÜYÚ[Û\ØYÙK[Ý	
XYÚXÐØ\Û\ÜÓ[YOHÛ\ÜÈÝ[YLM[[X]KYYK]\ÜYY[ÛÛÜHØJNKLK
H]Û\ÜÓ[YOH[]]HÈÛ\ÜÓ[YOHÛXÛ^\Û]KNLXM^[ÈÈQÑQWQLHÈPÎPÌPÍQQPÐÍPÍÍÍPÍNWPMOÚÏ\ÜÛÚ]PÛÛZ[\ÚYHL	HZYÚ^ÌÌO\Ú\]O^ÜYÚ[Û\ØYÙ_HX\Ú[^ÞÈÜ
KYÚLYLLÝÛN_OØ\\ÚX[ÜYÝÚÙQ\Ú\^OHÈÈÝÚÙOHØJLLMLÎKJHÏ^\È]RÙ^OHYÚ[ÛÝÚÙOHÍ
ÍÝ[O^ÞÈÛÚ^NL_H[ÛO^ËM
_H^[ÚÜH[[\[^ÌHZYÚ^ÍLHÏP^\ÈÝÚÙOHÍ
ÍÝ[O^ÞÈÛÚ^NL_HÏÛÛ\ÛÛ[Ý[O^ÞÈXÚÙÜÝ[ØJMKMKMKMJHÜ\\ÛÛYØJLLMLÎKHÜ\Y]\ÎLÞÚYÝÎ
ØJJH_HÏ\]RÙ^OH\ØYÙT]HY]\Ï^ÖÌLL_OÜYÚ[Û\ØYÙKX\

[K[^
HO
Ù[Ù^O^ØÙ[IÚ[^XH[^Ù[K\ØYÙT]H
ÌÈÙY


[K\ØYÙT]H
LÈÙNYLÌÍMYHHÏ
J_BÐ\Ð\Ú\Ô\ÜÛÚ]PÛÛZ[\Ù]ÓXYÚXÐØ\
_BÙ]Ù]
NÂB
