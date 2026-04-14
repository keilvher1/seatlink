/**
 * 국토교통부 TAGO 버스위치정보 API 래퍼
 * Base: https://apis.data.go.kr/1613000/BusLcInfoInqireService
 *
 * 엔드포인트:
 *   - getCtyCodeList                      : 도시코드 목록 (파라미터 없음)
 *   - getRouteAcctoBusLcList              : 노선별 버스 위치 (cityCode + routeId 필수)
 *   - getRouteAcctoSpcifySttnAccesBusLcInfo : 특정 정류소 접근 버스 (cityCode + routeId + nodeId)
 *
 * ⚠️ 참고: 노선별 조회이므로 "전국 모든 버스"를 한 번에 가져올 수 없습니다.
 * 노선ID는 별도의 "국토교통부(TAGO)_버스노선정보" API(BusRouteInfoInqireService) 신청 필요:
 *   https://www.data.go.kr/data/15098534/openapi.do
 */

const TAGO_BASE = "https://apis.data.go.kr/1613000/BusLcInfoInqireService";

export interface TagoCity {
  citycode: number;
  cityname: string;
}

export interface TagoBusLocation {
  vehicleno: string;       // 차량번호
  routenm: string;          // 노선번호 (예: "202")
  routetp: string;          // 노선유형 (예: "간선버스")
  gpslati: number;          // WGS84 위도
  gpslong: number;          // WGS84 경도
  nodeid: string;           // 현재 접근 정류소ID
  nodenm: string;           // 현재 접근 정류소명
  nodeord: number;          // 정류소 순서
}

// ── 메모리 캐시 ──
let cityCache: TagoCity[] = [];
let cityCacheTime = 0;
const CITY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

let busByRouteCache: Map<string, { data: TagoBusLocation[]; time: number }> = new Map();
const BUS_CACHE_TTL = 30 * 1000; // 30초 (TAGO는 10~20초 갱신)

function encodeKey(key: string): string {
  return key.includes("%") ? key : encodeURIComponent(key);
}

async function tagoFetch(endpoint: string, params: Record<string, string>): Promise<any> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) throw new Error("DATA_GO_KR_API_KEY not set");

  const query = new URLSearchParams({ ...params, _type: "json" });
  const url = `${TAGO_BASE}/${endpoint}?serviceKey=${encodeKey(apiKey)}&${query.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    if (text.startsWith("<") || text === "Forbidden" || text === "Unauthorized") {
      throw new Error(`TAGO API error: ${text.slice(0, 100)}`);
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timeout);
  }
}

function pickItems(resp: any): any[] {
  const body = resp?.response?.body;
  if (!body) return [];
  const raw = body.items?.item ?? body.items ?? [];
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

/** TAGO 서비스 가능 도시코드 목록 (24시간 캐시) */
export async function getTagoCities(): Promise<TagoCity[]> {
  const now = Date.now();
  if (cityCache.length > 0 && now - cityCacheTime < CITY_CACHE_TTL) {
    return cityCache;
  }

  const resp = await tagoFetch("getCtyCodeList", { numOfRows: "300", pageNo: "1" });
  const items = pickItems(resp).map((c: any) => ({
    citycode: Number(c.citycode),
    cityname: String(c.cityname),
  }));

  if (items.length > 0) {
    cityCache = items;
    cityCacheTime = now;
    console.log(`[TAGO] Cached ${items.length} city codes`);
  }
  return cityCache;
}

/** 특정 노선의 실시간 버스 위치 (30초 캐시) */
export async function getTagoBusesByRoute(
  cityCode: string | number,
  routeId: string
): Promise<TagoBusLocation[]> {
  const cacheKey = `${cityCode}:${routeId}`;
  const cached = busByRouteCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.time < BUS_CACHE_TTL) {
    return cached.data;
  }

  const resp = await tagoFetch("getRouteAcctoBusLcList", {
    cityCode: String(cityCode),
    routeId,
    numOfRows: "100",
    pageNo: "1",
  });

  const items: TagoBusLocation[] = pickItems(resp).map((b: any) => ({
    vehicleno: String(b.vehicleno ?? ""),
    routenm: String(b.routenm ?? ""),
    routetp: String(b.routetp ?? ""),
    gpslati: Number(b.gpslati ?? 0),
    gpslong: Number(b.gpslong ?? 0),
    nodeid: String(b.nodeid ?? ""),
    nodenm: String(b.nodenm ?? ""),
    nodeord: Number(b.nodeord ?? 0),
  }));

  busByRouteCache.set(cacheKey, { data: items, time: now });
  return items;
}

/**
 * 여러 노선의 버스를 병렬로 모아서 반환
 * routes: [{ cityCode, routeId }, ...]
 */
export async function getTagoBusesByRoutes(
  routes: Array<{ cityCode: string | number; routeId: string }>
): Promise<TagoBusLocation[]> {
  if (routes.length === 0) return [];

  // 동시 요청 제한 (8개씩 배치)
  const BATCH = 8;
  const all: TagoBusLocation[] = [];
  for (let i = 0; i < routes.length; i += BATCH) {
    const slice = routes.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map((r) =>
        getTagoBusesByRoute(r.cityCode, r.routeId).catch((err) => {
          console.error(`[TAGO] route ${r.routeId} failed:`, err.message);
          return [] as TagoBusLocation[];
        })
      )
    );
    all.push(...results.flat());
  }
  return all;
}

/**
 * 전국 주요 도시 → cityCode 맵 (TAGO 기준)
 * ⚠️ 서울은 TAGO에 포함되지 않음 (서울특별시_버스위치정보 별도 API 필요)
 */
export const TAGO_MAJOR_CITIES = {
  세종: 12,
  부산: 21,
  대구: 22,
  인천: 23,
  광주: 24,
  대전: 25,
  울산: 26,
  제주: 39,
  수원: 31010,
  성남: 31020,
  고양: 31100,
  용인: 31190,
  창원: 38010,
  청주: 33010,
  천안: 34010,
  전주: 37010,
  포항: 36010,
} as const;
