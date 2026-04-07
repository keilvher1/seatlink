"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { mockLibraries, mockPrediction, mockWeeklyHeatmap, mockBikeStations, mockBuses, mockAccessibleTransport, mockReviews } from "@/lib/mock-data";
import { getCongestionColor, getCongestionHex, cn } from "@/lib/utils";

const TABS = ["열람실 현황", "AI 예측", "이동수단", "리뷰"] as const;

export default function LibraryDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("열람실 현황");
  const [isFav, setIsFav] = useState(false);

  const library = mockLibraries.find((l) => l.id === id) || mockLibraries[0];

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      {/* 상단 네비 */}
      <div className="sticky top-14 z-40 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">뒤로</span>
          </a>
          <h1 className="font-bold text-lg">{library.name}</h1>
          <button onClick={() => setIsFav(!isFav)} className="p-1.5 rounded-full hover:bg-slate-100 transition">
            <svg className={cn("w-6 h-6", isFav ? "fill-red-500 text-red-500" : "text-slate-400")} fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 도서관 정보 카드 */}
      <div className="px-4 py-4 space-y-2 border-b border-slate-100">
        <p className="text-sm text-slate-600">📍 {library.address}</p>
        <p className="text-sm text-slate-600">🕐 {library.operatingHours.weekday}
          {library.nightOperation && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">야간운영</span>}
        </p>
        <p className="text-sm text-slate-600">☎️ {library.phone}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {library.accessible && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">♿ 접근가능</span>}
          {library.wifi && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">📶 와이파이</span>}
          {library.parking && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">🅿️ 주차가능</span>}
          {library.reservable && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">📝 예약가능</span>}
        </div>
        <p className="text-sm text-slate-500 mt-1">오늘 방문자 <span className="font-semibold text-slate-700">{library.todayVisitors}명</span></p>
      </div>

      {/* 탭 */}
      <div className="sticky top-[105px] z-30 bg-white border-b border-slate-200 flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition",
              activeTab === tab ? "tab-active" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-4">
        {activeTab === "열람실 현황" && <RoomStatusTab library={library} />}
        {activeTab === "AI 예측" && <PredictionTab />}
        {activeTab === "이동수단" && <TransportTab />}
        {activeTab === "리뷰" && <ReviewTab />}
      </div>
    </div>
  );
}

// ========================
// 탭1: 열람실 현황
// ========================
function RoomStatusTab({ library }: { library: typeof mockLibraries[0] }) {
  const totalPercent = Math.round((library.totalUsed / library.totalSeats) * 100);
  const totalColor = getCongestionColor(library.congestionLevel);

  return (
    <div className="space-y-4">
      {library.rooms.map((room) => {
        const color = getCongestionColor(room.congestionLevel);
        return (
          <div key={room.name} className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900">{room.name}</span>
              <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", color.light, color.text)}>
                {room.congestionLevel}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className={cn("h-full rounded-full transition-all duration-700", color.bg)}
                style={{ width: `${room.congestionPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>사용 {room.usedSeats}석 / 총 {room.totalSeats}석</span>
              <span className="font-semibold">잔여 <span className={color.text}>{room.availableSeats}석</span></span>
            </div>
            <p className="text-xs text-slate-400 mt-1">마지막 업데이트: {room.lastUpdated}</p>
          </div>
        );
      })}

      {/* 전체 요약 */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
        <h3 className="font-bold text-sm mb-3">📊 전체 좌석 현황</h3>
        <div className="flex items-center gap-6">
          {/* 원형 게이지 */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={getCongestionHex(totalPercent)}
                strokeWidth="12"
                strokeDasharray={`${totalPercent * 2.64} ${264 - totalPercent * 2.64}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{totalPercent}%</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>총 좌석: <span className="font-semibold">{library.totalSeats}석</span></p>
            <p>사용 중: <span className="font-semibold">{library.totalUsed}석</span></p>
            <p>잔여: <span className="font-semibold text-green-400">{library.totalAvailable}석</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================
// 탭2: AI 예측
// ========================
function PredictionTab() {
  return (
    <div className="space-y-6">
      {/* 24시간 예측 차트 */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">📊 AI 혼잡도 예측 (오늘)</h3>
        <div className="bg-slate-50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockPrediction} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "혼잡도"]}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <ReferenceLine x="13:00" stroke="#2563eb" strokeDasharray="5 5" label={{ value: "현재", fill: "#2563eb", fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="congestion"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#congestionGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.hour}
                      cx={cx} cy={cy} r={3}
                      fill={getCongestionHex(payload.congestion)}
                      stroke="white" strokeWidth={1.5}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <h4 className="font-bold text-blue-900 flex items-center gap-1.5 mb-2">
          ✨ AI 분석 인사이트
        </h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          오늘 <span className="font-bold">14:00~15:00</span> 시간대가 가장 여유로울 것으로 예상됩니다.
          현재 추세 기준 약 <span className="font-bold">35석</span>의 잔여좌석이 예상됩니다.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          💡 지금 출발하면 도착 예상 시점(12분 후) 혼잡도: <span className="font-semibold">58% (보통)</span>
        </p>
      </div>

      {/* 요일별 히트맵 */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">📅 요일별 혼잡도 패턴</h3>
        <div className="bg-slate-50 rounded-xl p-4 overflow-x-auto">
          <div className="min-w-[500px]">
            {/* 시간 헤더 */}
            <div className="flex items-center gap-0.5 mb-1">
              <div className="w-8" />
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[9px] text-slate-400">
                  {i % 2 === 0 ? `${6 + i}시` : ""}
                </div>
              ))}
            </div>
            {/* 히트맵 */}
            {mockWeeklyHeatmap.map((row) => (
              <div key={row.day} className="flex items-center gap-0.5 mb-0.5">
                <div className="w-8 text-xs text-slate-500 font-medium">{row.day}</div>
                {row.hours.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 aspect-square rounded-sm"
                    style={{ backgroundColor: getCongestionHex(val) }}
                    title={`${row.day} ${6 + i}시: ${val}%`}
                  />
                ))}
              </div>
            ))}
            {/* 범례 */}
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-500">
              <span>여유</span>
              {[20, 40, 60, 80, 95].map((v) => (
                <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getCongestionHex(v) }} />
              ))}
              <span>혼잡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================
// 탭3: 이동수단
// ========================
function TransportTab() {
  return (
    <div className="space-y-4">
      {/* 공영자전거 */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <h3 className="font-bold text-green-900 flex items-center gap-2 mb-3">🚲 공영자전거</h3>
        {mockBikeStations.map((s) => (
          <div key={s.id} className="mb-3 last:mb-0">
            <p className="text-sm text-green-800 font-medium">{s.name} ({Math.round(s.distance * 1000)}m)</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(s.availableBikes / s.totalDocks) * 100}%` }} />
              </div>
              <span className="text-sm font-semibold text-green-700">{s.availableBikes}/{s.totalDocks}대</span>
            </div>
          </div>
        ))}
      </div>

      {/* 버스 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-3">🚌 시내버스</h3>
        <p className="text-xs text-blue-600 mb-2">정류장: {mockBuses[0]?.stopName} ({Math.round((mockBuses[0]?.stopDistance || 0) * 1000)}m)</p>
        <div className="space-y-2">
          {mockBuses.map((bus) => (
            <div key={bus.routeNumber} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">{bus.routeNumber}</span>
                <span className="text-sm text-slate-600">{bus.stopName}</span>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                bus.arrivalMinutes <= 3 ? "text-green-600" : bus.arrivalMinutes <= 10 ? "text-amber-600" : "text-slate-500"
              )}>
                {bus.arrivalMinutes}분 후
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 교통약자 */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-3">♿ 교통약자 이동지원</h3>
        <p className="text-sm text-purple-800">센터: {mockAccessibleTransport.centerName}</p>
        <p className="text-sm text-purple-700 mt-1">
          이용가능 차량: <span className="font-bold text-purple-900">{mockAccessibleTransport.availableVehicles}대</span>
          <span className="text-purple-500"> / {mockAccessibleTransport.totalVehicles}대</span>
        </p>
        <p className="text-sm text-purple-600 mt-1">예상 대기시간: 약 {mockAccessibleTransport.estimatedWait}분</p>
        <button className="mt-3 w-full py-2 border-2 border-purple-300 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition text-sm">
          이동지원 요청하기
        </button>
      </div>
    </div>
  );
}

// ========================
// 탭4: 리뷰
// ========================
function ReviewTab() {
  const libReviews = mockReviews.slice(0, 3);
  const ratings = [
    { label: "시설 청결도", score: 4.1 },
    { label: "소음 수준", score: 4.5, note: "조용함" },
    { label: "좌석 편안함", score: 3.8 },
    { label: "콘센트/와이파이", score: 4.0 },
  ];

  return (
    <div className="space-y-5">
      {/* 전체 평점 */}
      <div className="text-center py-4">
        <div className="text-4xl font-bold text-slate-900">4.2</div>
        <div className="flex justify-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className={cn("w-5 h-5", s <= 4 ? "text-amber-400" : "text-slate-200")} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-1">238개 리뷰</p>
      </div>

      {/* 카테고리 평점 */}
      <div className="space-y-2">
        {ratings.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-28">{r.label}</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(r.score / 5) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold text-slate-700 w-8">{r.score}</span>
            {r.note && <span className="text-xs text-green-600">({r.note})</span>}
          </div>
        ))}
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-3">
        {libReviews.map((review) => (
          <div key={review.id} className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {review.userName[0]}
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900">{review.userName}</span>
                <span className="text-xs text-slate-400 ml-2">{review.createdAt}</span>
              </div>
              <span className="ml-auto px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">{review.mood}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{review.content}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <button className="hover:text-blue-600 transition">👍 {review.helpful}</button>
              <button className="hover:text-blue-600 transition">💬 {review.comments}</button>
              <button className="hover:text-blue-600 transition">📌 저장</button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
        리뷰 작성하기
      </button>
    </div>
  );
}
