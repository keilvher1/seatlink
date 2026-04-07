"use client";

import { useState, useEffect } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance, CongestionLevel } from "@/lib/types";

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState<(LibraryWithDistance & { score: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 모의 AI 추천 시뮬레이션
    setTimeout(() => {
      const scored = mockLibraries.map((lib) => ({
        ...lib,
        score: Math.round(Math.random() * 40 + 60), // 60-100 점
      }));
      setRecommendations(scored.sort((a, b) => b.score - a.score));
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* 헤더 */}
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text mb-2">🤖 AI 최적 도서관</h1>
        <p className="text-slate-500">당신을 위한 추천 도서관</p>
      </div>

      {loading ? (
        // 로딩 상태
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        // 추천 카드들
        <div className="space-y-4">
          {recommendations.map((lib, idx) => (
            <RecommendCard key={lib.id} library={lib} rank={idx + 1} delay={idx * 100} />
          ))}
        </div>
      )}

      {/* AI 인사이트 */}
      <div className="mt-8 glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
        <h3 className="font-bold text-slate-900 mb-4">💡 AI 인사이트</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p>✓ 현재 시간대에 가장 여유로운 열람실을 선택했습니다</p>
          <p>✓ 최근 1주일 데이터를 기반으로 추천되었습니다</p>
          <p>✓ 예상 대기 시간: 0-5분 이내</p>
        </div>
      </div>
    </div>
  );
}

// ============================
// 추천 카드 컴포넌트
// ============================
function RecommendCard({ library, rank, delay }: { library: LibraryWithDistance & { score: number }; rank: number; delay: number }) {
  const color = getCongestionColor(library.congestionLevel);
  const scoreColor = library.score >= 85 ? "text-emerald-600" : library.score >= 70 ? "text-amber-600" : "text-red-600";
  const scoreBg = library.score >= 85 ? "from-emerald-600 to-emerald-700" : library.score >= 70 ? "from-amber-600 to-amber-700" : "from-red-600 to-red-700";

  return (
    <div style={{ animationDelay: `${delay}ms` }} className="animate-slide-up">
      <a
        href={`/library/${library.id}`}
        className="glass rounded-2xl p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 block"
      >
        <div className="flex items-start gap-4">
          {/* 순위 배지 */}
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${scoreBg} text-white flex items-center justify-center flex-shrink-0 shadow-lg text-lg font-bold`}>
            #{rank}
          </div>

          {/* 메인 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{library.name}</h3>
                <p className="text-xs text-slate-500 truncate">{library.address}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={cn("inline-block px-3 py-1 text-xs font-bold rounded-full shadow-sm", color.light, color.text)}>
                  {library.congestionLevel}
                </span>
              </div>
            </div>

            {/* 스코어 바 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600">적합도</span>
                <span className={`text-sm font-bold ${scoreColor}`}>{library.score}/100</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${scoreBg} rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${library.score}%` }}
                />
              </div>
            </div>

            {/* 열람실 현황 */}
            <div className="space-y-2">
              {library.rooms.slice(0, 2).map((room) => {
                const roomColor = getCongestionColor(room.congestionLevel);
                return (
                  <div key={room.name} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-medium w-20 truncate">{room.name}</span>
                    <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500 shadow-sm", roomColor.bg)}
                        style={{ width: `${room.congestionPercent}%` }}
                      />
                    </div>
                    <span className={cn("font-bold w-12 text-right", roomColor.text)}>
                      {room.availableSeats}/{room.totalSeats}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 특징 */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {library.nightOperation && <Tag>🌙 야간</Tag>}
              {library.accessible && <Tag>♿ 접근</Tag>}
              {library.reservable && <Tag>📝 예약</Tag>}
              {library.wifi && <Tag>📶 와이파이</Tag>}
            </div>
          </div>

          {/* 화살표 */}
          <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full">
      {children}
    </span>
  );
}
