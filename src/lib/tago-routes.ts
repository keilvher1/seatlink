/**
 * TAGO 추적 노선 설정
 *
 * TAGO API(BusLcInfoInqireService)는 cityCode + routeId가 필수입니다.
 * "국토교통부(TAGO)_버스노선정보" API 신청 후 routeId를 대량 확보할 수 있습니다:
 *   https://www.data.go.kr/data/15098534/openapi.do
 *
 * 그 전까지는 이 파일에 주요 도시의 대표 노선들을 수동으로 등록합니다.
 * (routeId는 data.go.kr 노선정보 API 또는 미리보기로 확보 가능)
 */

export interface TrackedRoute {
  cityCode: number;
  routeId: string;
  label?: string; // 디버깅/표시용
}

/**
 * 현재 추적중인 노선 목록.
 * TODO: 버스노선정보 API 신청 후 자동 채우기
 *
 * cityCode 참고:
 *   21=부산, 22=대구, 23=인천, 24=광주, 25=대전, 26=울산
 *   31010=수원, 31020=성남, 31100=고양
 */
export const TAGO_TRACKED_ROUTES: TrackedRoute[] = [
  // 대전 샘플 (문서 예제 기반) — 실제 운영시 노선정보 API로 교체
  // { cityCode: 25, routeId: "DJB30300052", label: "대전 202번" },
];
