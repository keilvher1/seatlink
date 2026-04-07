import { NextRequest, NextResponse } from "next/server";
import { fetchLibraryInfo, fetchLibraryStatus, fetchLibraryRealtime } from "@/lib/api-client";
import { mockLibraries } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stdgCd = searchParams.get("stdgCd") || undefined;
  const useMock = !process.env.DATA_GO_KR_API_KEY;

  // API 키가 없으면 목업 데이터 반환
  if (useMock) {
    return NextResponse.json({
      libraries: mockLibraries,
      totalCount: mockLibraries.length,
      updatedAt: new Date().toISOString(),
      source: "mock",
    });
  }

  try {
    // 3개 API를 병렬로 호출
    const [infoRes, statusRes, realtimeRes] = await Promise.all([
      fetchLibraryInfo(stdgCd),
      fetchLibraryStatus(stdgCd),
      fetchLibraryRealtime(stdgCd),
    ]);

    // 데이터 병합: 도서관ID 기준으로 합치기
    const libraryMap = new Map<string, any>();

    // 1) 기본정보 매핑
    for (const item of infoRes.items) {
      const id = item.pblibId || item.lcgvmnInstCd + "_" + (item.pblibNm || "");
      libraryMap.set(id, {
        id,
        name: item.pblibNm || "",
        address: item.pblibRoadNmAddr || item.pblibLotnoAddr || "",
        lat: parseFloat(item.lat) || 0,
        lng: parseFloat(item.lot) || 0,
        phone: item.pblibTelno || "",
        operatingHours: {
          weekday: `${item.wkdyOperBgngTm || "09:00"}~${item.wkdyOperEndTm || "18:00"}`,
          saturday: `${item.satOperBgngTm || "09:00"}~${item.satOperEndTm || "17:00"}`,
          holiday: item.lhldyOperBgngTm ? `${item.lhldyOperBgngTm}~${item.lhldyOperEndTm}` : "휴관",
        },
        nightOperation: parseInt(item.wkdyOperEndTm || "18") >= 21,
        accessible: true,
        reservable: false,
        wifi: true,
        parking: false,
        todayVisitors: 0,
        seatUsageRate: 0,
        congestionLevel: "여유" as const,
        rooms: [],
        totalSeats: parseInt(item.tseatCnt) || 0,
        totalUsed: 0,
        totalAvailable: 0,
      });
    }

    // 2) 운영현황 매핑
    for (const item of statusRes.items) {
      const id = item.pblibId || item.lcgvmnInstCd + "_" + (item.pblibNm || "");
      const lib = libraryMap.get(id);
      if (lib) {
        lib.todayVisitors = parseInt(item.tdyVstrCnt) || 0;
        lib.seatUsageRate = parseFloat(item.seatUsgrt) || 0;
        lib.reservable = item.rsvtPsbltyYn === "Y";
        const rate = lib.seatUsageRate;
        lib.congestionLevel = rate < 40 ? "여유" : rate <= 70 ? "보통" : "혼잡";
      }
    }

    // 3) 실시간 열람실 매핑
    for (const item of realtimeRes.items) {
      const id = item.pblibId || item.lcgvmnInstCd + "_" + (item.pblibNm || "");
      const lib = libraryMap.get(id);
      if (lib) {
        const total = parseInt(item.tseatCnt) || 0;
        const used = parseInt(item.useSeatCnt) || 0;
        const available = parseInt(item.rmndSeatCnt) || total - used;
        const pct = total > 0 ? Math.round((used / total) * 100) : 0;

        lib.rooms.push({
          name: item.rdrmNm || "열람실",
          totalSeats: total,
          usedSeats: used,
          availableSeats: available,
          congestionPercent: pct,
          congestionLevel: pct < 40 ? "여유" : pct <= 70 ? "보통" : "혼잡",
          lastUpdated: "방금 전",
        });

        // 전체 합산 업데이트
        lib.totalSeats = lib.rooms.reduce((s: number, r: any) => s + r.totalSeats, 0);
        lib.totalUsed = lib.rooms.reduce((s: number, r: any) => s + r.usedSeats, 0);
        lib.totalAvailable = lib.rooms.reduce((s: number, r: any) => s + r.availableSeats, 0);
      }
    }

    const libraries = Array.from(libraryMap.values()).filter((l) => l.lat !== 0 && l.lng !== 0);

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
  } catch (error) {
    console.error("Libraries API error:", error);
    // 에러 시 목업 데이터 폴백
    return NextResponse.json({
      libraries: mockLibraries,
      totalCount: mockLibraries.length,
      updatedAt: new Date().toISOString(),
      source: "mock-fallback",
    });
  }
}
