import { NextRequest, NextResponse } from "next/server";
import { buildCoverage } from "@/lib/service-area";

/**
 * 공영자전거 실시간 API
 * 전국 공영자전거 대여소 위치 + 대여 가능 자전거 수
 *
 * - 대여소 위치 정보: 서버 메모리 캐시 (5분 TTL)
 * - 대여 가능 현황: 매 요청 시 조회 (1분 캐시)
 * - data.go.kr API는 numOfRows 최대 1000이므로 페이지네이션 필요
 *
 * Query params:
 *   lat, lng  — 사용자 좌표 (필수)
 *   radius    — 반경 km (기본 5)
 */

const BIKE_API_BASE = "https://apis.data.go.kr/B551982/pbdo_v2";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── 서버 메모리 캐시 ──
let stationCache: any[] = [];
let stationCacheTime = 0;
const STATION_CACHE_TTL = 5 * 60 * 1000; // 5분

let availCache: Map<string, number> = new Map();
let availCacheTime = 0;
const AVAIL_CACHE_TTL = 60 * 1000; // 1분

async function fetchPage(endpoint: string, pageNo: number) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return [];

  const encodedKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
  const query = new URLSearchParams({
    pageNo: String(pageNo),
    numOfRows: "1000",
    type: "json",
  });
  const url = `${BIKE_API_BASE}${endpoint}?serviceKey=${encodedKey}&${query.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    clearTimeout(timeout);

    const text = await res.text();
    if (text.startsWith("<")) return [];

    const data = JSON.parse(text);
    const body = data?.response?.body || data?.body;
    if (!body) return [];

    const rawItems = body.items?.item ?? body.items ?? body.item ?? [];
    return Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
  } catch (err: any) {
    console.error(`[BikeAPI] Page ${pageNo} error:`, err.message);
    return [];
  }
}

async function getAllStations(): Promise<any[]> {
  const now = Date.now();
  if (stationCache.length > 0 && (now - stationCacheTime) < STATION_CACHE_TTL) {
    return stationCache;
  }

  console.log("[BikeAPI] Refreshing station cache...");
  // 전국 약 6253개 → 7페이지 병렬 호출
  const pages = await Promise.all(
    Array.from({ length: 7 }, (_, i) => fetchPage("/inf_101_00010001_v2", i + 1))
  );
  const allStations = pages.flat();

  if (allStations.length > 0) {
    stationCache = allStations;
    stationCacheTime = now;
    console.log(`[BikeAPI] Cached ${allStations.length} stations`);
  }

  return stationCache;
}

async function getAvailability(): Promise<Map<string, number>> {
  const now = Date.now();
  if (availCache.size > 0 && (now - availCacheTime) < AVAIL_CACHE_TTL) {
    return availCache;
  }

  console.log("[BikeAPI] Refreshing availability...");
  const pages = await Promise.all(
    Array.from({ length: 6 }, (_, i) => fetchPage("/inf_101_00010002_v2", i + 1))
  );
  const allAvail = pages.flat();

  const newMap = new Map<string, number>();
  for (const a of allAvail) {
    const id = a.rntstnId || "";
    if (id) newMap.set(id, parseInt(a.bcyclTpkctNocs || "0") || 0);
  }

  if (newMap.size > 0) {
    availCache = newMap;
    availCacheTime = now;
    console.log(`[BikeAPI] Cached availability for ${newMap.size} stations`);
  }

  return availCache;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userLat = parseFloat(searchParams.get("lat") || "0");
  const userLng = parseFloat(searchParams.get("lng") || "0");
  const radiusKm = parseFloat(searchParams.get("radius") || "5");

  if (!userLat || !userLng) {
    return NextResponse.json({ error: "lat, lng 필수" }, { status: 400 });
  }

  if (!process.env.DATA_GO_KR_API_KEY) {
    return NextResponse.json({
      bikes: getMockBikes(userLat, userLng),
      source: "mock",
      updatedAt: new Date().toISOString(),
    });
  }

  // 지원 지역 화이트리스트: 미지원 좌표면 빈 결과 + 안내
  const coverage = buildCoverage(userLat, userLng);
  if (!coverage.supported) {
    return NextResponse.json(
      {
        bikes: [],
        totalStations: 0,
        coverage,
        source: "out-of-area",
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  }

  try {
    const [stations, availMap] = await Promise.all([
      getAllStations(),
      getAvailability(),
    ]);

    const nearbyBikes = stations
      .map((station: any) => {
        const lat = parseFloat(station.lat || "0");
        const lng = parseFloat(station.lot || "0");
        if (!lat || !lng) return null;

        const dist = haversine(userLat, userLng, lat, lng);
        if (dist > radiusKm) return null;

        const id = station.rntstnId || "";
        const availableBikes = availMap.get(id) ?? 0;

        return {
          id,
          name: station.rntstnNm || "대여소",
          lat,
          lng,
          availableBikes,
          address: station.roadNmAddr || station.lotnoAddr || "",
          region: station.lcgvmnInstNm || "",
          feeType: station.rntFeeTypeNm || "",
          distance: Math.round(dist * 100) / 100,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 30);

    return NextResponse.json({
      bikes: nearbyBikes,
      totalStations: stations.length,
      coverage,
      source: "api",
      updatedAt: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error: any) {
    console.error("[BikeAPI] Fatal:", error.message);
    return NextResponse.json({
      bikes: getMockBikes(userLat, userLng),
      source: "error-fallback",
      error: error.message,
      updatedAt: new Date().toISOString(),
    });
  }
}

function getMockBikes(lat: number, lng: number) {
  const offsets = [
    { dlat: 0.002, dlng: 0.003, name: "도서관앞 대여소", bikes: 8 },
    { dlat: -0.003, dlng: 0.001, name: "역전 대여소", bikes: 3 },
    { dlat: 0.001, dlng: -0.004, name: "공원입구 대여소", bikes: 12 },
    { dlat: -0.001, dlng: 0.005, name: "시청 대여소", bikes: 0 },
  ];

  return offsets.map((o, i) => ({
    id: `mock_bike_${i}`,
    name: o.name,
    lat: lat + o.dlat,
    lng: lng + o.dlng,
    availableBikes: o.bikes,
    address: "",
    region: "",
    feeType: "유료",
    distance: Math.round(haversine(lat, lng, lat + o.dlat, lng + o.dlng) * 100) / 100,
  }));
}
