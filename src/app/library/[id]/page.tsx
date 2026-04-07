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
    <div className="max-w-2xl mx-auto min-h-screen pb-24 md:pb-0">
      {/* 상단 네비 */}
      <div className="sticky top-14 z-40 glass">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            뒤로
          </a>
          <h1 className="font-bold text-lg text-slate-900">{library.name}</h1>
          <button onClick={() => setIsFav(!isFav)} className="p-1.5 rounded-full hover:bg-red-50 transition transform hover:scale-110">
            <svg className={cn("w-6 h-6 transition", isFav ? "fill-red-500 text-red-500" : "text-slate-400")} fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 도서관 정보 카드 */}
      <div className="px-4 py-5 space-y-3 glass-subtle m-4 rounded-2xl">
        <p className="text-sm text-slate-700 font-medium">📍 {library.address}</p>
        <p className="text-sm text-slate-700 font-medium">🕐 {library.operatingHours.weekday}
          {library.nightOperation && <span className="ml-2 px-2.5 py-0.5 badge-success text-xs">🌙 야간운영</span>}
        </p>
        <p className="text-sm text-slate-700 font-medium">☎️ {library.phone}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {library.accessible && <span className="badge-pill bg-purple-100 text-purple-700">♿ 접근가능</span>}
          {library.wifi && <span className="badge-pill bg-emerald-100 text-emerald-700">📶 와이파이</span>}
          {library.parking && <span className="badge-pill bg-amber-100 text-amber-700">🅿️ 주차가능</span>}
          {library.reservable && <span className="badge-pill bg-cyan-100 text-cyan-700">📝 예약가능</span>}
        </div>
        <div className="pt-2 border-t border-slate-200/50">
          <p className="text-xs text-slate-600">오늘 방문자 <span className="font-bold text-slate-900">{library.todayVisitors}명</span></p>
        </div>
      </div>

      {/* 탭 */}
      <div className="sticky top-[104px] z-30 glass mx-4 rounded-t-2xl flex mt-4">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-all duration-300",
              activeTab === tab 
                ? "tab-active bg-gradient-to-b from-blue-50 to-transparent" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-4 py-4">
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
    <div className="space-y-4 animate-slide-up">
      {library.rooms.map((room, idx) => {
        const color = getCongestionColor(room.congestionLevel);
        return (
          <div key={room.name} className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
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
              <span className="text-slate-600 font-medium">사용 {room.usedSeats}석 / 총 {room.totalSeats}석</span>
              <span className={cn("font-bold text-lg", color.text)}>잔여 {room.availableSeats}석</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">마지막 업데이트: {room.lastUpdated}</p>
          </div>
        );
      })}

      {/* 전체 요약 */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/30">
        <h3 className="font-bold text-lg mb-4">📊 전체 좌석 현황</h3>
        <div className="flex items-center gap-6">
          {/* 원형 게이지 */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={getCongestionHex(totalPercent)}
                strokeWidth="14"
                strokeDasharray={`${totalPercent * 2.64} ${264 - totalPercent * 2.64}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{totalPercent}%</span>
              <span className="text-xs text-slate-300 mt-1">이용률</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">총 좌석:</span>
              <span className="font-bold">{library.totalSeats}석</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">사용 중:</span>
              <span className="font-bold text-red-300">{library.totalUsed}석</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">잔여:</span>
              <span className="font-bold text-emerald-300">{library.totalAvailable}석</span>
            </div>
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
    <div className="space-y-6 animate-slide-up">
      {/* 24시간 예측 차트 */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">📊 AI 혼잡도 예측 (오늘)</h3>
        <div className="glass rounded-2xl p-4">
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
              <Tooltip
                formatter={(value: number) => [`${value}%`, "혼잡도"]}
                contentStyle={{ borderRadius: 16, border: "1px solid rgba(100,116,139,0.2)", backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              />
              <ReferenceLine x="13:00" stroke="#2563eb" strokeDasharray="5 5" strokeWidth={2} label={{ value: "현재", fill: "#2563eb", fontSize: 11, offset: 10 }} />
              <Area
                type="monotone"
                dataKey="congestion"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#congestionGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.hour}
                      cx={cx} cy={cy} r={4}
                      fill={getCongestionHex(payload.congestion)}
                      stroke="white" strokeWidth={2}
                      className="shadow-md"
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="glass rounded-2xl p-5 border-l-4 border-blue-600">
        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2 text-lg">
          ✨ AI 분석 인사이트
        </h4>
        <p className="text-slate-700 leading-relaxed font-medium">
          오늘 <span className="font-bold gradient-text">14:00~15:00</span> 시간대가 가장 여유로울 것으로 예상됩니다.
          현재 추세 기준 약 <span className="font-bold text-emerald-600">35석</span>의 잔여좌석이 예상됩니다.
        </p>
        <p className="text-slate-600 mt-3 font-medium">
          💡 지금 출발하면 도착 예상 시점(12분 후) 혼잡도:
          <span className="inline-block ml-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">58% (보통)</span>
        </p>
      </div>

      {/* 요일별 히트맵 */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">📅 요일별 혼잡도 패턴</h3>
        <div className="glass rounded-2xl p-4 overflow-x-auto">
          <div className="min-w-[500px]">
            {/* 시간 헤더 */}
            <div className="flex items-center gap-0.5 mb-2">
              <div className="w-8" />
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[9px] text-slate-500 font-medium">
                  {i % 2 === 0 ? `${6 + i}시` : ""}
                </div>
              ))}
            </div>
            {/* 히트맵 */}
            {mockWeeklyHeatmap.map((row, ridx) => (
              <div key={row.day} className="flex items-center gap-0.5 mb-1">
                <div className="w-8 text-xs text-slate-600 font-semibold">{row.day}</div>
                {row.hours.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 aspect-square rounded transition-all hover:scale-110 shadow-sm hover:shadow-md cursor-pointer"
                    style={{ backgroundColor: getCongestionHex(val) }}
                    title={`${row.day} ${6 + i}시: ${val}%`}
                  />
                ))}
              </div>
            ))}
            {/* 범례 */}
            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-600">
              <span className="font-medium">여유</span>
              {[20, 40, 60, 80, 95].map((v) => (
                <div key={v} className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: getCongestionHex(v) }} />
              ))}
              <span className="font-medium">혼잡</span>
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
    <div className="space-y-4 animate-slide-up">
      {/* 공영자전거 */}
      <div className="glass rounded-2xl p-5 border-l-4 border-emerald-600">
        <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4 text-lg">🚲 공영자전거</h3>
        {mockBikeStations.map((s) => (
          <div key={s.id} className="mb-4 last:mb-0">
            <p className="text-sm text-emerald-800 font-semibold">{s.name} ({Math.round(s.distance * 1000)}m)</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm" style={{ width: `${(s.availableBikes / s.totalDocks) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-emerald-700 w-16 text-right">{s.availableBikes}/{s.totalDocks}대</span>
            </div>
          </div>
        ))}
      </div>

      {/* 버스 */}
      <div className="glass rounded-2xl p-5 border-l-4 border-blue-600">
        <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4 text-lg">🚌 시내버스</h3>
        <p className="text-xs text-blue-600 font-medium mb-3">정류장: {mockBuses[0]?.stopName} ({Math.round((mockBuses[0]?.stopDistance || 0) * 1000)}m)</p>
        <div className="space-y-2">
          {mockBuses.map((bus) => (
            <div key={bus.routeNumber} className="flex items-center justify-between glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold rounded-lg shadow-md">{bus.routeNumber}</span>
                <span className="text-sm text-slate-700 font-medium">{bus.stopName}</span>
              </div>
              <span className={cn(
                "text-sm font-bold",
                bus.arrivalMinutes <= 3 ? "text-emerald-600" : bus.arrivalMinutes <= 10 ? "text-amber-600" : "text-slate-500"
              )}>
                {bus.arrivalMinutes}분 후
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 교통약자 */}
      <div className="glass rounded-2xl p-5 border-l-4 border-purple-600">
        <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-4 text-lg">♿ 교통약자 이동지원</h3>
        <p className="text-sm text-slate-700 font-medium">{mockAccessibleTransport.centerName}</p>
        <p className="text-sm text-slate-700 mt-2 font-medium">
          이용가능 차량: <span className="font-bold gradient-text">{mockAccessibleTransport.availableVehicles}대</span>
          <span className="text-slate-500"> / {mockAccessibleTransport.totalVehicles}대</span>
        </p>
        <p className="text-sm text-slate-700 mt-2 font-medium">예상 대기시간: 약 <span className="font-bold">{mockAccessibleTransport.estimatedWait}분</span></p>
        <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 text-sm">
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
    <div className="space-y-5 animate-slide-up">
      {/* 전체 평점 */}
      <div className="glass rounded-2xl py-6 px-4 text-center">
        <div className="text-5xl font-bold gradient-text mb-2">4.2</div>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className={cn("w-6 h-6 transition", s <= 4 ? "text-amber-400 shadow-md shadow-amber-400/50" : "text-slate-300")} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="text-sm text-slate-600 font-medium">238개 리뷰</p>
      </div>

      {/* 카테고리 평점 */}
      <div className="glass rounded-2xl p-5">
        <h4 className="font-bold text-slate-900 mb-4">📈 평가 항목</h4>
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
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-3">
        {libReviews.map((review, idx) => (
          <div key={review.id} className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
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
              <button className="hover:text-blue-600 font-medium transition">👍 {review.helpful}</button>
              <button className="hover:text-blue-600 font-medium transition">💬 {review.comments}</button>
              <button className="hover:text-blue-600 font-medium transition">📌 저장</button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105">
        리뷰 작성하기
      </button>
    </div>
  );
}
