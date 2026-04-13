import { CongestionLevel } from "./types";

/** Tailwind 클래스 병합 유틸리티 */
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Haversine 거리 계산 (km) */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** 혼잡도 레벨 판정 */
export function getCongestionLevel(percent: number): CongestionLevel {
  if (percent < 40) return "여유";
  if (percent <= 70) return "보통";
  return "혼잡";
}

/** 혼잡도에 따른 색상 클래스 */
export function getCongestionColor(level: CongestionLevel | string | undefined) {
  switch (level) {
    case "여유": return { bg: "bg-green-500", text: "text-green-600", light: "bg-green-100", border: "border-green-500" };
    case "보통": return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-100", border: "border-amber-500" };
    case "혼잡": return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-100", border: "border-red-500" };
    default: return { bg: "bg-slate-400", text: "text-slate-600", light: "bg-slate-100", border: "border-slate-400" };
  }
}

/** 혼잡도 hex 색상 */
export function getCongestionHex(percent: number): string {
  if (percent < 30) return "#22c55e";
  if (percent < 50) return "#84cc16";
  if (percent < 70) return "#f59e0b";
  if (percent < 85) return "#f97316";
  return "#ef4444";
}

/** 거리를 사람이 읽기 쉬운 형태로 변환 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/** 이동 시간 추정 (도보 기준 시속 4km) */
export function estimateTravelTime(km: number): number {
  return Math.round((km / 4) * 60);
}
