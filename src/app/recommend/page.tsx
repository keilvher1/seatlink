"use client";

import { useState, useMemo } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

function calcScore(lib: typeof mockLibraries[0], filters: any) {
  const seatScore = Math.round((lib.totalAvailable / lib.totalSeats) * 100) * 0.4;
  const distScore = Math.round(Math.max(0, 100 - (lib.distance / 10) * 100)) * 0.3;
  const accessScore = ([lib.accessible, lib.nightOperation, lib.wifi, lib.parking].filter(Boolean).length / 4) * 100 * 0.2;
  const facilityScore = ([lib.nightOperation, lib.wifi, lib.parking, lib.reservable].filter(Boolean).length / 4) * 100 * 0.1;
  return {
    total: Math.round(seatScore + distScore + accessScore + facilityScore),
    seatScore: Math.round(seatScore / 0.4),
    distanceScore: Math.round(distScore / 0.3),
    accessScore: Math.round(accessScore / 0.2),
    facilityScore: Math.round(facilityScore / 0.1),
  };
}

export default function RecommendPage() {
  const [radius, setRadius] = useState(10);
  const [filters, setFilters] = useState({ night: false, accessible: false, wifi: false, parking: false, reservable: false });

  const recommendations = useMemo(() => {
    let list = mockLibraries.filter((l) => l.distance <= radius);
    if (filters.night) list = list.filter((l) => l.nightOperation);
    if (filters.accessible) list = list.filter((l) => l.accessible);
    if (filters.wifi) list = list.filter((l) => l.wifi);
    if (filters.parking) list = list.filter((l) => l.parking);
    if (filters.reservable) list = list.filter((l) => l.reservable);

    return list
      .map((lib) => ({ ...lib, score: calcScore(lib, filters) }))
      .sort((a, b) => b.score.total - a.score.total)
      .map((lib, i) => ({ ...lib, rank: i + 1 }));
  }, [radius, filters]);

  const toggleFilter = (key: keyof typeof filters) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🤖 AI 최적 도서관 추천</h1>
        <p className="text-sm text-slate-500 mt-1">현재 위치와 실시간 데이터를 분석하여 최적의 도서관을 추천합니다</p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          { key: "night" as const, label: "🌙 야간운영" },
          { key: "accessible" as const, label: "♿ 접근가능" },
          { key: "wifi" as const, label: "📶 와이파이" },
          { key: "parking" as const, label: "🅿️ 주차가능" },
          { key: "reservable" as const, label: "📝 예약가능" },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => toggleFilter(f.key)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition font-medium",
              filters[f.key]
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 반경 슬라이더 */}
      <div className="flex items-center gap-3 mb-6 bg-white rounded-xl p-3 border border-slate-100">
        <span className="text-sm text-slate-600 shrink-0">반경</span>
        <input
          type="range" min={1} max={10} value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="flex-1 accent-blue-600"
        />
        <span className="text-sm font-bold text-blue-600 w-12 text-right">{radius}km</span>
      </div>

      {/* 추천 점수 설명 */}
      <details className="bg-white rounded-xl border border-slate-100 mb-6">
        <summary className="px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
          📊 추천 점수 산출 방식
        </summary>
        <div className="px-4 pb-4 space-y-2">
          {[
            { label: "잔여좌석률", pct: 40, color: "bg-blue-500" },
            { label: "거리점수", pct: 30, color: "bg-green-500" },
            { label: "접근성점수", pct: 20, color: "bg-purple-500" },
            { label: "시설점수", pct: 10, color: "bg-amber-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-20">{item.label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-700 w-10 text-right">{item.pct}%</span>
            </div>
          ))}
          <p className="text-xs text-slate-500 mt-1">AI가 실시간 데이터와 예측 모델을 종합하여 점수를 산출합니다</p>
        </div>
      </details>

      {/* 추천 결과 */}
      <div className="space-y-4">
        {recommendations.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-medium text-lg">조건에 맞는 도서관이 없습니다</p>
            <p className="text-sm mt-1">필터 조건을 변경해보세요</p>
          </div>
        )}

        {recommendations.map((lib) => {
          const color = getCongestionColor(lib.congestionLevel);
          const isTop3 = lib.rank <= 3;
          return (
            <a
              key={lib.id}
              href={`/library/${lib.id}`}
              className={cn(
                "block bg-white rounded-xl border transition hover:shadow-lg",
                isTop3 ? "border-blue-200 shadow-sm" : "border-slate-100"
              )}
            >
              <div className="p-4">
                {/* 순위 + 점수 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">
                    {isTop3 ? MEDALS[lib.rank - 1] : `${lib.rank}위`} {lib.rank <= 3 ? `${lib.rank}위 추천` : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-500">추천점수</span>
                    <span className={cn(
                      "text-lg font-bold",
                      lib.score.total >= 80 ? "text-blue-600" : lib.score.total >= 60 ? "text-amber-600" : "text-slate-600"
                    )}>
                      {lib.score.total}
                    </span>
                    <span className="text-sm text-slate-400">/100</span>
                  </div>
                </div>

                {/* 도서관 정보 */}
                <h3 className="text-lg font-bold text-slate-900">{lib.name}</h3>
                <p className="text-sm text-slate-500">📍 {lib.address} | {lib.distanceText}</p>

                {/* 열람실 현황 */}
                <div className="mt-3 space-y-1.5">
                  {lib.rooms.map((room) => {
                    const rc = getCongestionColor(room.congestionLevel);
                    return (
                      <div key={room.name} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600 w-24 truncate">{room.name}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", rc.bg)} style={{ width: `${room.congestionPercent}%` }} />
                        </div>
                        <span className={cn("font-semibold w-16 text-right", rc.text)}>잔여 {room.availableSeats}석</span>
                      </div>
                    );
                  })}
                </div>

                {/* 점수 상세 (top3만) */}
                {isTop3 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[
                      { label: "좌석", score: lib.score.seatScore, max: 40, color: "bg-blue-500" },
                      { label: "거리", score: lib.score.distanceScore, max: 30, color: "bg-green-500" },
                      { label: "접근", score: lib.score.accessScore, max: 20, color: "bg-purple-500" },
                      { label: "시설", score: lib.score.facilityScore, max: 10, color: "bg-amber-500" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                          <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.score}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 태그 */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {lib.nightOperation && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">🌙 야간</span>}
                  {lib.accessible && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">♿ 접근가능</span>}
                  {lib.wifi && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">📶 WiFi</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
