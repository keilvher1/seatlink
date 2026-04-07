"use client";

import { useState, useMemo } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance, CongestionLevel } from "@/lib/types";

export default function HomePage() {
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<"distance" | "seats">("distance");
  const [sheetOpen, setSheetOpen] = useState(true);

  const sorted = useMemo(() => {
    const list = [...mockLibraries].filter((l) => l.distance <= radius);
    if (sortBy === "seats") list.sort((a, b) => b.totalAvailable - a.totalAvailable);
    else list.sort((a, b) => a.distance - b.distance);
    return list;
  }, [radius, sortBy]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden">
      {/* ====== 지도 영역 ====== */}
      <div className="absolute inset-0 bg-slate-200">
        {/* 카카오맵 자리 */}
        <div id="kakao-map" className="w-full h-full" />

        {/* 지도 오버레이: 목업 마커들 */}
        <MapMarkers libraries={sorted} />

        {/* 지도 오버레이: 반경 필터 */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {[1, 3, 5, 10].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-full shadow-md transition",
                radius === r
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {r}km
            </button>
          ))}
        </div>

        {/* 내 위치 버튼 */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-slate-50 transition">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
          </svg>
        </button>
      </div>

      {/* ====== 바텀 시트 ====== */}
      <div
        className={cn(
          "bottom-sheet",
          sheetOpen ? "translate-y-0" : "translate-y-[70%]"
        )}
        style={{ height: "70vh" }}
      >
        {/* 핸들 */}
        <div
          className="cursor-grab active:cursor-grabbing py-2"
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div className="bottom-sheet-handle" />
        </div>

        {/* 헤더 */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">📍 내 주변 도서관</span>
            <span className="text-sm text-slate-500">{sorted.length}개</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "distance" | "seats")}
            className="text-sm text-slate-600 bg-slate-100 rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-blue-500"
          >
            <option value="distance">거리순</option>
            <option value="seats">잔여좌석순</option>
          </select>
        </div>

        {/* 도서관 목록 */}
        <div className="overflow-y-auto h-[calc(70vh-120px)] px-4 py-3 space-y-3 scrollbar-thin">
          {sorted.map((lib) => (
            <LibraryCard key={lib.id} library={lib} />
          ))}

          {sorted.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">반경 {radius}km 내 도서관이 없습니다</p>
              <p className="text-sm mt-1">검색 반경을 넓혀보세요</p>
            </div>
          )}

          {/* AI 추천 버튼 */}
          <a
            href="/recommend"
            className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-600/25"
          >
            🤖 AI 최적 도서관 추천받기
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================
// 도서관 카드 컴포넌트
// ============================
function LibraryCard({ library }: { library: LibraryWithDistance }) {
  const color = getCongestionColor(library.congestionLevel);

  return (
    <a
      href={`/library/${library.id}`}
      className="block bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition p-4"
    >
      <div className="flex gap-3">
        {/* 혼잡도 인디케이터 */}
        <div className={cn("w-1.5 rounded-full shrink-0", color.bg)} />

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[15px] text-slate-900">{library.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{library.address}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-slate-700">{library.distanceText}</p>
              <span className={cn("inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1", color.light, color.text)}>
                {library.congestionLevel}
              </span>
            </div>
          </div>

          {/* 열람실 현황 */}
          <div className="mt-2.5 space-y-1.5">
            {library.rooms.map((room) => {
              const roomColor = getCongestionColor(room.congestionLevel);
              return (
                <div key={room.name} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 w-20 truncate">{room.name}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", roomColor.bg)}
                      style={{ width: `${room.congestionPercent}%` }}
                    />
                  </div>
                  <span className={cn("font-semibold w-14 text-right", roomColor.text)}>
                    {room.availableSeats}/{room.totalSeats}석
                  </span>
                </div>
              );
            })}
          </div>

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {library.nightOperation && <Tag>🌙 야간운영</Tag>}
            {library.accessible && <Tag>♿ 접근가능</Tag>}
            {library.reservable && <Tag>📝 예약가능</Tag>}
            {library.wifi && <Tag>📶 와이파이</Tag>}
          </div>
        </div>

        {/* 화살표 */}
        <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-full">
      {children}
    </span>
  );
}

// ============================
// 지도 마커 (목업)
// ============================
function MapMarkers({ libraries }: { libraries: LibraryWithDistance[] }) {
  // 목업: 지도 위 절대 위치로 마커 표시
  const positions = [
    { top: "30%", left: "40%" },
    { top: "55%", left: "65%" },
    { top: "25%", left: "20%" },
    { top: "45%", left: "50%" },
    { top: "60%", left: "30%" },
    { top: "35%", left: "75%" },
  ];

  const colorMap: Record<CongestionLevel, string> = {
    "여유": "bg-green-500",
    "보통": "bg-amber-500",
    "혼잡": "bg-red-500",
  };

  return (
    <>
      {/* 사용자 위치 마커 */}
      <div
        className="absolute z-10"
        style={{ top: "42%", left: "48%" }}
      >
        <div className="relative w-4 h-4">
          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg location-pulse" />
        </div>
      </div>

      {/* 도서관 마커들 */}
      {libraries.slice(0, 6).map((lib, i) => (
        <a
          key={lib.id}
          href={`/library/${lib.id}`}
          className="absolute z-10 marker-bounce"
          style={positions[i] || { top: "50%", left: "50%" }}
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white",
                colorMap[lib.congestionLevel]
              )}
            >
              {lib.totalAvailable}
            </div>
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white -mt-0.5" />
          </div>
        </a>
      ))}
    </>
  );
}
