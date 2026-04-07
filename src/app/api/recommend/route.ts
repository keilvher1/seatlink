import { NextRequest, NextResponse } from "next/server";
import { mockLibraries } from "@/lib/mock-data";
import { haversineDistance, getCongestionLevel } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userLat = parseFloat(searchParams.get("lat") || "37.5665");
  const userLng = parseFloat(searchParams.get("lng") || "126.978");
  const radius = parseFloat(searchParams.get("radius") || "5");
  const night = searchParams.get("night") === "true";
  const accessible = searchParams.get("accessible") === "true";

  // TODO: 실제 API 데이터로 교체 — 현재는 목업 사용
  let candidates = mockLibraries.map((lib) => {
    const dist = haversineDistance(userLat, userLng, lib.lat, lib.lng);
    return { ...lib, distance: Math.round(dist * 10) / 10 };
  });

  // 반경 필터
  candidates = candidates.filter((l) => l.distance <= radius);
  if (night) candidates = candidates.filter((l) => l.nightOperation);
  if (accessible) candidates = candidates.filter((l) => l.accessible);

  // 추천 점수 계산
  const scored = candidates.map((lib) => {
    const seatRatio = lib.totalSeats > 0 ? lib.totalAvailable / lib.totalSeats : 0;
    const seatScore = Math.round(seatRatio * 100);
    const distanceScore = Math.round(Math.max(0, 100 - (lib.distance / radius) * 100));
    const accessFeatures = [lib.accessible, lib.nightOperation, lib.wifi, lib.parking].filter(Boolean).length;
    const accessScore = Math.round((accessFeatures / 4) * 100);
    const facilityFeatures = [lib.nightOperation, lib.wifi, lib.parking, lib.reservable].filter(Boolean).length;
    const facilityScore = Math.round((facilityFeatures / 4) * 100);

    const totalScore = Math.round(
      seatScore * 0.4 + distanceScore * 0.3 + accessScore * 0.2 + facilityScore * 0.1
    );

    return {
      ...lib,
      score: { total: totalScore, seatScore, distanceScore, accessScore, facilityScore },
    };
  });

  // 점수 순 정렬
  scored.sort((a, b) => b.score.total - a.score.total);

  // 순위 부여
  const ranked = scored.map((lib, i) => ({ ...lib, rank: i + 1 }));

  return NextResponse.json({
    recommendations: ranked.slice(0, 10),
    totalCandidates: ranked.length,
    userLocation: { lat: userLat, lng: userLng },
    radius,
    updatedAt: new Date().toISOString(),
  });
}
