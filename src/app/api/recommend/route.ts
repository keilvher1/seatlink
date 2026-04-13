import { NextRequest, NextResponse } from "next/server";
import { haversineDistance, getCongestionLevel } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userLat = parseFloat(searchParams.get("lat") || "37.5665");
  const userLng = parseFloat(searchParams.get("lng") || "126.978");
  const radius = parseFloat(searchParams.get("radius") || "5");
  const night = searchParams.get("night") === "true";
  const accessible = searchParams.get("accessible") === "true";

  const origin = new URL(request.url).origin;

  // 도서관 데이터 + 교통 데이터 병렬 조회
  let allLibraries: any[] = [];
  let transportData: any = null;

  try {
    const [libRes, transportRes] = await Promise.allSettled([
      fetch(`${origin}/api/libraries`, { cache: "no-store" }),
      fetch(
        `${origin}/api/transport?lat=${userLat}&lng=${userLng}&radius=${radius}`,
        { cache: "no-store" }
      ),
    ]);

    if (libRes.status === "fulfilled" && libRes.value.ok) {
      const data = await libRes.value.json();
      allLibraries = data.libraries || [];
    }

    if (transportRes.status === "fulfilled" && transportRes.value.ok) {
      transportData = await transportRes.value.json();
    }
  } catch (err) {
    console.error("[Recommend] Failed to fetch data:", err);
    return NextResponse.json({
      recommendations: [],
      totalCandidates: 0,
      userLocation: { lat: userLat, lng: userLng },
      radius,
      updatedAt: new Date().toISOString(),
    });
  }

  let candidates = allLibraries.map((lib: any) => {
    const dist = haversineDistance(userLat, userLng, lib.lat, lib.lng);
    return { ...lib, distance: Math.round(dist * 10) / 10 };
  });

  // 반경 필터
  candidates = candidates.filter((l) => l.distance <= radius);
  if (night) candidates = candidates.filter((l) => l.nightOperation);
  if (accessible) candidates = candidates.filter((l) => l.accessible);

  // 추천 점수 계산 + 교통 정보 매칭
  const scored = candidates.map((lib) => {
    const seatRatio =
      lib.totalSeats > 0 ? lib.totalAvailable / lib.totalSeats : 0;
    const seatScore = Math.round(seatRatio * 100);
    const distanceScore = Math.round(
      Math.max(0, 100 - (lib.distance / radius) * 100)
    );
    const accessFeatures = [
      lib.accessible,
      lib.nightOperation,
      lib.wifi,
      lib.parking,
    ].filter(Boolean).length;
    const accessScore = Math.round((accessFeatures / 4) * 100);
    const facilityFeatures = [
      lib.nightOperation,
      lib.wifi,
      lib.parking,
      lib.reservable,
    ].filter(Boolean).length;
    const facilityScore = Math.round((facilityFeatures / 4) * 100);

    const totalScore = Math.round(
      seatScore * 0.4 +
        distanceScore * 0.3 +
        accessScore * 0.2 +
        facilityScore * 0.1
    );

    // 도서관 근처 교통 정보 매칭
    const transport = matchTransport(lib, transportData);

    return {
      ...lib,
      score: {
        total: totalScore,
        seatScore,
        distanceScore,
        accessScore,
        facilityScore,
      },
      transport,
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
    transport: transportData
      ? {
          totalBikes:
            transportData.bikes?.reduce(
              (s: number, b: any) => s + (b.availableBikes || 0),
              0
            ) || 0,
          totalBusStops: transportData.buses?.length || 0,
          hasAccessible: !!transportData.accessibleTransport,
          source: transportData.source,
        }
      : null,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 도서관 위치 기준으로 가장 가까운 교통 수단 매칭
 */
function matchTransport(lib: any, transportData: any) {
  if (!transportData) {
    return { bikes: [], buses: [], accessibleTransport: null };
  }

  // 가까운 자전거 대여소 (도서관 기준 1km 이내)
  const nearbyBikes = (transportData.bikes || [])
    .map((b: any) => ({
      ...b,
      distanceFromLib: Math.round(
        haversineDistance(lib.lat, lib.lng, b.lat, b.lng) * 1000
      ),
    }))
    .filter((b: any) => b.distanceFromLib <= 1000)
    .sort((a: any, b: any) => a.distanceFromLib - b.distanceFromLib)
    .slice(0, 3);

  // 가까운 버스 정류장 (거리순 상위 2개)
  const nearbyBuses = (transportData.buses || []).slice(0, 2);

  return {
    bikes: nearbyBikes,
    buses: nearbyBuses,
    accessibleTransport: transportData.accessibleTransport?.[0] || null,
  };
}
