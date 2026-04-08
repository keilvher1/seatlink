"use client";

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from "recharts";
import { mockDashboardKPI, mockHourlyTrend, mockRegionUsage, mockWeeklyHeatmap } from "@/lib/mock-data";
import { getCongestionHex, cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{"\uD83D\uDCCA"} {"\uC804\uAD6D \uB3C4\uC11C\uAD00 \uB370\uC774\uD130 \uB300\uC2DC\uBCF4\uB4DC"}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">{"\uC804\uAD6D \uACF5\uACF5\uB3C4\uC11C\uAD00\uC758 \uC2E4\uC2DC\uAC04 \uC774\uC6A9 \uD604\uD669\uACFC \uD2B8\uB80C\uB4DC\uB97C \uD55C\uB208\uC5D0"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-semibold">{"\uC2E4\uC2DC\uAC04 \uC5C5\uB370\uC774\uD2B8 \uC911"}</span>
        </div>
      </div>

      {/* KPI 카드 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon="🏛️" label="전국 도서관 수" value={`${mockDashboardKPI.totalLibraries.toLocaleString()}개`} sub="실시간 연동 중" trend="+12" color="blue" />
        <KPICard icon="👥" label="현재 총 이용자" value={`${mockDashboardKPI.currentUsers.toLocaleString()}명`} sub="현재 착석 중" trend="+8.2%" positive color="emerald" />
        <KPICard icon="📊" label="전국 평균 이용률" value={`${mockDashboardKPI.averageUsageRate}%`} sub="보통 수준" gauge={mockDashboardKPI.averageUsageRate} color="indigo" />
        <KPICard icon="💺" label="전국 잔여좌석" value={`${mockDashboardKPI.totalAvailableSeats.toLocaleString()}석`} sub={`총 ${mockDashboardKPI.totalSeats.toLocaleString()}석 중`} trend="-2.1%" color="amber" />
      </div>

      {/* 차트 그리드 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* 시간대별 트렌드 */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-bold text-slate-900 mb-4 text-lg">⏰ 시간대별 이용률 트렌드</h3>
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
              <Tooltip 
                contentStyle={{ 
                  background: "rgba(255,255,255,0.95)", 
                  border: "1px solid rgba(100,116,139,0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="usageRate" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTrend)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 지역별 이용률 */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <h3 className="font-bold text-slate-900 mb-4 text-lg">🗺️ 지역별 이용률</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRegionUsage} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="region" stroke="#64748b" style={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} height={50} />
              <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: "rgba(255,255,255,0.95)", 
                  border: "1px solid rgba(100,116,139,0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                }}
              />
              <Bar dataKey="usageRate" radius={[12, 12, 0, 0]}>
                {mockRegionUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.usageRate > 70 ? "#ef4444" : entry.usageRate > 50 ? "#f59e0b" : "#22c55e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 핀단 섹션 */}
      <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <h3 className="font-bold text-slate-900 mb-4 text-lg">📈 요일별 혼잡도 히트맵</h3>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {mockWeeklyHeatmap.map((item, idx) => {
            const avg = item.hours.reduce((a: number, b: number) => a + b, 0) / item.hours.length;
            const intensity = avg;
            const color = intensity < 33 ? "bg-emerald-400" : intensity < 66 ? "bg-amber-400" : "bg-red-400";
            return (
              <div key={idx} className="text-center">
                <div className={cn("w-full aspect-square rounded-md sm:rounded-lg shadow-md transition-all hover:scale-110 cursor-pointer", color, "opacity-70 hover:opacity-100")} title={`${item.day} ${Math.round(avg)}%`} />
                <p className="text-[10px] sm:text-xs text-slate-600 mt-1 sm:mt-2 font-medium">{item.day} {Math.round(avg)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================
// KPI 카드 컴포넌트
// ============================
interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  trend?: string;
  positive?: boolean;
  gauge?: number;
  color?: "blue" | "emerald" | "indigo" | "amber";
}

function KPICard({ icon, label, value, sub, trend, positive, gauge, color = "blue" }: KPICardProps) {
  const colorClasses = {
    blue: "from-blue-600 to-blue-700",
    emerald: "from-emerald-600 to-emerald-700",
    indigo: "from-indigo-600 to-indigo-700",
    amber: "from-amber-600 to-amber-700",
  };

  const shadowClasses = {
    blue: "shadow-blue-500/20",
    emerald: "shadow-emerald-500/20",
    indigo: "shadow-indigo-500/20",
    amber: "shadow-amber-500/20",
  };

  return (
    <div className={`glass rounded-2xl p-4 hover:scale-105 transition-all duration-300 shadow-lg ${shadowClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className={cn("text-xs font-bold px-2 py-1 rounded-full", positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-1 sm:mb-2">{label}</p>
      <p className={`text-lg sm:text-2xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent mb-1 sm:mb-2`}>{value}</p>
      <p className="text-xs text-slate-600">{sub}</p>
      
      {gauge !== undefined && (
        <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 rounded-full`}
            style={{ width: `${gauge}%` }}
          />
        </div>
      )}
    </div>
  );
}
