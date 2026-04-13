/**
 * 공공데이터포털 API 클라이언트
 * data.go.kr Open API 호출 유틸리티
 *
 * ⚠️ 핵심 주의사항:
 * - serviceKey는 URLSearchParams를 통하지 않고 직접 URL에 삽입해야 함
 *   (URLSearchParams가 이미 인코딩된 키를 이중 인코딩하는 문제 방지)
 * - .env.local에는 Decoding(디코딩) 키를 저장
 * - URL 조립 시 encodeURIComponent로 한번만 인코딩
 */

const BASE_URLS = {
  library: "https://apis.data.go.kr/B551982/plr_v2",
  bike: "https://apis.data.go.kr/B551982/pbdo_v2",
  bus: "https://apis.data.go.kr/B551982/rte",
  accessible: "https://apis.data.go.kr/B551982/tsdo_v2",
  signal: "https://apis.data.go.kr/B551982/rti",
} as const;

interface FetchOptions {
  pageNo?: number;
  numOfRows?: number;
  stdgCd?: string;
  [key: string]: string | number | undefined;
}

/**
 * 공공데이터포털 API 호출 함수
 * - serviceKey 이중 인코딩 방지를 위해 URL 직접 조립
 * - 응답 구조 다양한 형태 대응
 */
export async function fetchPublicAPI<T = any>(
  baseUrl: string,
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ items: T[]; totalCount: number; error?: string }> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    console.warn("DATA_GO_KR_API_KEY not set, returning empty");
    return { items: [], totalCount: 0 };
  }

  const encodedKey = apiKey.includes("%")
    ? apiKey
    : encodeURIComponent(apiKey);

  const params = new URLSearchParams();
  params.set("pageNo", String(options.pageNo || 1));
  params.set("numOfRows", String(options.numOfRows || 100));
  params.set("type", "json");

  Object.entries(options).forEach(([key, val]) => {
    if (val !== undefined && !["pageNo", "numOfRows"].includes(key)) {
      params.set(key, String(val));
    }
  });

  const url = `${baseUrl}${endpoint}?serviceKey=${encodedKey}&${params.toString()}`;
  console.log(`[API] Calling: ${baseUrl}${endpoint} (numOfRows: ${options.numOfRows || 100})`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (contentType.includes("xml") || text.startsWith("<?xml") || text.startsWith("<")) {
      console.error(`[API] XML error response from ${endpoint}:`, text.substring(0, 500));
      const errMsg = text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)?.[1]
        || text.match(/<errMsg>(.*?)<\/errMsg>/)?.[1]
        || text.match(/<resultMsg>(.*?)<\/resultMsg>/)?.[1]
        || "Unknown XML error";
      console.error(`[API] Error message: ${errMsg}`);
      return { items: [], totalCount: 0, error: errMsg };
    }

    if (!res.ok) {
      console.error(`[API] HTTP Error: ${res.status} ${res.statusText}`);
      return { items: [], totalCount: 0, error: `HTTP ${res.status}` };
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`[API] JSON parse failed for ${endpoint}`);
      return { items: [], totalCount: 0, error: "JSON parse failed" };
    }

    // 구조 1: { response: { header, body: { items } } } — 도서관 API 등
    const header = data?.response?.header;
    if (header && header.resultCode && header.resultCode !== "00" && header.resultCode !== "0000") {
      console.error(`[API] API Error: code=${header.resultCode}`);
      return { items: [], totalCount: 0, error: `API code ${header.resultCode}` };
    }

    // 구조 2: { header: { resultCode }, body: { item } } — 교통약자 API 등
    const header2 = data?.header;
    if (header2 && header2.resultCode && header2.resultCode !== "K0" && header2.resultCode !== "00" && header2.resultCode !== "0000") {
      console.error(`[API] API Error (v2): code=${header2.resultCode}, msg=${header2.resultMsg}`);
      return { items: [], totalCount: 0, error: `API code ${header2.resultCode}: ${header2.resultMsg}` };
    }

    // body 추출: response.body 또는 직접 body
    const body = data?.response?.body || data?.body;
    if (body) {
      let items: any[];
      // items 또는 item 필드 탐색
      const rawItems = body.items ?? body.item;

      if (rawItems === null || rawItems === undefined || rawItems === "") {
        items = [];
      } else if (Array.isArray(rawItems)) {
        items = rawItems;
      } else if (rawItems?.item) {
        items = Array.isArray(rawItems.item) ? rawItems.item : [rawItems.item];
      } else if (typeof rawItems === "object") {
        items = [rawItems];
      } else {
        items = [];
      }

      const totalCount = parseInt(body.totalCount) || items.length;
      console.log(`[API] ${endpoint}: ${items.length} items (total: ${totalCount})`);
      return { items, totalCount };
    }

    if (Array.isArray(data)) return { items: data, totalCount: data.length };
    if (data?.data && Array.isArray(data.data)) return { items: data.data, totalCount: data.data.length };

    console.warn(`[API] Unexpected response structure for ${endpoint}:`, Object.keys(data || {}));
    return { items: [], totalCount: 0 };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error(`[API] Timeout for ${endpoint} (15s)`);
      return { items: [], totalCount: 0, error: "Timeout 15s" };
    } else {
      console.error(`[API] Failed to fetch ${endpoint}:`, error.message || error);
    }
    return { items: [], totalCount: 0, error: error.message || "Unknown error" };
  }
}

export async function fetchLibraryInfo(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.library, "/info_v2", { stdgCd, numOfRows: 500 });
}

export async function fetchLibraryStatus(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.library, "/prst_info_v2", { stdgCd, numOfRows: 500 });
}

export async function fetchLibraryRealtime(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.library, "/rlt_rdrm_info_v2", { stdgCd, numOfRows: 1000 });
}

export async function fetchBikeStations(lcgvmnInstCd?: string) {
  return fetchPublicAPI(BASE_URLS.bike, "/inf_101_00010001_v2", { lcgvmnInstCd });
}

export async function fetchBikeAvailability(lcgvmnInstCd?: string) {
  return fetchPublicAPI(BASE_URLS.bike, "/inf_101_00010002_v2", { lcgvmnInstCd });
}

export async function fetchBusRoutes(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.bus, "/mst_info", { stdgCd });
}

export async function fetchBusStops(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.bus, "/ps_info", { stdgCd });
}

export async function fetchBusRealtime(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.bus, "/rtm_loc_info", { stdgCd });
}

export async function fetchAccessibleCenters(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.accessible, "/center_info_v2", { stdgCd });
}

export async function fetchAccessibleVehicles(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.accessible, "/info_vehicle_use_v2", { stdgCd });
}
