import { NextResponse } from "next/server";
import { getTagoCities } from "@/lib/tago";

/**
 * TAGO 서비스 가능 도시코드 목록
 * GET /api/tago-cities
 */
export async function GET() {
  if (!process.env.DATA_GO_KR_API_KEY) {
    return NextResponse.json({ error: "API key not set" }, { status: 500 });
  }

  try {
    const cities = await getTagoCities();
    return NextResponse.json(
      { cities, count: cities.length, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
