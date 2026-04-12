/**
 * data.go.kr API 연결 테스트 스크립트
 * 실행: node test-api.mjs
 *
 * .env.local에서 API 키를 읽어 3개 엔드포인트를 테스트합니다.
 */

import { readFileSync } from "fs";

// .env.local 파싱
function loadEnv() {
  try {
    const content = readFileSync(".env.local", "utf-8");
    const vars = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      vars[trimmed.substring(0, eqIdx)] = trimmed.substring(eqIdx + 1);
    }
    return vars;
  } catch {
    console.error("❌ .env.local 파일을 찾을 수 없습니다.");
    process.exit(1);
  }
}

const env = loadEnv();
const API_KEY = env.DATA_GO_KR_API_KEY;

if (!API_KEY) {
  console.error("❌ DATA_GO_KR_API_KEY가 .env.local에 설정되지 않았습니다.");
  process.exit(1);
}

console.log("🔑 API Key loaded (first 20 chars):", API_KEY.substring(0, 20) + "...");
console.log("");

const BASE_URL = "https://apis.data.go.kr/B551982/plr_v2";

// serviceKey 인코딩 처리
const encodedKey = API_KEY.includes("%") ? API_KEY : encodeURIComponent(API_KEY);

const endpoints = [
  { path: "/info_v2", name: "도서관 기본정보" },
  { path: "/prst_info_v2", name: "운영현황 정보" },
  { path: "/rlt_rdrm_info_v2", name: "열람실 실시간 정보" },
];

for (const ep of endpoints) {
  console.log(`━━━ ${ep.name} (${ep.path}) ━━━`);

  const url = `${BASE_URL}${ep.path}?serviceKey=${encodedKey}&pageNo=1&numOfRows=3&type=json`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Content-Type: ${contentType}`);

    if (text.startsWith("<?xml") || text.startsWith("<")) {
      // XML 에러 응답
      const errMsg =
        text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)?.[1] ||
        text.match(/<resultMsg>(.*?)<\/resultMsg>/)?.[1] ||
        "XML 에러";
      console.log(`  ❌ XML 에러: ${errMsg}`);
      console.log(`  원본 (500자):`, text.substring(0, 500));
    } else {
      try {
        const data = JSON.parse(text);
        const header = data?.response?.header;
        const body = data?.response?.body;

        if (header) {
          console.log(`  resultCode: ${header.resultCode}`);
          console.log(`  resultMsg: ${header.resultMsg}`);
        }

        if (body) {
          console.log(`  totalCount: ${body.totalCount}`);

          const items = body.items?.item || body.items || [];
          const arr = Array.isArray(items) ? items : [items];
          console.log(`  items 수: ${arr.length}`);

          if (arr.length > 0) {
            console.log(`  ✅ 성공! 첫 번째 항목 키:`, Object.keys(arr[0]).join(", "));
            console.log(`  첫 번째 항목:`, JSON.stringify(arr[0], null, 2).substring(0, 400));
          }
        } else {
          console.log(`  ⚠️ response.body 없음. 전체 키:`, Object.keys(data || {}));
          console.log(`  원본 (300자):`, text.substring(0, 300));
        }
      } catch {
        console.log(`  ❌ JSON 파싱 실패`);
        console.log(`  원본 (300자):`, text.substring(0, 300));
      }
    }
  } catch (err) {
    console.log(`  ❌ 요청 실패:`, err.message);
  }

  console.log("");
}

console.log("━━━ 테스트 완료 ━━━");
console.log("");
console.log("💡 만약 모든 엔드포인트가 실패한다면:");
console.log("  1. API 키가 올바른지 확인 (Decoding 키 사용)");
console.log("  2. data.go.kr에서 API 활용신청이 '승인' 상태인지 확인");
console.log("  3. 방화벽/VPN이 api.data.go.kr 접근을 차단하지 않는지 확인");
console.log("  4. 일일 트래픽 제한(5,000건)을 초과하지 않았는지 확인");
