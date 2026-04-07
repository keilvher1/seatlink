import { NextRequest, NextResponse } from "next/server";

/**
 * AI 혼잡도 예측 API
 * 시계열 패턴 기반 예측 (향후 실제 학습 데이터로 교체)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const libraryId = searchParams.get("libraryId") || "lib-001";

  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=일, 6=토
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 시간대별 기본 패턴 (평일 vs 주말)
  const weekdayPattern: Record<number, number> = {
    6: 5, 7: 10, 8: 25, 9: 50, 10: 70, 11: 85,
    12: 62, 13: 55, 14: 42, 15: 48, 16: 63,
    17: 75, 18: 88, 19: 92, 20: 80, 21: 55, 22: 20,
  };

  const weekendPattern: Record<number, number> = {
    6: 2, 7: 3, 8: 8, 9: 15, 10: 28, 11: 40,
    12: 48, 13: 55, 14: 65, 15: 68, 16: 62,
    17: 55, 18: 45, 19: 35, 20: 25, 21: 15, 22: 5,
  };

  const pattern = isWeekend ? weekendPattern : weekdayPattern;

  // 약간의 랜덤 노이즈를 추가하여 실제감 부여
  const predictions = [];
  let minCongestion = 100;
  let optimalHour = "14:00";

  for (let h = 6; h <= 22; h++) {
    const base = pattern[h] || 30;
    const noise = Math.round((Math.random() - 0.5) * 10);
    const congestion = Math.max(0, Math.min(100, base + noise));
    const isPast = h < currentHour;

    predictions.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      congestion,
      isPast,
    });

    if (!isPast && congestion < minCongestion) {
      minCongestion = congestion;
      optimalHour = `${String(h).padStart(2, "0")}:00`;
    }
  }

  // AI 인사이트 생성
  const currentPrediction = predictions.find(
    (p) => p.hour === `${String(currentHour).padStart(2, "0")}:00`
  );
  const nextHourPrediction = predictions.find(
    (p) => p.hour === `${String(currentHour + 1).padStart(2, "0")}:00`
  );

  const trend =
    nextHourPrediction && currentPrediction
      ? nextHourPrediction.congestion > currentPrediction.congestion + 5
        ? "increasing"
        : nextHourPrediction.congestion < currentPrediction.congestion - 5
        ? "decreasing"
        : "stable"
      : "stable";

  return NextResponse.json({
    libraryId,
    predictions,
    insight: {
      optimalTime: optimalHour,
      optimalCongestion: minCongestion,
      currentCongestion: currentPrediction?.congestion || 50,
      trend,
      message: `오늘 ${optimalHour} 시간대가 가장 여유로울 것으로 예상됩니다. 예상 혼잡도 ${minCongestion}%`,
    },
    isWeekend,
    dayOfWeek: ["일", "월", "화", "수", "목", "금", "토"][dayOfWeek],
    generatedAt: now.toISOString(),
  });
}
