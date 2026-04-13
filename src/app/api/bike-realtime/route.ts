import { NextRequest, NextResponse } from "next/server";

/**
 * 공영자전거 실시간 API
 * 전국 공영자전거 대여소 위치 + 대여 가능 자전거 수
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

async function fetchBikeAPI(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return { items: [], totalCount: 0 };

  const encodedKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
  const query = new URLSearchParams({ pageNo: "1", numOfRows: "5000", type: "json", ...params });
  const url = `${BIKE_API_BASE}${endpoint}?serviceKey=${encodedKey}&${query.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    clearTimeout(timeout);

    const text = await res.text();
    if (text.startsWith("<") || text.startsWith("<?xml")) {
      console.error(`[BikeAPI] XML error from ${endpoint}`);
      return { items: [], totalCount: 0 };
    }

    const data = JSON.parse(text);
    const body = data?.response?.body || data?.body;
    if (!body) return { items: [], totalCount: 0 };

    const rawItems = body.items?.item ?? body.items ?? body.item ?? [];
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
    return { items, totalCount: parseInt(body.totalCount) || items.length };
  } catch (err: any) {
    console.error(`[BikeAPI] Error fetching ${endpoint}:`, err.message);
    return { items: [], totalCount: 0 };
  }
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

  try {
    // 대여소 정보 + 가용 현황 병렬 호출
    const [stationResult, availResult] = await Promise.all([
      fetchBikeAPI("/inf_101_00010001_v2"),
      fetchBikeAPI("/inf_101_00010002_v2"),
    ]);

    // 가용 현황 Map: rntstnId -> bcyclTpkctNocs
    const availMap = new Map<string, number>();
    for (const a of availResult.items) {
      const id = a.rntstnId || "";
      if (id) {
        availMap.set(id, parseInt(a.bcyclTpkctNocs || "0") || 0);
      }
    }

    // 사용자 주변 대여소 필터링
    const nearbyBikes = stationResult.items
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
          facilityType: station.rntstnFcltTypeNm || "",
          feeType: station.rntFeeTypeNm || "",
          distance: Math.round(dist * 100) / 100,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 30); // 최대 30개 대여소

    return NextResponse.json({
      bikes: nearbyBikes,
      totalStations: stationResult.totalCount,
      source: "api",
      updatedAt: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
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
    facilityType: "무인",
    feeType: "유료",
    distance: Math.round(haversine(lat, lng, lat + o.dlat, lng + o.dlng) * 100) / 100,
  }));
}
