"use client";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { mockDashboardKPI, mockHourlyTrend, mockRegionUsage, mockWeeklyHeatmap } from "@/lib/mock-data";
import { getCongestionHex, cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📊 전국 도서관 데이터 대시보드</h1>
          <p className="text-sm text-slate-500 mt-1">전국 공공도서관의 실시간 이용 현황과 트렌드를 한눈에</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          실시간 업데이트 중
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon="🏛️" label="전국 도서관 수" value={`${mockDashboardKPI.totalLibraries.toLocaleString()}개`} sub="실시간 연동 중" trend="+12" />
        <KPICard icon="👥" label="현재 총 이용자" value={`${mockDashboardKPI.currentUsers.toLocaleString()}명`} sub="현재 착석 중" trend="+8.2%" positive />
        <KPICard icon="📊" label="전국 평균 이용률" value={`${mockDashboardKPI.averageUsageRate}%`} sub="보통 수준" gauge={mockDashboardKPI.averageUsageRate} />
        <KPICard icon="💺" label="전국 잔여좌석" value={`${mockDashboardKPI.totalAvailableSeats.toLocaleString()}석`} sub={`총 ${mockDashboardKPI.totalSeats.toLocaleString()}석 중`} trend="-2.1%" />
      </div>

      {/* 차트 Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* 시간대별 트렌드 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-900 mb-4">⏰ 시간대별 이용률 트렌드</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockHourlyTrend} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number, name: string) => [`${v}%`, name === "today" ? "오늘" : "지난주"]} />
              <Legend formatter={(v) => (v === "today" ? "오늘" : "지난주 평균")} />
              <Area type="monotone" dataKey="today" stroke="#3b82f6" strokeWidth={2.5} fill="url(#todayGrad)" name="today" />
              <Area type="monotone" dataKey="lastWeek" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" name="lastWeek" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 지역별 이용률 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-900 mb-4">🗺️ 지역별 이용률 비교</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockRegionUsage.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 12 }} width={40} />
              <Tooltip formatter={(v: number) => [`${v}%`, "이용률"]} />
              <Bar dataKey="usageRate" radius={[0, 6, 6, 0]} barSize={18}>
                {mockRegionUsage.slice(0, 10).map((entry, i) => (
                  <Cell key={i} fill={getCongestionHex(entry.usageRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 히트맵 */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">📅 요일 × 시간대 혼잡도 패턴</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-center gap-1 mb-1 pl-10">
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[10px] text-slate-400">
                  {i % 2 === 0 ? `${6 + i}시` : ""}
                </div>
              ))}
            </div>
            {mockWeeklyHeatmap.map((row) => (
              <div key={row.day} className="flex items-center gap-1 mb-1">
                <div className="w-8 text-sm text-slate-600 font-medium text-right mr-1">{row.day}</div>
                {row.hours.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 h-7 rounded-sm transition-colors duration-200 cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: getCongestionHex(val) }}
                    title={`${row.day} ${6 + i}시: ${val}%`}
                  />
                ))}
              </div>
            ))}
            <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-slate-500">
              <span>여유</span>
              {[10, 30, 50, 70, 90].map((v) => (
                <div key={v} className="w-5 h-3 rounded-sm" style={{ backgroundColor: getCongestionHex(v) }} />
              ))}
              <span>혼잡</span>
            </div>
          </div>
        </div>
      </div>

      {/* 랭킹 Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* 인기 도서관 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-900 mb-4">🏆 실시간 인기 도서관 TOP 5</h3>
          <div className="space-y-3">
            {[
              { rank: "🥇", name: "국립중앙도서관", region: "서울", rate: 95 },
              { rank: "🥈", name: "강남구립도서관", region: "서울", rate: 92 },
              { rank: "🥉", name: "용산도서관", region: "서울", rate: 90 },
              { rank: "4", name: "해운대도서관", region: "부산", rate: 88 },
              { rank: "5", name: "수원시립도서관", region: "경기", rate: 86 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 text-center font-bold">{item.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name} <span className="text-slate-400 font-normal">({item.region})</span></p>
                </div>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.rate}%`, backgroundColor: getCongestionHex(item.rate) }} />
                </div>
                <span className="text-sm font-bold w-10 text-right" style={{ color: getCongestionHex(item.rate) }}>{item.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 여유 도서관 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-900 mb-4">💺 실시간 여유 도서관 TOP 5</h3>
          <div className="space-y-3">
            {[
              { rank: "🥇", name: "세종시립도서관", region: "세종", rate: 22, seats: 120 },
              { rank: "🥈", name: "마포중앙도서관", region: "서울", rate: 25, seats: 90 },
              { rank: "🥉", name: "제주도립도서관", region: "제주", rate: 28, seats: 85 },
              { rank: "4", name: "춘천시립도서관", region: "강원", rate: 30, seats: 72 },
              { rank: "5", name: "송파구립도서관", region: "서울", rate: 35, seats: 87 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 text-center font-bold">{item.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name} <span className="text-slate-400 font-normal">({item.region})</span></p>
                </div>
                <span className="text-xs text-green-600 font-medium">잔여 {item.seats}석</span>
                <span className="text-sm font-bold text-green-600 w-10 text-right">{item.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실시간 피드 */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 mb-3">📢 실시간 알림</h3>
        <div className="space-y-2">
          {[
            { icon: "🟢", text: "마포중앙도서관 종합열람실에 자리가 났습니다 (잔여 90석)", time: "2분 전" },
            { icon: "🔴", text: "강남구립도서관 제2열람실이 만석에 가까워지고 있습니다 (잔여 2석)", time: "5분 전" },
            { icon: "🟡", text: "용산도서관 열람실 혼잡도가 높아지고 있습니다 (92%)", time: "8분 전" },
            { icon: "🟢", text: "송파구립도서관 노트북존에 여유가 생겼습니다 (잔여 22석)", time: "12분 전" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
              <span className="mt-0.5">{item.icon}</span>
              <p className="flex-1 text-sm text-slate-700">{item.text}</p>
              <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================
// KPI 카드 컴포넌트
// ========================
function KPICard({ icon, label, value, sub, trend, positive, gauge }: {
  icon: string; label: string; value: string; sub: string;
  trend?: string; positive?: boolean; gauge?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
            positive || (trend.startsWith("+") && !trend.includes("-"))
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      {gauge !== undefined && (
        <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${gauge}%`, backgroundColor: getCongestionHex(gauge) }} />
        </div>
      )}
    </div>
  );
}
