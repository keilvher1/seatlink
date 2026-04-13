import { NextRequest, NextResponse } from "next/server";
import {
  fetchBikeStations,
  fetchBikeAvailability,
  fetchBusRoutes,
  fetchBusStops,
  fetchBusRealtime,
  fetchAccessibleCenters,
  fetchAccessibleVehicles,
} from "@/lib/api-client";
import { haversineDistance } from "@/lib/utils";

/**
 * 교통 정보 통합 API
 * - 공공자전거 대여소 + 가용 현황
 * - 버스 노선 + 정류장 + 실시간 위치
 * - 교통약자 이동지원센터 + 차량 현황
 *
 * Query params:
 *   lat, lng  — 기준 좌표 (필수)
 *   radius    — 반경 km (기본 2)
 *   stdgCd    — 행정구역코드 (선택)
 *   types     — 쉼표 구분: bike,bus,accessible (기본 전체)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userLat = parseFloat(searchParams.get("lat") || "0");
  const userLng = parseFloat(searchParams.get("lng") || "0");
  const radius = parseFloat(searchParams.get("radius") || "2");
  const stdgCd = searchParams.get("stdgCd") || undefined;
  const types = (searchParams.get("types") || "bike,bus,accessible").split(",");

  if (!userLat || !userLng) {
    return NextResponse.json(
      { error: "lat, lng 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  if (!process.env.DATA_GO_KR_API_KEY) {
    return NextResponse.json({
      bikes: getMockBikes(userLat, userLng),
      buses: getMockBuses(),
      accessibleTransport: getMockAccessible(),
      source: "mock",
      updatedAt: new Date().toISOString(),
    });
  }

  const result: any = {
    bikes: [],
    buses: [],
    accessibleTransport: null,
    source: "api",
    updatedAt: new Date().toISOString(),
  };

  try {
    const promises: Promise<void>[] = [];

    // ── 공공자전거 ──
    if (types.includes("bike")) {
      promises.push(
        (async () => {
          const [stationsRes, availRes] = await Promise.allSettled([
            fetchBikeStations(stdgCd ? stdgCd.substring(0, 5) : undefined),
            fetchBikeAvailability(stdgCd ? stdgCd.substring(0, 5) : undefined),
          ]);

          const stations =
            stationsRes.status === "fulfilled" ? stationsRes.value.items : [];
          const availability =
            availRes.status === "fulfilled" ? availRes.value.items : [];

          // 가용 현황을 Map으로
          const availMap = new Map<string, any>();
          for (const a of availability) {
            const id = a.sttId || a.stationId || a.lcgvmnInstCd || "";
            if (id) availMap.set(id, a);
          }

          const bikes = stations
            .map((s: any) => {
              const lat = parseFloat(s.lat || s.la || s.latitude || "0");
              const lng = parseFloat(
                s.lot || s.lo || s.lng || s.longitude || "0"
              );
              if (!lat || !lng) return null;

              const dist = haversineDistance(userLat, userLng, lat, lng);
              if (dist > radius) return null;

              const id = s.sttId || s.stationId || s.lcgvmnInstCd || "";
              const avail = availMap.get(id);

              return {
                id,
                name: s.sttNm || s.stationNm || s.stationName || "대여소",
                lat,
                lng,
                availableBikes:
                  parseInt(avail?.parkCnt || avail?.parkingBikeTotCnt || "0") ||
                  0,
                totalDocks:
                  parseInt(s.rackCnt || s.rackTotCnt || "0") || 0,
                distance: Math.round(dist * 100) / 100,
              };
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 10);

          result.bikes = bikes;
          console.log(`[Transport] Bikes: ${bikes.length} nearby stations`);
        })()
      );
    }

    // ── 버스 ──
    if (types.includes("bus")) {
      promises.push(
        (async () => {
          const [stopsRes, routesRes, realtimeRes] = await Promise.allSettled([
            fetchBusStops(stdgCd),
            fetchBusRoutes(stdgCd),
            fetchBusRealtime(stdgCd),
          ]);

          const stops =
            stopsRes.status === "fulfilled" ? stopsRes.value.items : [];
          const routes =
            routesRes.status === "fulfilled" ? routesRes.value.items : [];
          const realtime =
            realtimeRes.status === "fulfilled" ? realtimeRes.value.items : [];

          // 노선 Map
          const routeMap = new Map<string, any>();
          for (const r of routes) {
            const id = r.routeId || r.rteId || "";
            if (id) routeMap.set(id, r);
          }

          // 실시간 Map (노선별)
          const realtimeMap = new Map<string, any[]>();
          for (const rt of realtime) {
            const rId = rt.routeId || rt.rteId || "";
            if (!realtimeMap.has(rId)) realtimeMap.set(rId, []);
            realtimeMap.get(rId)!.push(rt);
          }

          // 가까운 정류장 찾기
          const nearbyStops = stops
            .map((s: any) => {
              const lat = parseFloat(s.lat || s.la || s.gpslati || "0");
              const lng = parseFloat(
                s.lot || s.lo || s.gpslong || s.lng || "0"
              );
              if (!lat || !lng) return null;

              const dist = haversineDistance(userLat, userLng, lat, lng);
              if (dist > radius) return null;

              return {
                stopId: s.bsId || s.stationId || s.nodeId || "",
                stopName:
                  s.bsNm || s.stationNm || s.nodenm || "정류장",
                lat,
                lng,
                distance: Math.round(dist * 1000), // 미터
                routeIds: (s.routeIds || "").split(",").filter(Boolean),
              };
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 5);

          // 정류장의 노선 정보 병합
          const buses = nearbyStops.map((stop: any) => {
            const routeNumbers = stop.routeIds
              .map((rId: string) => {
                const route = routeMap.get(rId);
                return route?.routeNo || route?.rteNm || null;
              })
              .filter(Boolean)
              .slice(0, 5);

            return {
              stopName: stop.stopName,
              stopDistance: stop.distance,
              routeNumbers,
              arrivalMinutes: null, // 실시간 도착 정보는 별도 API 필요
            };
          });

          result.buses = buses;
          console.log(`[Transport] Buses: ${buses.length} nearby stops`);
        })()
      );
    }

    // ── 교통약자 이동지원 ──
    if (types.includes("accessible")) {
      promises.push(
        (async () => {
          const [centersRes, vehiclesRes] = await Promise.allSettled([
            fetchAccessibleCenters(stdgCd),
            fetchAccessibleVehicles(stdgCd),
          ]);

          const centers =
            centersRes.status === "fulfilled" ? centersRes.value.items : [];
          const vehicles =
            vehiclesRes.status === "fulfilled" ? vehiclesRes.value.items : [];

          // 차량 이용가능 현황 Map (cntrId 기준)
          const vehicleMap = new Map<string, any>();
          for (const v of vehicles) {
            const cId = v.cntrId || "";
            if (cId) vehicleMap.set(cId, v);
          }

          console.log(`[Transport] Accessible raw: ${centers.length} centers, ${vehicles.length} vehicle records`);

          const nearbyCenters = centers
            .map((c: any) => {
              const lat = parseFloat(c.lat || "0");
              const lng = parseFloat(c.lot || "0");

              const dist =
                lat && lng
                  ? haversineDistance(userLat, userLng, lat, lng)
                  : Infinity;

              const cId = c.cntrId || "";
              const vInfo = vehicleMap.get(cId);

              // 대기건수로 예상 대기시간 추정 (건당 약 5분)
              const waitCount = parseInt(vInfo?.wtngNocs || "0") || 0;
              const estimatedWait = Math.max(10, waitCount * 5);

              return {
                centerName: c.cntrNm || "이동지원센터",
                centerId: cId,
                region: c.lclgvNm || "",
                lat: lat || 0,
                lng: lng || 0,
                distance: Math.round(dist * 10) / 10,
                totalVehicles:
                  parseInt(vInfo?.tvhclCntom || c.hldVhclTcntom || "0") || 0,
                operatingVehicles:
                  parseInt(vInfo?.oprVhclCntom || "0") || 0,
                availableVehicles:
                  parseInt(vInfo?.avlVhclCntom || "0") || 0,
                reservations: parseInt(vInfo?.rsvtNocs || "0") || 0,
                waitingCount: waitCount,
                estimatedWait,
                phone: c.cntrTelno || "",
                appName: c.appSrvcNm || "",
                operatingArea: c.wtjrOprRgnNm || "",
                lastUpdated: vInfo?.totDt || "",
              };
            })
            .filter((c: any) => c.distance <= radius * 5) // 넓은 반경
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 5);

          result.accessibleTransport =
            nearbyCenters.length > 0 ? nearbyCenters : null;
          console.log(
            `[Transport] Accessible: ${nearbyCenters.length} centers`
          );
        })()
      );
    }

    await Promise.all(promises);

    // 모든 실 API가 빈 데이터를 반환하면 mock fallback
    const hasRealData =
      result.bikes.length > 0 ||
      result.buses.length > 0 ||
      result.accessibleTransport !== null;

    if (!hasRealData) {
      console.warn("[Transport] All APIs returned empty, using mock fallback");
      return NextResponse.json({
        bikes: getMockBikes(userLat, userLng),
        buses: getMockBuses(),
        accessibleTransport: getMockAccessible(),
        source: "mock-fallback",
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("[Transport] Fatal error:", error.message || error);
    return NextResponse.json({
      bikes: getMockBikes(userLat, userLng),
      buses: getMockBuses(),
      accessibleTransport: getMockAccessible(),
      source: "error-fallback",
      error: error.message,
      updatedAt: new Date().toISOString(),
    });
  }
}

// ── Mock 데이터 ──

function getMockBikes(lat: number, lng: number) {
  const offsets = [
    { dlat: 0.002, dlng: 0.003, name: "도서관앞 대여소", bikes: 8, docks: 15 },
    { dlat: -0.003, dlng: 0.001, name: "역전 대여소", bikes: 3, docks: 20 },
    { dlat: 0.001, dlng: -0.004, name: "공원입구 대여소", bikes: 12, docks: 20 },
    { dlat: -0.001, dlng: 0.005, name: "시청 대여소", bikes: 5, docks: 10 },
  ];

  return offsets.map((o, i) => ({
    id: `mock_bike_${i + 1}`,
    name: o.name,
    lat: lat + o.dlat,
    lng: lng + o.dlng,
    availableBikes: o.bikes,
    totalDocks: o.docks,
    distance: Math.round(haversineDistance(lat, lng, lat + o.dlat, lng + o.dlng) * 100) / 100,
  }));
}

function getMockBuses() {
  return [
    {
      stopName: "도서관앞",
      stopDistance: 150,
      routeNumbers: ["101", "202", "303"],
      arrivalMinutes: 5,
    },
    {
      stopName: "중앙로",
      stopDistance: 320,
      routeNumbers: ["501", "707"],
      arrivalMinutes: 8,
    },
    {
      stopName: "시청역",
      stopDistance: 480,
      routeNumbers: ["101", "505", "909"],
      arrivalMinutes: 12,
    },
  ];
}

function getMockAccessible() {
  return [
    {
      centerName: "교통약자이동지원센터",
      totalVehicles: 15,
      availableVehicles: 4,
      estimatedWait: 25,
      phone: "1588-4388",
      lat: 0,
      lng: 0,
      distance: 0,
    },
  ];
}
