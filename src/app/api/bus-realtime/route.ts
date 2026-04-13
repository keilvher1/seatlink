import { NextRequest, NextResponse } from "next/server";

/**
 * 버스 실시간 위치 API
 * 초정밀 GPS 기반 버스 위치 정보를 반환
 *
 * Query params:
 *   lat, lng  — 사용자 좌표 (필수)
 *   radius    — 반경 km (기본 5)
 */

const BUS_API_BASE = "https://apis.data.go.kr/B551982/rte";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchBusAPI(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return { items: [], totalCount: 0 };

  const encodedKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
  const query = new URLSearchParams({ pageNo: "1", numOfRows: "1000", type: "json", ...params });
  const url = `${BUS_API_BASE}${endpoint}?serviceKey=${encodedKey}&${query.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    clearTimeout(timeout);

    const text = await res.text();
    if (text.startsWith("<") || text.startsWith("<?xml")) {
      console.error(`[BusAPI] XML error from ${endpoint}`);
      return { items: [], totalCount: 0 };
    }

    const data = JSON.parse(text);
    const body = data?.response?.body || data?.body;
    if (!body) return { items: [], totalCount: 0 };

    const rawItems = body.items?.item ?? body.items ?? body.item ?? [];
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
    return { items, totalCount: parseInt(body.totalCount) || items.length };
  } catch (err: any) {
    console.error(`[BusAPI] Error fetching ${endpoint}:`, err.message);
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
      buses: getMockBuses(userLat, userLng),
      source: "mock",
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    // 실시간 위치 + 노선 정보를 병렬로 가져오기
    const [realtimeResult, routeResult] = await Promise.all([
      fetchBusAPI("/rtm_loc_info"),
      fetchBusAPI("/mst_info"),
    ]);

    // 노선 Map: rteId -> { rteNo, rteType, stpnt, edpnt }
    const routeMap = new Map<string, any>();
    for (const r of routeResult.items) {
      if (r.rteId) {
        routeMap.set(r.rteId, {
          rteNo: r.rteNo || "",
          rteType: r.rteType || "",
          stpnt: r.stpnt || "",
          edpnt: r.edpnt || "",
          lclgvNm: r.lclgvNm || "",
        });
      }
    }

    // 실시간 위치에서 사용자 주변 버스 필터링
    const now = Date.now();
    const nearbyBuses = realtimeResult.items
      .map((bus: any) => {
        const lat = parseFloat(bus.lat || "0");
        const lng = parseFloat(bus.lot || "0");
        if (!lat || !lng) return null;

        const dist = haversine(userLat, userLng, lat, lng);
        if (dist > radiusKm) return null;

        const route = routeMap.get(bus.rteId) || {};
        const speed = parseInt(bus.oprSpd || "0");

        // 데이터 수집 시간 파싱 (gthrDt: "2026-04-13 20:45:39.062577")
        const gthrDt = bus.gthrDt || "";

        return {
          vhclNo: bus.vhclNo || "",
          rteId: bus.rteId || "",
          rteNo: route.rteNo || bus.rteNo || "",
          rteType: route.rteType || "",
          lat,
          lng,
          speed,
          direction: parseInt(bus.oprDrct || "0"),
          distance: Math.round(dist * 100) / 100,
          region: route.lclgvNm || bus.lclgvNm || "",
          stpnt: route.stpnt || "",
          edpnt: route.edpnt || "",
          lastUpdate: gthrDt,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 50); // 최대 50대

    return NextResponse.json({
      buses: nearbyBuses,
      totalAvailable: realtimeResult.totalCount,
      source: "api",
      updatedAt: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error: any) {
    console.error("[BusAPI] Fatal:", error.message);
    return NextResponse.json({
      buses: getMockBuses(userLat, userLng),
      source: "error-fallback",
      error: error.message,
      updatedAt: new Date().toISOString(),
    });
  }
}

function getMockBuses(lat: number, lng: number) {
  const offsets = [
    { dlat: 0.003, dlng: 0.002, rteNo: "101", speed: 35 },
    { dlat: -0.002, dlng: 0.004, rteNo: "202", speed: 0 },
    { dlat: 0.001, dlng: -0.003, rteNo: "303", speed: 22 },
    { dlat: -0.004, dlng: -0.001, rteNo: "501", speed: 45 },
    { dlat: 0.005, dlng: 0.001, rteNo: "707", speed: 18 },
  ];

  return offsets.map((o, i) => ({
    vhclNo: `mock_${i}`,
    rteId: `mock_rte_${i}`,
    rteNo: o.rteNo,
    rteType: "시내버스",
    lat: lat + o.dlat,
    lng: lng + o.dlng,
    speed: o.speed,
    direction: Math.floor(Math.random() * 360),
    distance: Math.round(haversine(lat, lng, lat + o.dlat, lng + o.dlng) * 100) / 100,
    region: "",
    stpnt: "",
    edpnt: "",
    lastUpdate: new Date().toISOString(),
  }));
}
