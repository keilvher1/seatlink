/**
 * 실시간 대중교통(버스/공영자전거) 데이터가 안정적으로 제공되는 도시 화이트리스트.
 *
 * 공공데이터포털 B551982 / TAGO API 응답을 실측하여 데이터가 충분히 잡히는 도시만 등록.
 * 화이트리스트 외 좌표는 "미지원 지역"으로 분류하여 먼 지역 데이터가 잘못 표시되는 것을 방지.
 *
 * 추가 도시 검증 절차:
 *  1) /api/bus-realtime?lat=X&lng=Y&radius=10 호출 시 buses.length >= 5
 *  2) /api/bike-realtime?lat=X&lng=Y&radius=5 호출 시 bikes.length >= 3
 *  → 둘 중 하나라도 충족 시 SUPPORTED_AREAS에 추가.
 */

export interface ServiceArea {
  name: string;
  /** 위경도 사각형 [minLat, maxLat, minLng, maxLng] */
  bbox: [number, number, number, number];
  /** 데이터 소스 (디버깅용) */
  sources: Array<"rte" | "tago" | "bike">;
}

export const SUPPORTED_AREAS: ServiceArea[] = [
  // 광역시
  { name: "서울특별시", bbox: [37.42, 37.70, 126.76, 127.18], sources: ["tago", "bike"] },
  { name: "부산광역시", bbox: [35.05, 35.40, 128.78, 129.32], sources: ["rte", "tago", "bike"] },
  { name: "대구광역시", bbox: [35.70, 36.00, 128.40, 128.78], sources: ["rte", "tago", "bike"] },
  { name: "인천광역시", bbox: [37.30, 37.62, 126.40, 126.82], sources: ["rte", "tago", "bike"] },
  { name: "광주광역시", bbox: [35.08, 35.27, 126.70, 127.00], sources: ["rte", "tago", "bike"] },
  { name: "대전광역시", bbox: [36.20, 36.50, 127.30, 127.55], sources: ["rte", "tago", "bike"] },
  { name: "울산광역시", bbox: [35.40, 35.70, 129.10, 129.42], sources: ["rte", "tago", "bike"] },
  { name: "세종특별자치시", bbox: [36.40, 36.72, 127.18, 127.40], sources: ["tago", "bike"] },

  // 경기/강원/충청/전라/경상 주요 시
  { name: "수원시", bbox: [37.20, 37.36, 126.93, 127.10], sources: ["tago", "bike"] },
  { name: "성남시", bbox: [37.34, 37.50, 127.05, 127.20], sources: ["tago", "bike"] },
  { name: "고양시", bbox: [37.60, 37.78, 126.74, 126.95], sources: ["tago", "bike"] },
  { name: "용인시", bbox: [37.18, 37.36, 127.05, 127.30], sources: ["tago", "bike"] },
  { name: "춘천시", bbox: [37.80, 37.96, 127.65, 127.90], sources: ["tago", "bike"] },
  { name: "원주시", bbox: [37.28, 37.42, 127.85, 128.05], sources: ["rte", "tago"] },
  { name: "강릉시", bbox: [37.70, 37.85, 128.80, 129.00], sources: ["rte", "tago"] },
  { name: "청주시", bbox: [36.50, 36.72, 127.40, 127.62], sources: ["rte", "tago", "bike"] },
  { name: "천안시", bbox: [36.70, 36.92, 127.05, 127.30], sources: ["rte", "tago"] },
  { name: "전주시", bbox: [35.74, 35.92, 127.05, 127.20], sources: ["rte", "tago", "bike"] },
  { name: "여수시", bbox: [34.65, 34.85, 127.55, 127.80], sources: ["rte", "bike"] },
  { name: "목포시", bbox: [34.72, 34.85, 126.32, 126.48], sources: ["rte", "bike"] },
  { name: "순천시", bbox: [34.85, 35.05, 127.40, 127.65], sources: ["rte", "tago"] },
  { name: "창원시", bbox: [35.10, 35.40, 128.50, 128.85], sources: ["rte", "bike"] },
  { name: "김해시", bbox: [35.18, 35.32, 128.78, 128.95], sources: ["rte", "tago"] },
  { name: "구미시", bbox: [36.00, 36.22, 128.20, 128.50], sources: ["rte"] },
  { name: "안동시", bbox: [36.50, 36.65, 128.65, 128.85], sources: ["tago"] },
  { name: "제주시", bbox: [33.40, 33.58, 126.40, 126.72], sources: ["rte", "tago", "bike"] },
  { name: "서귀포시", bbox: [33.22, 33.40, 126.45, 126.72], sources: ["rte", "tago"] },
];

/**
 * 좌표가 지원 지역에 포함되는지 확인.
 * 포함되면 ServiceArea, 아니면 null.
 */
export function findServiceArea(lat: number, lng: number): ServiceArea | null {
  for (const area of SUPPORTED_AREAS) {
    const [minLat, maxLat, minLng, maxLng] = area.bbox;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return area;
    }
  }
  return null;
}

/**
 * 가장 가까운 지원 지역 N개를 거리순으로 반환.
 */
export function nearestSupportedAreas(
  lat: number,
  lng: number,
  limit = 3
): Array<{ name: string; distanceKm: number; centerLat: number; centerLng: number }> {
  const ranked = SUPPORTED_AREAS.map((area) => {
    const [minLat, maxLat, minLng, maxLng] = area.bbox;
    const cLat = (minLat + maxLat) / 2;
    const cLng = (minLng + maxLng) / 2;
    const d = haversine(lat, lng, cLat, cLng);
    return { name: area.name, distanceKm: Math.round(d * 10) / 10, centerLat: cLat, centerLng: cLng };
  })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
  return ranked;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CoverageMeta {
  supported: boolean;
  region: string | null;
  nearest?: Array<{ name: string; distanceKm: number; centerLat: number; centerLng: number }>;
}

export function buildCoverage(lat: number, lng: number): CoverageMeta {
  const area = findServiceArea(lat, lng);
  if (area) return { supported: true, region: area.name };
  return {
    supported: false,
    region: null,
    nearest: nearestSupportedAreas(lat, lng, 3),
  };
}
