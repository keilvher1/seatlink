/**
 * 국토교통부 TAGO 버스정류소정보 API 래퍼
 * Base: https://apis.data.go.kr/1613000/BusSttnInfoInqireService
 *
 * 엔드포인트:
 *   - getCrdntPrxmtSttnList     : 좌표기반 근접정류소 (gpsLati + gpsLong, 반경 500m)
 *   - getSttnNoList             : 정류소명/번호로 조회
 *   - getSttnThrghRouteList     : 정류소별 경유노선 (cityCode + nodeid)
 *   - getCtyCodeList            : 도시코드 목록
 *
 * 이 API 덕분에 routeId를 동적으로 수집할 수 있습니다:
 *   GPS좌표 → 근처 정류소 → 경유 노선ID → 버스위치정보 API 호출
 */

const STN_BASE = "https://apis.data.go.kr/1613000/BusSttnInfoInqireService";

export interface NearbyStation {
  cityCode: number;
  nodeId: string;
  nodeNm: string;
  nodeNo?: string;
  lat: number;
  lng: number;
}

export interface ThroughRoute {
  routeId: string;
  routeNo: string;
  routeTp: string;
  startNodeNm?: string;
  endNodeNm?: string;
}

function encodeKey(k: string): string {
  return k.includes("%") ? k : encodeURIComponent(k);
}

async function stnFetch(endpoint: string, params: Record<string, string>): Promise<any> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) throw new Error("DATA_GO_KR_API_KEY not set");

  const query = new URLSearchParams({ ...params, _type: "json" });
  const url = `${STN_BASE}/${endpoint}?serviceKey=${encodeKey(apiKey)}&${query.toString()}`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    if (text.startsWith("<") || text === "Forbidden" || text === "Unauthorized") {
      throw new Error(`TAGO STN error: ${text.slice(0, 80)}`);
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(t);
  }
}

function pickItems(resp: any): any[] {
  const body = resp?.response?.body;
  if (!body) return [];
  const raw = body.items?.item ?? body.items ?? [];
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

// ── 캐시 ──
const stnCache = new Map<string, { data: NearbyStation[]; time: number }>();
const STN_TTL = 5 * 60 * 1000; // 5분 (정류소 위치는 거의 안 변함)

const routeListCache = new Map<string, { data: ThroughRoute[]; time: number }>();
const ROUTE_LIST_TTL = 60 * 60 * 1000; // 1시간 (경유노선 거의 안 변함)

/** GPS 좌표 기반 근접 정류소 (반경 500m) */
export async function getNearbyStations(
  lat: number,
  lng: number,
  numOfRows = 20
): Promise<NearbyStation[]> {
  // 캐시 키: 좌표 소수점 3자리(약 100m 단위)
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${numOfRows}`;
  const cached = stnCache.get(key);
  const now = Date.now();
  if (cached && now - cached.time < STN_TTL) return cached.data;

  const resp = await stnFetch("getCrdntPrxmtSttnList", {
    gpsLati: String(lat),
    gpsLong: String(lng),
    numOfRows: String(numOfRows),
    pageNo: "1",
  });

  const items: NearbyStation[] = pickItems(resp).map((s: any) => ({
    cityCode: Number(s.citycode),
    nodeId: String(s.nodeid ?? ""),
    nodeNm: String(s.nodenm ?? ""),
    nodeNo: s.nodeno ? String(s.nodeno) : undefined,
    lat: Number(s.gpslati ?? 0),
    lng: Number(s.gpslong ?? 0),
  }));

  stnCache.set(key, { data: items, time: now });
  return items;
}

/** 정류소별 경유 노선 목록 */
export async function getStationRoutes(
  cityCode: number | string,
  nodeId: string
): Promise<ThroughRoute[]> {
  const key = `${cityCode}:${nodeId}`;
  const cached = routeListCache.get(key);
  const now = Date.now();
  if (cached && now - cached.time < ROUTE_LIST_TTL) return cached.data;

  const resp = await stnFetch("getSttnThrghRouteList", {
    cityCode: String(cityCode),
    nodeid: nodeId,
    numOfRows: "100",
    pageNo: "1",
  });

  const items: ThroughRoute[] = pickItems(resp).map((r: any) => ({
    routeId: String(r.routeid ?? ""),
    routeNo: String(r.routeno ?? ""),
    routeTp: String(r.routetp ?? ""),
    startNodeNm: r.startnodenm ? String(r.startnodenm) : undefined,
    endNodeNm: r.endnodenm ? String(r.endnodenm) : undefined,
  })).filter((r) => r.routeId);

  routeListCache.set(key, { data: items, time: now });
  return items;
}

/**
 * 사용자 좌표 기반으로 주변에 실제 운행중인 노선(cityCode + routeId)을 수집.
 * → TAGO 버스위치정보 API 호출에 바로 사용 가능한 형태.
 *
 * @param lat, lng    사용자 좌표
 * @param maxStations 정류소 몇 개까지 조회할지 (기본 10)
 * @param maxRoutes   최종 반환 최대 노선 수 (기본 30)
 */
export async function collectNearbyRoutes(
  lat: number,
  lng: number,
  maxStations = 10,
  maxRoutes = 30
): Promise<Array<{ cityCode: number; routeId: string; routeNo: string }>> {
  const stations = await getNearbyStations(lat, lng, maxStations);
  if (stations.length === 0) return [];

  // 정류소별 경유노선 병렬 조회 (8개씩 배치)
  const BATCH = 8;
  const allRoutes: Array<{ cityCode: number; routeId: string; routeNo: string }> = [];

  for (let i = 0; i < stations.length; i += BATCH) {
    const slice = stations.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map((st) =>
        getStationRoutes(st.cityCode, st.nodeId)
          .then((routes) =>
            routes.map((r) => ({
              cityCode: st.cityCode,
              routeId: r.routeId,
              routeNo: r.routeNo,
            }))
          )
          .catch((err) => {
            console.error(`[TAGO STN] ${st.nodeId} failed:`, err.message);
            return [];
          })
      )
    );
    for (const rs of results) allRoutes.push(...rs);
  }

  // routeId 기준 중복 제거
  const seen = new Set<string>();
  const uniq: typeof allRoutes = [];
  for (const r of allRoutes) {
    const k = `${r.cityCode}:${r.routeId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(r);
    if (uniq.length >= maxRoutes) break;
  }

  return uniq;
}
