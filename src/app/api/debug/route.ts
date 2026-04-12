import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  const results: any = {
    apiKeySet: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || "none",
    apiKeyContainsPercent: apiKey?.includes("%") || false,
    tests: [],
  };

  if (!apiKey) {
    return NextResponse.json(results);
  }

  const encodedKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
  results.encodedKeyPrefix = encodedKey.substring(0, 20);

  const baseUrl = "https://apis.data.go.kr/B551982/plr_v2";
  const endpoint = "/info_v2";
  const url = `${baseUrl}${endpoint}?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&type=json`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    results.tests.push({
      endpoint,
      httpStatus: res.status,
      contentType,
      responseLength: text.length,
      responsePreview: text.substring(0, 1000),
      isXml: contentType.includes("xml") || text.startsWith("<?xml") || text.startsWith("<"),
    });
  } catch (err: any) {
    results.tests.push({
      endpoint,
      error: err.message || String(err),
    });
  }

  return NextResponse.json(results);
}
