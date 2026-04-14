import { NextRequest, NextResponse } from "next/server";
import { getTagoBusesByRoutes, type TagoBusLocation } from "@/lib/tago";
import { TAGO_TRACKED_ROUTES } from "@/lib/tago-routes";
import { collectNearbyRoutes } from "@/lib/tago-stations";

/**
 * 버스 실시간 위치 API (전국)
 *
 * 데이터 소스 2개 병합:
 *   1) B551982/rte (초정밀버스) — 전국 34페이지 페이지네이션, 약 33,000대
 *      커버: 울산, 충주, 제천, 목포, 여수, 무안, 함평, 구미, 창원, 함양, 춘천 등
 *   2) 1613000/BusLcInfoInqireService (TAGO) — 노선별 조회
 *      커버: 부산(21), 대구(22), 인천(23), 광주(24), 대전(25), 세종(12), 제주(39), 수도권 등
 *      ⚠️ routeId 필수 → src/lib/tago-routes.ts 에 노선 등록 필요
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

// ── 서버 메모리 캐시 ──
let busCache: any[] = [];
let busCacheTime = 0;
const BUS_CACHE_TTL = 60 * 1000; // 1분 (실시간 데이터)

let routeCache: Map<string, any> = new Map();
let routeCacheTime = 0;
const ROUTE_CACHE_TTL = 5 * 60 * 1000; // 5분 (노선 정보는 잘 안변함)

async function fetchPage(endpoint: string, pageNo: number): Promise<any[]> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) return [];

  const encodedKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
  const query = new URLSearchParams({
    pageNo: String(pageNo),
    numOfRows: "1000",
    type: "json",
  });
  const url = `${BUS_API_BASE}${endpoint}?serviceKey=${encodedKey}&${query.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
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
    console.error(`[BusAPI] Page ${pageNo} ${endpoint} error:`, err.message);
    return [];
  }
}

// 전국 버스 실시간 위치 (약 34,000건)
async function getAllBusLocations(): Promise<any[]> {
  const now = Date.now();
  if (busCache.length > 0 && (now - busCacheTime) < BUS_CACHE_TTL) {
    return busCache;
  }

  console.log("[BusAPI] Refreshing bus location cache (34 pages)...");
  const startTime = Date.now();

  // 34페이지를 5개씩 배치로 호출 (동시에 너무 많은 요청 방지)
  const TOTAL_PAGES = 34;
  const BATCH_SIZE = 7;
  let allItems: any[] = [];

  for (let batch = 0; batch < Math.ceil(TOTAL_PAGES / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE + 1;
    const end = Math.min(start + BATCH_SIZE, TOTAL_PAGES + 1);
    const pages = Array.from({ length: end - start }, (_, i) =>
      fetchPage("/rtm_loc_info", start + i)
    );
    const results = await Promise.all(pages);
    allItems = allItems.concat(results.flat());
  }

  const elapsed = Date.now() - startTime;
  console.log(`[BusAPI] Fetched ${allItems.length} bus locations in ${elapsed}ms`);

  if (allItems.length > 0) {
    busCache = allItems;
    busCacheTime = now;
  }

  return busCache;
}

// 전국 노선 마스터 정보 (약 2,500건)
async function getRouteMap(): Promise<Map<string, any>> {
  const now = Date.now();
  if (routeCache.size > 0 && (now - routeCacheTime) < ROUTE_CACHE_TTL) {
    return routeCache;
  }

  console.log("[BusAPI] Refreshing route master cache...");
  const pages = await Promise.all(
    Array.from({ length: 3 }, (_, i) => fetchPage("/mst_info", i + 1))
  );
  const allRoutes = pages.flat();

  const newMap = new Map<string, any>();
  for (const r of allRoutes) {
    if (r.rteId) {
      newMap.set(r.rteId, {
        rteNo: r.rteNo || "",
        rteType: r.rteType || "",
        stpnt: r.stpnt || "",
        edpnt: r.edpnt || "",
        lclgvNm: r.lclgvNm || "",
      });
    }
  }

  if (newMap.size > 0) {
    routeCache = newMap;
    routeCacheTime = now;
    console.log(`[BusAPI] Cached ${newMap.size} routes`);
  }

  return routeCache;
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
    // 0) 사용자 위치 주변 노선 자동 수집 (정류소정보 API)
    //    → TAGO 버스위치조회에 필요한 routeId 목록을 동적으로 확보
    const dynamicRoutesPromise = collectNearbyRoutes(userLat, userLng, 10, 30)
      .catch((err) => {
        console.error("[TAGO STN] collectNearbyRoutes failed:", err.message);
        return [] as Array<{ cityCode: number; routeId: string; routeNo: string }>;
      });

    // 동적 노선 + 정적 추적 노선 합침
    const dynamicRoutes = await dynamicRoutesPromise;
    const tagoRoutes = [
      ...TAGO_TRACKED_ROUTES.map((r) => ({ cityCode: Number(r.cityCode), routeId: r.routeId })),
      ...dynamicRoutes.map((r) => ({ cityCode: r.cityCode, routeId: r.routeId })),
    ];

    // 세 데이터 소스 병렬 조회
    const [allBuses, routeMap, tagoBuses] = await Promise.all([
      getAllBusLocations(),
      getRouteMap(),
      tagoRoutes.length > 0
        ? getTagoBusesByRoutes(tagoRoutes).catch((err) => {
            console.error("[TAGO] fetch failed:", err.message);
            return [] as TagoBusLocation[];
          })
        : Promise.resolve([] as TagoBusLocation[]),
    ]);

    // 1) rte API 버스 → 공통 포맷
    const rteBuses = allBuses
      .map((bus: any) => {
        const lat = parseFloat(bus.lat || "0");
        const lng = parseFloat(bus.lot || "0");
        if (!lat || !lng) return null;

        const dist = haversine(userLat, userLng, lat, lng);
        if (dist > radiusKm) return null;

        const route = routeMap.get(bus.rteId) || {};
        const speed = parseInt(bus.oprSpd || "0");

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
          lastUpdate: bus.gthrDt || "",
          source: "rte" as const,
        };
      })
      .filter(Boolean) as any[];

    // 2) TAGO 버스 → 공통 포맷
    const tagoFormatted = tagoBuses
      .map((b) => {
        if (!b.gpslati || !b.gpslong) return null;
        const dist = haversine(userLat, userLng, b.gpslati, b.gpslong);
        if (dist > radiusKm) return null;
        return {
          vhclNo: b.vehicleno,
          rteId: "",
          rteNo: b.routenm,
          rteType: b.routetp,
          lat: b.gpslati,
          lng: b.gpslong,
          speed: 0, // TAGO는 속도 미제공
          direction: 0,
          distance: Math.round(dist * 100) / 100,
          region: "",
          stpnt: "",
          edpnt: b.nodenm, // 접근 정류소명
          lastUpdate: new Date().toISOString(),
          source: "tago" as const,
        };
      })
      .filter(Boolean) as any[];

    // 3) 병합 + 차량번호 기준 중복 제거
    const merged = [...rteBuses, ...tagoFormatted];
    const seen = new Set<string>();
    const deduped = merged.filter((b) => {
      const key = b.vhclNo || `${b.lat},${b.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const nearbyBuses = deduped
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 50);

    return NextResponse.json({
      buses: nearbyBuses,
      totalAvailable: allBuses.length + tagoBuses.length,
      sources: {
        rte: rteBuses.length,
        tago: tagoFormatted.length,
        tagoRoutesTracked: TAGO_TRACKED_ROUTES.length,
        tagoRoutesDynamic: dynamicRoutes.length,
      },
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
