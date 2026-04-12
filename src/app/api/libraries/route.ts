import { NextRequest, NextResponse } from "next/server";
import {
  fetchLibraryInfo,
  fetchLibraryStatus,
  fetchLibraryRealtime,
} from "@/lib/api-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stdgCd = searchParams.get("stdgCd") || undefined;

  if (!process.env.DATA_GO_KR_API_KEY) {
    console.log("[Libraries] No API key configured");
    return NextResponse.json({
      libraries: getMockLibraries(),
      totalCount: getMockLibraries().length,
      updatedAt: new Date().toISOString(),
      source: "no-api-key-fallback",
    });
  }

  try {
    console.log("[Libraries] Fetching from data.go.kr APIs...");

    // 3ê° APIë¥¼ ë³ë ¬ë¡ í¸ì¶
    const [infoRes, statusRes, realtimeRes] = await Promise.allSettled([
      fetchLibraryInfo(stdgCd),
      fetchLibraryStatus(stdgCd),
      fetchLibraryRealtime(stdgCd),
    ]);

    // settled ê²°ê³¼ìì ìì íê² ì¶ì¶
    const info = infoRes.status === "fulfilled" ? infoRes.value : { items: [], totalCount: 0 };
    const status = statusRes.status === "fulfilled" ? statusRes.value : { items: [], totalCount: 0 };
    const realtime = realtimeRes.status === "fulfilled" ? realtimeRes.value : { items: [], totalCount: 0 };

    console.log(
      `[Libraries] API results - info: ${info.items.length}, status: ${status.items.length}, realtime: ${realtime.items.length}`
    );

    // íëë ë°ì´í°ê° ìì¼ë©´ ë¹ ë°°ì´ ë°í
    if (info.items.length === 0 && status.items.length === 0 && realtime.items.length === 0) {
      console.warn("[Libraries] All APIs returned empty, using fallback mock data");
      return NextResponse.json({
        libraries: getMockLibraries(),
        totalCount: getMockLibraries().length,
        updatedAt: new Date().toISOString(),
        source: "mock-fallback",
        debug: {
          infoStatus: infoRes.status,
          statusStatus: statusRes.status,
          realtimeStatus: realtimeRes.status,
          infoError: infoRes.status === "rejected" ? String(infoRes.reason) : null,
          statusError: statusRes.status === "rejected" ? String(statusRes.reason) : null,
          realtimeError: realtimeRes.status === "rejected" ? String(realtimeRes.reason) : null,
          infoItemCount: info.items.length,
          statusItemCount: status.items.length,
          realtimeItemCount: realtime.items.length,
          apiKeySet: !!process.env.DATA_GO_KR_API_KEY,
          apiKeyPrefix: process.env.DATA_GO_KR_API_KEY ? process.env.DATA_GO_KR_API_KEY.substring(0, 8) + "..." : "none",
          infoApiError: info.error || null,
          statusApiError: status.error || null,
          realtimeApiError: realtime.error || null,
        },
      });
    }

    // ë°ì´í° ë³í©: ëìê´ ID ê¸°ì¤
    const libraryMap = new Map<string, any>();

    // 1) ê¸°ë³¸ì ë³´ ë§¤í
    for (const item of info.items) {
      const id =
        item.pblibId ||
        item.lbrrySeCode ||
        `${item.lcgvmnInstCd || "unknown"}_${item.pblibNm || ""}`;

      if (!id) continue;

      const lat = parseFloat(item.lat || item.latitude || item.la || "0");
      const lng = parseFloat(item.lot || item.longitude || item.lo || item.lng || "0");

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
          holiday: holStart ? `${holStart}~${holEnd}` : "í´ê´",
        },
        nightOperation: parseInt(weekdayEnd.replace(":", "")) >= 2100,
        accessible: true,
        reservable: false,
        wifi: true,
        parking: item.parkngLotCo ? parseInt(item.parkngLotCo) > 0 : false,
        todayVisitors: 0,
        seatUsageRate: 0,
        congestionLevel: "ì¬ì " as const,
        rooms: [] as any[],
        totalSeats: parseInt(item.tseatCnt || item.totalSeatCo || "0") || 0,
        totalUsed: 0,
        totalAvailable: 0,
      });
    }

    // 2) ì´ìíí© ë§¤í
    for (const item of status.items) {
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
          congestionLevel: "ì¬ì " as const,
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

        const operStatus = item.operSttsNm || item.operSttus || "";
        if (operStatus === "í´ê´" || operStatus === "ììí´ê´") {
          lib.congestionLevel = "ì¬ì ";
        } else {
          const rate = lib.seatUsageRate;
          lib.congestionLevel = rate < 40 ? "ì¬ì " : rate <= 70 ? "ë³´íµ" : "í¼ì¡";
        }
      }
    }

    // 3) ì¤ìê° ì´ëì¤ ë§¤í
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
          congestionLevel: "ì¬ì " as const,
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
          name: item.rdrmNm || item.roomNm || "ì´ëì¤",
          totalSeats: total,
          usedSeats: used,
          availableSeats: available,
          congestionPercent: pct,
          congestionLevel: pct < 40 ? "ì¬ì " : pct <= 70 ? "ë³´íµ" : ("í¼ì¡" as const),
          lastUpdated: item.dataStdr || new Date().toISOString(),
        });

        lib.totalSeats = lib.rooms.reduce((s: number, r: any) => s + r.totalSeats, 0);
        lib.totalUsed = lib.rooms.reduce((s: number, r: any) => s + r.usedSeats, 0);
        lib.totalAvailable = lib.rooms.reduce((s: number, r: any) => s + r.availableSeats, 0);

        if (lib.totalSeats > 0) {
          lib.seatUsageRate = Math.round((lib.totalUsed / lib.totalSeats) * 100);
          lib.congestionLevel =
            lib.seatUsageRate < 40 ? "ì¬ì " : lib.seatUsageRate <= 70 ? "ë³´íµ" : "í¼ì¡";
        }
      }
    }

    const libraries = Array.from(libraryMap.values()).filter(
      (l) => l.name && l.name.length > 0
    );

    console.log(`[Libraries] Final: ${libraries.length} libraries (${libraries.filter((l: any) => l.lat !== 0).length} with coordinates)`);

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
    return NextResponse.json({
      libraries: getMockLibraries(),
      totalCount: getMockLibraries().length,
      updatedAt: new Date().toISOString(),
      source: "error-fallback",
      error: error.message,
    });
  }
}


function getMockLibraries() {
  const now = new Date().toISOString();
  return [
    {
      id: "mock_pohang_1",
      name: "포항시립도서관",
      address: "경상북도 포항시 남구 효자동 233-1",
      lat: 36.0190,
      lng: 129.3435,
      phone: "054-270-4301",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 342,
      seatUsageRate: 62,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 124, availableSeats: 76, congestionPercent: 62, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "디지털자료실", totalSeats: 50, usedSeats: 31, availableSeats: 19, congestionPercent: 62, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 250,
      totalUsed: 155,
      totalAvailable: 95,
    },
    {
      id: "mock_pohang_2",
      name: "포스텍 박태준학술정보관",
      address: "경상북도 포항시 남구 청암로 77",
      lat: 36.0110,
      lng: 129.3230,
      phone: "054-279-2548",
      operatingHours: { weekday: "08:00~23:00", saturday: "09:00~22:00", holiday: "09:00~17:00" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 521,
      seatUsageRate: 78,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "제1열람실", totalSeats: 300, usedSeats: 234, availableSeats: 66, congestionPercent: 78, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "그룹스터디실", totalSeats: 40, usedSeats: 28, availableSeats: 12, congestionPercent: 70, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 340,
      totalUsed: 262,
      totalAvailable: 78,
    },
    {
      id: "mock_pohang_3",
      name: "한동대학교 도서관",
      address: "경상북도 포항시 북구 흥해읍 558",
      lat: 36.1033,
      lng: 129.3889,
      phone: "054-260-1414",
      operatingHours: { weekday: "08:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 287,
      seatUsageRate: 45,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "1층 열람실", totalSeats: 150, usedSeats: 68, availableSeats: 82, congestionPercent: 45, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 150,
      totalUsed: 68,
      totalAvailable: 82,
    },
    {
      id: "mock_pohang_4",
      name: "오천공공도서관",
      address: "경상북도 포항시 남구 오천읍 345",
      lat: 35.9834,
      lng: 129.3650,
      phone: "054-270-4400",
      operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: false,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 89,
      seatUsageRate: 25,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "열람실", totalSeats: 80, usedSeats: 20, availableSeats: 60, congestionPercent: 25, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 80,
      totalUsed: 20,
      totalAvailable: 60,
    },
    {
      id: "mock_pohang_5",
      name: "장성공공도서관",
      address: "경상북도 포항시 북구 장성동 120",
      lat: 36.0450,
      lng: 129.3700,
      phone: "054-270-4500",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: false,
      todayVisitors: 156,
      seatUsageRate: 55,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 120, usedSeats: 66, availableSeats: 54, congestionPercent: 55, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "정음열람실", totalSeats: 30, usedSeats: 18, availableSeats: 12, congestionPercent: 60, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 150,
      totalUsed: 84,
      totalAvailable: 66,
    },
    {
      id: "mock_pohang_6",
      name: "흥해공공도서관",
      address: "경상북도 포항시 북구 흥해읍 210",
      lat: 36.0980,
      lng: 129.3500,
      phone: "054-270-4600",
      operatingHours: { weekday: "09:00~18:00", saturday: "09:00~13:00", holiday: "휴관" },
      nightOperation: false,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 64,
      seatUsageRate: 18,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "열람실", totalSeats: 60, usedSeats: 11, availableSeats: 49, congestionPercent: 18, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 60,
      totalUsed: 11,
      totalAvailable: 49,
    },
  ];
}
