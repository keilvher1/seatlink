/**
 * 공공데이터포털 API 클라이언트
 * data.go.kr Open API 호출 유틸리티
 */

const BASE_URLS = {
  library: "https://apis.data.go.kr/B551982/plr_v2",
  bike: "https://apis.data.go.kr/B551982/pbdo_v2",
  bus: "https://apis.data.go.kr/B551982/rte",
  accessible: "https://apis.data.go.kr/B551982/tsdo_v2",
  signal: "https://apis.data.go.kr/B551982/rti",
  civilAffairs: "https://apis.data.go.kr/B551982",
} as const;

interface FetchOptions {
  pageNo?: number;
  numOfRows?: number;
  stdgCd?: string;
  [key: string]: string | number | undefined;
}

/**
 * 공공데이터포털 API 호출 함수
 */
export async function fetchPublicAPI<T = any>(
  baseUrl: string,
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ items: T[]; totalCount: number }> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    console.warn("DATA_GO_KR_API_KEY not set, using mock data");
    return { items: [], totalCount: 0 };
  }

  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: String(options.pageNo || 1),
    numOfRows: String(options.numOfRows || 100),
    type: "json",
  });

  // 추가 파라미터
  if (options.stdgCd) params.set("stdgCd", options.stdgCd);
  Object.entries(options).forEach(([key, val]) => {
    if (val !== undefined && !["pageNo", "numOfRows", "stdgCd"].includes(key)) {
      params.set(key, String(val));
    }
  });

  const url = `${baseUrl}${endpoint}?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // 공공데이터 API 표준 응답 구조 파싱
    const body = data?.response?.body;
    if (!body) {
      return { items: [], totalCount: 0 };
    }

    const items = body.items?.item || body.items || [];
    const totalCount = body.totalCount || 0;

    return {
      items: Array.isArray(items) ? items : [items],
      totalCount,
    };
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return { items: [], totalCount: 0 };
  }
}

// ========================
// 도서관 API
// ========================
export async function fetchLibraryInfo(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.library, "/info_v2", { stdgCd, numOfRows: 200 });
}

export async function fetchLibraryStatus(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.library, "/prst_info_v2", { stdgCd, numOfRows: 200 });
}

export async function fetchLibraryRealtime(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.library, "/rlt_rdrm_info_v2", { stdgCd, numOfRows: 500 });
}

// ========================
// 자전거 API
// ========================
export async function fetchBikeStations(lcgvmnInstCd?: string) {
  return fetchPublicAPI(BASE_URLS.bike, "/inf_101_00010001_v2", { lcgvmnInstCd });
}

export async function fetchBikeAvailability(lcgvmnInstCd?: string) {
  return fetchPublicAPI(BASE_URLS.bike, "/inf_101_00010002_v2", { lcgvmnInstCd });
}

// ========================
// 버스 API
// ========================
export async function fetchBusRoutes(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.bus, "/mst_info", { stdgCd });
}

export async function fetchBusStops(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.bus, "/ps_info", { stdgCd });
}

export async function fetchBusRealtime(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.bus, "/rtm_loc_info", { stdgCd });
}

// ========================
// 교통약자 API
// ========================
export async function fetchAccessibleCenters(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.accessible, "/center_info_v2", { stdgCd });
}

export async function fetchAccessibleVehicles(stdgCd?: string) {
  return fetchPublicAPI(BASE_URLS.accessible, "/info_vehicle_use_v2", { stdgCd });
}
