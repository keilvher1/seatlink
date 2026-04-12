import { NextRequest, NextResponse } from "next/server";
import {
  fetchLibraryInfo,
  fetchLibraryStatus,
  fetchLibraryRealtime,
} from "@/lib/api-client";
import { mockLibraries } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stdgCd = searchParams.get("stdgCd") || undefined;
  const useMock = !process.env.DATA_GO_KR_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (useMock) {
    console.log("[Libraries] No API key, using mock data");
    return NextResponse.json({
      libraries: mockLibraries,
      totalCount: mockLibraries.length,
      updatedAt: new Date().toISOString(),
      source: "mock",
    });
  }

  try {
    console.log("[Libraries] Fetching from data.go.kr APIs...");

    // 3개 API를 병렬로 호출
    const [infoRes, statusRes, realtimeRes] = await Promise.allSettled([
      fetchLibraryInfo(stdgCd),
      fetchLibraryStatus(stdgCd),
      fetchLibraryRealtime(stdgCd),
    ]);

    // settled 결과에서 안전하게 추출
    const info = infoRes.status === "fulfilled" ? infoRes.value : { items: [], totalCount: 0 };
    const status = statusRes.status === "fulfilled" ? statusRes.value : { items: [], totalCount: 0 };
    const realtime = realtimeRes.status === "fulfilled" ? realtimeRes.value : { items: [], totalCount: 0 };

    console.log(
      `[Libraries] API results - info: ${info.items.length}, status: ${status.items.length}, realtime: ${realtime.items.length}`
    );

    // 하나도 데이터가 없으면 mock 폴백
    if (info.items.length === 0 && status.items.length === 0 && realtime.items.length === 0) {
      console.warn("[Libraries] All APIs returned empty, falling back to mock data");
      return NextResponse.json({
        libraries: mockLibraries,
        totalCount: mockLibraries.length,
        updatedAt: new Date().toISOString(),
        source: "mock-fallback",
        debug: {
          infoStatus: infoRes.status,
          statusStatus: statusRes.status,
          realtimeStatus: realtimeRes.status,
          infoError: infoRes.status === "rejected" ? String(infoRes.reason) : null,
          statusError: statusRes.status === "rejected" ? String(statusRes.reason) : null,
          realtimeError: realtimeRes.status === "rejected" ? String(realtimeRes.reason) : null,
        },
      });
    }

    // 데이터 병합: 도서관 ID 기준
    const libraryMap = new Map<string, any>();

    // 1) 기본정보 매핑
    for (const item of info.items) {
      // ID 추출: pblibId가 기본, 없으면 다른 필드 조합
      const id =
        item.pblibId ||
        item.lbrrySeCode ||
        `${item.lcgvmnInstCd || "unknown"}_${item.pblibNm || ""}`;

      if (!id) continue;

      // 위도/경도 필드명 다양하게 대응
      const lat = parseFloat(item.lat || item.latitude || item.la || "0");
      const lng = parseFloat(item.lot || item.longitude || item.lo || item.lng || "0");

      // 운영시간 파싱
      const weekdayStart = item.wkdyOperBgngTm || item.weekdayOperOpenHhmm || "09:00";
      const weekdayEnd = item.wkdyOperEndTm || item.weekdayOperColseHhmm || "18:00";
      const satStart = item.satOperBgngTm || item.satOperOpenHhmm || "09:00";
      const satEnd = item.satOperEndTm || item.satOperColseHhmm || "17:00";
      const holStart = item.lhldyOperBgngTm || item.holidayOperOpenHhmm || "";
      const holEnd = item.lhldyOperEndTm || item.holidayOperColseHhmm || "";

      libraryMap.set(id, {
        id,
        name: item.pblibNm || item.lbrryNm || "",
        address: item.pblibRoadNmAddr || item.pblibLotnoAddr || item.adres || "",
        lat,
        lng,
        phone: item.pblibTelno || item.phoneNumber || "",
        operatingHours: {
          weekday: `${weekdayStart}~${weekdayEnd}`,
          saturday: `${satStart}~${satEnd}`,
          holiday: holStart ? `${holStart}~${holEnd}` : "휴관",
        },
        nightOperation: parseInt(weekdayEnd.replace(":", "")) >= 2100,
        accessible: true,
        reservable: false,
        wifi: true,
        parking: item.parkngLotCo ? parseInt(item.parkngLotCo) > 0 : false,
        todayVisitors: 0,
        seatUsageRate: 0,
        congestionLevel: "여유" as const,
        rooms: [] as any[],
        totalSeats: parseInt(item.tseatCnt || item.totalSeatCo || "0") || 0,
        totalUsed: 0,
        totalAvailable: 0,
      });
    }

    // 2) 운영현황 매핑
    for (const item of status.items) {
      const id =
        item.pblibId ||
        item.lbrrySeCode ||
        `${item.lcgvmnInstCd || "unknown"}_${item.pblibNm || ""}`;

      let lib = libraryMap.get(id);

      // info에 없었지만 status에는 있는 경우 → 새로 생성
      if (!lib && item.pblibNm) {
        lib = {
          id,
          name: item.pblibNm || "",
          address: "",
          lat: 0,
          lng: 0,
          phone: "",
          operatingHours: { weekday: "", saturday: "", holiday: "" },
          nightOperation: false,
          accessible: true,
          reservable: false,
          wifi: true,
          parking: false,
          todayVisitors: 0,
          seatUsageRate: 0,
          congestionLevel: "여유" as const,
          rooms: [] as any[],
          totalSeats: 0,
          totalUsed: 0,
          totalAvailable: 0,
        };
        libraryMap.set(id, lib);
      }

      if (lib) {
        lib.todayVisitors = parseInt(item.tdyVstrCnt || item.todayVisitorCo || "0") || 0;
        lib.seatUsageRate = parseFloat(item.seatUsgrt || item.seatUsageRate || "0") || 0;
        lib.reservable = item.rsvtPsbltyYn === "Y" || item.reservationAt === "Y";

        // 운영상태
        const operStatus = item.operSttsNm || item.operSttus || "";
        if (operStatus === "휴관" || operStatus === "임시휴관") {
          lib.congestionLevel = "여유";
        } else {
          const rate = lib.seatUsageRate;
          lib.congestionLevel = rate < 40 ? "여유" : rate <= 70 ? "보통" : "혼잡";
        }
      }
    }

    // 3) 실시간 열람실 매핑
    for (const item of realtime.items) {
      const id =
        item.pblibId ||
        item.lbrrySeCode ||
        `${item.lcgvmnInstCd || "unknown"}_${item.pblibNm || ""}`;

      let lib = libraryMap.get(id);

      if (!lib && item.pblibNm) {
        lib = {
          id,
          name: item.pblibNm || "",
          address: "",
          lat: 0,
          lng: 0,
          phone: "",
          operatingHours: { weekday: "", saturday: "", holiday: "" },
          nightOperation: false,
          accessible: true,
          reservable: false,
          wifi: true,
          parking: false,
          todayVisitors: 0,
          seatUsageRate: 0,
          congestionLevel: "여유" as const,
          rooms: [] as any[],
          totalSeats: 0,
          totalUsed: 0,
          totalAvailable: 0,
        };
        libraryMap.set(id, lib);
      }

      if (lib) {
        const total = parseInt(item.tseatCnt || item.totalSeatCo || "0") || 0;
        const used = parseInt(item.useSeatCnt || item.useSeatCo || "0") || 0;
        const reserved = parseInt(item.rsvtSeatCnt || item.reservSeatCo || "0") || 0;
        const available =
          parseInt(item.rmndSeatCnt || item.remainSeatCo || "0") || Math.max(0, total - used - reserved);
        const pct = total > 0 ? Math.round((used / total) * 100) : 0;

        lib.rooms.push({
          name: item.rdrmNm || item.roomNm || "열람실",
          totalSeats: total,
          usedSeats: used,
          availableSeats: available,
          congestionPercent: pct,
          congestionLevel: pct < 40 ? "여유" : pct <= 70 ? "보통" : ("혼잡" as const),
          lastUpdated: item.dataStdr || new Date().toISOString(),
        });

        // 전체 합산 업데이트
        lib.totalSeats = lib.rooms.reduce((s: number, r: any) => s + r.totalSeats, 0);
        lib.totalUsed = lib.rooms.reduce((s: number, r: any) => s + r.usedSeats, 0);
        lib.totalAvailable = lib.rooms.reduce((s: number, r: any) => s + r.availableSeats, 0);

        // 전체 혼잡도 재계산
        if (lib.totalSeats > 0) {
          lib.seatUsageRate = Math.round((lib.totalUsed / lib.totalSeats) * 100);
          lib.congestionLevel =
            lib.seatUsageRate < 40 ? "여유" : lib.seatUsageRate <= 70 ? "보통" : "혼잡";
        }
      }
    }

    // 유효한 도서관만 필터 (이름이 있는 것)
    const libraries = Array.from(libraryMap.values()).filter(
      (l) => l.name && l.name.length > 0
    );

    console.log(`[Libraries] Final: ${libraries.length} libraries (${libraries.filter((l: any) => l.lat !== 0).length} with coordinates)`);

    // 데이터가 너무 적으면 mock과 병합
    if (libraries.length < 5) {
      console.warn("[Libraries] Too few results, supplementing with mock data");
      const apiIds = new Set(libraries.map((l) => l.id));
      const supplement = mockLibraries.filter((m) => !apiIds.has(m.id));
      return NextResponse.json(
        {
          libraries: [...libraries, ...supplement],
          totalCount: libraries.length + supplement.length,
          updatedAt: new Date().toISOString(),
          source: "api+mock-supplement",
          apiCount: libraries.length,
        },
        {
          headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
        }
      );
    }

    return NextResponse.json(
      {
        libraries,
        totalCount: libraries.length,
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
      }
    );
  } catch (error: any) {
    console.error("[Libraries] Fatal error:", error.message || error);
    // 에러 시 목업 데이터 폴백
    return NextResponse.json({
      libraries: mockLibraries,
      totalCount: mockLibraries.length,
      updatedAt: new Date().toISOString(),
      source: "mock-fallback",
      error: error.message,
    });
  }
}
