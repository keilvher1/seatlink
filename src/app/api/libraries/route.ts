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
    // ========== 서울특별시 ==========
    {
      id: "mock_seoul_1",
      name: "서울도서관",
      address: "서울특별시 중구 세종대로 110",
      lat: 37.5664,
      lng: 126.9778,
      phone: "02-2133-0300",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~18:00", holiday: "09:00~18:00" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 1250,
      seatUsageRate: 72,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "서울자료실", totalSeats: 200, usedSeats: 156, availableSeats: 44, congestionPercent: 78, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "일반열람실", totalSeats: 400, usedSeats: 280, availableSeats: 120, congestionPercent: 70, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "디지털자료실", totalSeats: 100, usedSeats: 68, availableSeats: 32, congestionPercent: 68, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 700,
      totalUsed: 504,
      totalAvailable: 196,
    },
    {
      id: "mock_seoul_2",
      name: "국립중앙도서관",
      address: "서울특별시 서초구 반포대로 201",
      lat: 37.4979,
      lng: 127.0036,
      phone: "02-590-0500",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 2100,
      seatUsageRate: 81,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "인문과학자료실", totalSeats: 300, usedSeats: 252, availableSeats: 48, congestionPercent: 84, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "사회과학자료실", totalSeats: 280, usedSeats: 218, availableSeats: 62, congestionPercent: 78, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "디지털열람실", totalSeats: 150, usedSeats: 120, availableSeats: 30, congestionPercent: 80, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "연속간행물실", totalSeats: 120, usedSeats: 82, availableSeats: 38, congestionPercent: 68, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 850,
      totalUsed: 672,
      totalAvailable: 178,
    },
    {
      id: "mock_seoul_3",
      name: "강남도서관",
      address: "서울특별시 강남구 선릉로116길 45",
      lat: 37.5138,
      lng: 127.047,
      phone: "02-3448-4741",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: false,
      todayVisitors: 890,
      seatUsageRate: 85,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 250, usedSeats: 218, availableSeats: 32, congestionPercent: 87, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 300, usedSeats: 252, availableSeats: 48, congestionPercent: 84, congestionLevel: "혼잡" as const, lastUpdated: now },
      ],
      totalSeats: 550,
      totalUsed: 470,
      totalAvailable: 80,
    },
    {
      id: "mock_seoul_4",
      name: "정독도서관",
      address: "서울특별시 종로구 북촌로5길 48",
      lat: 37.579,
      lng: 126.985,
      phone: "02-2011-5799",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: false,
      todayVisitors: 430,
      seatUsageRate: 55,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "인문사회과학실", totalSeats: 180, usedSeats: 99, availableSeats: 81, congestionPercent: 55, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "자연과학실", totalSeats: 120, usedSeats: 66, availableSeats: 54, congestionPercent: 55, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 300,
      totalUsed: 165,
      totalAvailable: 135,
    },
    {
      id: "mock_seoul_5",
      name: "마포중앙도서관",
      address: "서울특별시 마포구 성산로 128",
      lat: 37.5638,
      lng: 126.9081,
      phone: "02-3153-5800",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 720,
      seatUsageRate: 63,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 130, availableSeats: 70, congestionPercent: 65, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "디지털자료실", totalSeats: 80, usedSeats: 48, availableSeats: 32, congestionPercent: 60, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 350, usedSeats: 217, availableSeats: 133, congestionPercent: 62, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 630,
      totalUsed: 395,
      totalAvailable: 235,
    },
    {
      id: "mock_seoul_6",
      name: "송파도서관",
      address: "서울특별시 송파구 동남로 263",
      lat: 37.5033,
      lng: 127.1185,
      phone: "02-3434-3333",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 580,
      seatUsageRate: 48,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 92, availableSeats: 108, congestionPercent: 46, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 250, usedSeats: 125, availableSeats: 125, congestionPercent: 50, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 450,
      totalUsed: 217,
      totalAvailable: 233,
    },
    {
      id: "mock_seoul_7",
      name: "도봉도서관",
      address: "서울특별시 도봉구 삼양로 556",
      lat: 37.6548,
      lng: 127.0268,
      phone: "02-6714-7400",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 310,
      seatUsageRate: 35,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 180, usedSeats: 63, availableSeats: 117, congestionPercent: 35, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 200, usedSeats: 70, availableSeats: 130, congestionPercent: 35, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 380,
      totalUsed: 133,
      totalAvailable: 247,
    },
    {
      id: "mock_seoul_8",
      name: "양천도서관",
      address: "서울특별시 양천구 목동서로 113",
      lat: 37.5282,
      lng: 126.8758,
      phone: "02-2062-3900",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: false,
      todayVisitors: 450,
      seatUsageRate: 58,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 118, availableSeats: 82, congestionPercent: 59, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "디지털열람실", totalSeats: 80, usedSeats: 44, availableSeats: 36, congestionPercent: 55, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 280,
      totalUsed: 162,
      totalAvailable: 118,
    },
    // ========== 부산광역시 ==========
    {
      id: "mock_busan_1",
      name: "부산시립시민도서관",
      address: "부산광역시 부산진구 월드컵대로 462",
      lat: 35.1394,
      lng: 129.0744,
      phone: "051-810-8200",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 780,
      seatUsageRate: 67,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 300, usedSeats: 198, availableSeats: 102, congestionPercent: 66, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "전자정보실", totalSeats: 100, usedSeats: 70, availableSeats: 30, congestionPercent: 70, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 400, usedSeats: 272, availableSeats: 128, congestionPercent: 68, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 800,
      totalUsed: 540,
      totalAvailable: 260,
    },
    {
      id: "mock_busan_2",
      name: "부산광역시립중앙도서관",
      address: "부산광역시 중구 망양로193번길 146",
      lat: 35.11,
      lng: 129.029,
      phone: "051-250-0300",
      operatingHours: { weekday: "09:00~20:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: false,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: false,
      todayVisitors: 340,
      seatUsageRate: 42,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 82, availableSeats: 118, congestionPercent: 41, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 180, usedSeats: 78, availableSeats: 102, congestionPercent: 43, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 380,
      totalUsed: 160,
      totalAvailable: 220,
    },
    {
      id: "mock_busan_3",
      name: "해운대도서관",
      address: "부산광역시 해운대구 양운로 183",
      lat: 35.1779,
      lng: 129.169,
      phone: "051-749-6900",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 620,
      seatUsageRate: 74,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 250, usedSeats: 190, availableSeats: 60, congestionPercent: 76, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "디지털자료실", totalSeats: 60, usedSeats: 42, availableSeats: 18, congestionPercent: 70, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 200, usedSeats: 148, availableSeats: 52, congestionPercent: 74, congestionLevel: "혼잡" as const, lastUpdated: now },
      ],
      totalSeats: 510,
      totalUsed: 380,
      totalAvailable: 130,
    },
    // ========== 대구광역시 ==========
    {
      id: "mock_daegu_1",
      name: "대구광역시립중앙도서관",
      address: "대구광역시 중구 공평로10길 25",
      lat: 35.8695,
      lng: 128.5934,
      phone: "053-231-2000",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 560,
      seatUsageRate: 61,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 250, usedSeats: 155, availableSeats: 95, congestionPercent: 62, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 300, usedSeats: 180, availableSeats: 120, congestionPercent: 60, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 550,
      totalUsed: 335,
      totalAvailable: 215,
    },
    {
      id: "mock_daegu_2",
      name: "대구2·28기념학생도서관",
      address: "대구광역시 동구 아양로41길 56",
      lat: 35.8949,
      lng: 128.6084,
      phone: "053-231-2841",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 480,
      seatUsageRate: 78,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "일반열람실", totalSeats: 300, usedSeats: 240, availableSeats: 60, congestionPercent: 80, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "디지털열람실", totalSeats: 80, usedSeats: 56, availableSeats: 24, congestionPercent: 70, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 380,
      totalUsed: 296,
      totalAvailable: 84,
    },
    // ========== 인천광역시 ==========
    {
      id: "mock_incheon_1",
      name: "인천광역시립중앙도서관",
      address: "인천광역시 남동구 정각로 9",
      lat: 37.4005,
      lng: 126.722,
      phone: "032-770-3800",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 640,
      seatUsageRate: 54,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 250, usedSeats: 130, availableSeats: 120, congestionPercent: 52, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 350, usedSeats: 196, availableSeats: 154, congestionPercent: 56, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 600,
      totalUsed: 326,
      totalAvailable: 274,
    },
    {
      id: "mock_incheon_2",
      name: "인천연수도서관",
      address: "인천광역시 연수구 함박뫼로152번길 96",
      lat: 37.384,
      lng: 126.672,
      phone: "032-899-7500",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 380,
      seatUsageRate: 39,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 180, usedSeats: 68, availableSeats: 112, congestionPercent: 38, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 200, usedSeats: 80, availableSeats: 120, congestionPercent: 40, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 380,
      totalUsed: 148,
      totalAvailable: 232,
    },
    // ========== 광주광역시 ==========
    {
      id: "mock_gwangju_1",
      name: "광주광역시립무등도서관",
      address: "광주광역시 북구 우산로 18",
      lat: 35.1814,
      lng: 126.905,
      phone: "062-613-7700",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 510,
      seatUsageRate: 58,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 118, availableSeats: 82, congestionPercent: 59, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 300, usedSeats: 168, availableSeats: 132, congestionPercent: 56, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 500,
      totalUsed: 286,
      totalAvailable: 214,
    },
    // ========== 대전광역시 ==========
    {
      id: "mock_daejeon_1",
      name: "대전한밭도서관",
      address: "대전광역시 서구 한밭대로 700",
      lat: 36.3504,
      lng: 127.3845,
      phone: "042-470-1500",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 490,
      seatUsageRate: 52,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 104, availableSeats: 96, congestionPercent: 52, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 350, usedSeats: 182, availableSeats: 168, congestionPercent: 52, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 550,
      totalUsed: 286,
      totalAvailable: 264,
    },
    // ========== 울산광역시 ==========
    {
      id: "mock_ulsan_1",
      name: "울산도서관",
      address: "울산광역시 남구 이현로 1020",
      lat: 35.5328,
      lng: 129.3449,
      phone: "052-229-6100",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 380,
      seatUsageRate: 44,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 86, availableSeats: 114, congestionPercent: 43, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 250, usedSeats: 112, availableSeats: 138, congestionPercent: 45, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 450,
      totalUsed: 198,
      totalAvailable: 252,
    },
    // ========== 세종특별자치시 ==========
    {
      id: "mock_sejong_1",
      name: "국립세종도서관",
      address: "세종특별자치시 다솜3로 48",
      lat: 36.504,
      lng: 127.002,
      phone: "044-900-9114",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 420,
      seatUsageRate: 38,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "정책자료실", totalSeats: 150, usedSeats: 54, availableSeats: 96, congestionPercent: 36, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "디지털자료실", totalSeats: 100, usedSeats: 40, availableSeats: 60, congestionPercent: 40, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 300, usedSeats: 114, availableSeats: 186, congestionPercent: 38, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 550,
      totalUsed: 208,
      totalAvailable: 342,
    },
    // ========== 경기도 ==========
    {
      id: "mock_gyeonggi_1",
      name: "수원시립중앙도서관",
      address: "경기도 수원시 팔달구 파달산로 318",
      lat: 37.2735,
      lng: 127.0121,
      phone: "031-248-3500",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 520,
      seatUsageRate: 65,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 132, availableSeats: 68, congestionPercent: 66, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 260, usedSeats: 166, availableSeats: 94, congestionPercent: 64, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 460,
      totalUsed: 298,
      totalAvailable: 162,
    },
    {
      id: "mock_gyeonggi_2",
      name: "성남시립분당도서관",
      address: "경기도 성남시 분당구 불정로 110",
      lat: 37.391,
      lng: 127.1092,
      phone: "031-729-4600",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 680,
      seatUsageRate: 76,
      congestionLevel: "혼잡" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 250, usedSeats: 195, availableSeats: 55, congestionPercent: 78, congestionLevel: "혼잡" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 300, usedSeats: 222, availableSeats: 78, congestionPercent: 74, congestionLevel: "혼잡" as const, lastUpdated: now },
      ],
      totalSeats: 550,
      totalUsed: 417,
      totalAvailable: 133,
    },
    {
      id: "mock_gyeonggi_3",
      name: "고양시립대화도서관",
      address: "경기도 고양시 일산서구 일산로 689",
      lat: 37.657,
      lng: 126.756,
      phone: "031-8075-9130",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 410,
      seatUsageRate: 47,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 180, usedSeats: 82, availableSeats: 98, congestionPercent: 46, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 220, usedSeats: 108, availableSeats: 112, congestionPercent: 49, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 400,
      totalUsed: 190,
      totalAvailable: 210,
    },
    {
      id: "mock_gyeonggi_4",
      name: "용인시립중앙도서관",
      address: "경기도 용인시 처인구 중부대로 1176",
      lat: 37.234,
      lng: 127.201,
      phone: "031-324-4760",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 350,
      seatUsageRate: 41,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 180, usedSeats: 72, availableSeats: 108, congestionPercent: 40, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 200, usedSeats: 84, availableSeats: 116, congestionPercent: 42, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 380,
      totalUsed: 156,
      totalAvailable: 224,
    },
    // ========== 강원특별자치도 ==========
    {
      id: "mock_gangwon_1",
      name: "춘천시립도서관",
      address: "강원특별자치도 춘천시 우석로 100",
      lat: 37.877,
      lng: 127.735,
      phone: "033-245-5102",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 210,
      seatUsageRate: 32,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 126, usedSeats: 38, availableSeats: 88, congestionPercent: 30, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 170, usedSeats: 58, availableSeats: 112, congestionPercent: 34, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 296,
      totalUsed: 96,
      totalAvailable: 200,
    },
    {
      id: "mock_gangwon_2",
      name: "강릉시립도서관",
      address: "강원특별자치도 강릉시 강릉대로 444",
      lat: 37.749,
      lng: 128.899,
      phone: "033-660-3271",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 180,
      seatUsageRate: 28,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 120, usedSeats: 32, availableSeats: 88, congestionPercent: 27, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 150, usedSeats: 44, availableSeats: 106, congestionPercent: 29, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 270,
      totalUsed: 76,
      totalAvailable: 194,
    },
    // ========== 충청북도 ==========
    {
      id: "mock_chungbuk_1",
      name: "청주시립도서관",
      address: "충청북도 청주시 상당구 용아로 55",
      lat: 36.635,
      lng: 127.489,
      phone: "043-201-4074",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 360,
      seatUsageRate: 55,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 180, usedSeats: 99, availableSeats: 81, congestionPercent: 55, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 220, usedSeats: 121, availableSeats: 99, congestionPercent: 55, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 400,
      totalUsed: 220,
      totalAvailable: 180,
    },
    // ========== 충청남도 ==========
    {
      id: "mock_chungnam_1",
      name: "천안시중앙도서관",
      address: "충청남도 천안시 동남구 중앙로 118",
      lat: 36.799,
      lng: 127.108,
      phone: "041-521-3721",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 540,
      seatUsageRate: 62,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 250, usedSeats: 160, availableSeats: 90, congestionPercent: 64, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 350, usedSeats: 210, availableSeats: 140, congestionPercent: 60, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "디지털자료실", totalSeats: 80, usedSeats: 48, availableSeats: 32, congestionPercent: 60, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 680,
      totalUsed: 418,
      totalAvailable: 262,
    },
    // ========== 전북특별자치도 ==========
    {
      id: "mock_jeonbuk_1",
      name: "전주시립도서관",
      address: "전북특별자치도 전주시 완산구 백제대로 306",
      lat: 35.81,
      lng: 127.108,
      phone: "063-281-2798",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 410,
      seatUsageRate: 51,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 100, availableSeats: 100, congestionPercent: 50, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 250, usedSeats: 130, availableSeats: 120, congestionPercent: 52, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 450,
      totalUsed: 230,
      totalAvailable: 220,
    },
    // ========== 전라남도 ==========
    {
      id: "mock_jeonnam_1",
      name: "순천시립연향도서관",
      address: "전라남도 순천시 연향번영길 54",
      lat: 34.95,
      lng: 127.487,
      phone: "061-749-6691",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 250,
      seatUsageRate: 35,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 150, usedSeats: 50, availableSeats: 100, congestionPercent: 33, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 180, usedSeats: 66, availableSeats: 114, congestionPercent: 37, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 330,
      totalUsed: 116,
      totalAvailable: 214,
    },
    // ========== 경상북도 ==========
    {
      id: "mock_pohang_1",
      name: "포항시립도서관",
      address: "경상북도 포항시 남구 효자동 233-1",
      lat: 36.019,
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
      name: "포스텍 박태쥸학술정보관",
      address: "경상북도 포항시 남구 청아로 77",
      lat: 36.011,
      lng: 129.323,
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
      id: "mock_gyeongbuk_1",
      name: "경주시립도서관",
      address: "경상북도 경주시 양정로 260",
      lat: 35.8562,
      lng: 129.213,
      phone: "054-760-2345",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 230,
      seatUsageRate: 38,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 150, usedSeats: 54, availableSeats: 96, congestionPercent: 36, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 180, usedSeats: 72, availableSeats: 108, congestionPercent: 40, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 330,
      totalUsed: 126,
      totalAvailable: 204,
    },
    {
      id: "mock_gyeongbuk_2",
      name: "구미시립중앙도서관",
      address: "경상북도 구미시 경은로 85",
      lat: 36.1115,
      lng: 128.344,
      phone: "054-480-4660",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 290,
      seatUsageRate: 45,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 180, usedSeats: 81, availableSeats: 99, congestionPercent: 45, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 220, usedSeats: 99, availableSeats: 121, congestionPercent: 45, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 400,
      totalUsed: 180,
      totalAvailable: 220,
    },
    // ========== 경상남도 ==========
    {
      id: "mock_gyeongnam_1",
      name: "창원도서관",
      address: "경상남도 창원시 성산구 두대로 203",
      lat: 35.224,
      lng: 128.682,
      phone: "055-278-2871",
      operatingHours: { weekday: "09:00~22:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 380,
      seatUsageRate: 52,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 200, usedSeats: 104, availableSeats: 96, congestionPercent: 52, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 250, usedSeats: 130, availableSeats: 120, congestionPercent: 52, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 450,
      totalUsed: 234,
      totalAvailable: 216,
    },
    {
      id: "mock_gyeongnam_2",
      name: "김해시립도서관",
      address: "경상남도 김해시 유하1로 55",
      lat: 35.228,
      lng: 128.887,
      phone: "055-330-4651",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 260,
      seatUsageRate: 36,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 150, usedSeats: 51, availableSeats: 99, congestionPercent: 34, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 180, usedSeats: 68, availableSeats: 112, congestionPercent: 38, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 330,
      totalUsed: 119,
      totalAvailable: 211,
    },
    // ========== 제주특별자치도 ==========
    {
      id: "mock_jeju_1",
      name: "제주도서관",
      address: "제주특별자치도 제주시 연삼로 489",
      lat: 33.4996,
      lng: 126.5312,
      phone: "064-717-6400",
      operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
      nightOperation: true,
      accessible: true,
      reservable: true,
      wifi: true,
      parking: true,
      todayVisitors: 320,
      seatUsageRate: 43,
      congestionLevel: "보통" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 150, usedSeats: 62, availableSeats: 88, congestionPercent: 41, congestionLevel: "보통" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 200, usedSeats: 90, availableSeats: 110, congestionPercent: 45, congestionLevel: "보통" as const, lastUpdated: now },
      ],
      totalSeats: 350,
      totalUsed: 152,
      totalAvailable: 198,
    },
    {
      id: "mock_jeju_2",
      name: "서귀포시립도서관",
      address: "제주특별자치도 서귀포시 김정문화로 32",
      lat: 33.253,
      lng: 126.565,
      phone: "064-739-1516",
      operatingHours: { weekday: "09:00~18:00", saturday: "09:00~13:00", holiday: "휴관" },
      nightOperation: false,
      accessible: true,
      reservable: false,
      wifi: true,
      parking: true,
      todayVisitors: 140,
      seatUsageRate: 22,
      congestionLevel: "여유" as const,
      rooms: [
        { name: "종합자료실", totalSeats: 100, usedSeats: 20, availableSeats: 80, congestionPercent: 20, congestionLevel: "여유" as const, lastUpdated: now },
        { name: "열람실", totalSeats: 120, usedSeats: 28, availableSeats: 92, congestionPercent: 23, congestionLevel: "여유" as const, lastUpdated: now },
      ],
      totalSeats: 220,
      totalUsed: 48,
      totalAvailable: 172,
    },
  ];
}
