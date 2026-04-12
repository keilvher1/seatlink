import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function testFetch(label: string, serviceKey: string) {
  const baseUrl = "https://apis.data.go.kr/B551982/plr_v2";
  const endpoint = "/info_v2";
  const url = `${baseUrl}${endpoint}?serviceKey=${serviceKey}&pageNo=1&numOfRows=3&type=json`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    return {
      label,
      httpStatus: res.status,
      contentType,
      responseLength: text.length,
      responsePreview: text.substring(0, 500),
      isXml: text.startsWith("<?xml") || text.startsWith("<"),
    };
  } catch (err: any) {
    return { label, error: err.message || String(err) };
  }
}

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY || "";
  const results: any = {
    apiKeySet: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.substring(0, 15),
    apiKeyContainsPercent: apiKey.includes("%"),
    apiKeySuffix: apiKey.substring(apiKey.length - 10),
  };

  if (!apiKey) {
    return NextResponse.json(results);
  }

  const encodedKey = encodeURIComponent(apiKey);

  // Test 1: raw key (no encoding)
  const test1 = await testFetch("raw-key", apiKey);
  // Test 2: encodeURIComponent
  const test2 = await testFetch("encoded-key", encodedKey);

  results.tests = [test1, test2];
  results.encodedKeyPrefix = encodedKey.substring(0, 25);

  return NextResponse.json(results);
}
