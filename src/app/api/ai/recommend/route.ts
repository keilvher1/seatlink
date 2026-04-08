import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { mockLibraries } from "@/lib/mock-data";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const libraryContext = mockLibraries
    .map((lib) => {
      const rooms = lib.rooms
        .map(
          (r) =>
            \`  - \${r.name}: \uCD1D \${r.totalSeats}\uC11D \uC911 \${r.availableSeats}\uC11D \uC5EC\uC720 (\${r.congestionLevel})\`
        )
        .join("\\n");
      return \`\uD83D\uDCDA \${lib.name} (\${lib.id})
  \uC8FC\uC18C: \${lib.address}
  \uD63C\uC7A1\uB3C4: \${lib.congestionLevel} (\uC774\uC6A9\uB960: \${lib.seatUsageRate}%)
  \uC6B4\uC601\uC2DC\uAC04: \uD3C9\uC77C \${lib.operatingHours.weekday}, \uD1A0\uC694\uC77C \${lib.operatingHours.saturday}
  \uC2DC\uC124: \${[
    lib.wifi ? "WiFi" : "",
    lib.parking ? "\uC8FC\uCC28" : "",
    lib.accessible ? "\uC7A5\uC560\uC778\uD3B8\uC758" : "",
    lib.nightOperation ? "\uC57C\uAC04\uC6B4\uC601" : "",
    lib.reservable ? "\uC88C\uC11D\uC608\uC57D" : "",
  ]
    .filter(Boolean)
    .join(", ")}
  \uCD1D\uC88C\uC11D: \${lib.totalSeats}\uC11D, \uC0AC\uC6A9\uC911: \${lib.totalUsed}\uC11D, \uC5EC\uC720: \${lib.totalAvailable}\uC11D
  \uC5F4\uB78C\uC2E4:
\${rooms}\`;
    })
    .join("\\n\\n");

  const systemPrompt = \`\uB2F9\uC2E0\uC740 "\uC88C\uC11D\uC774\uC74C(SeatLink)"\uC758 AI \uB3C4\uC11C\uAD00 \uCD94\uCC9C \uC5B4\uC2DC\uC2A4\uD134\uD2B8\uC785\uB2C8\uB2E4.

## \uC5ED\uD560
\uC0AC\uC6A9\uC790\uC758 \uC694\uAD6C\uC0AC\uD56D\uC5D0 \uB9DE\uB294 \uCD5C\uC801\uC758 \uB3C4\uC11C\uAD00\uC744 \uCD94\uCC9C\uD558\uACE0, \uC2E4\uC2DC\uAC04 \uC88C\uC11D \uD604\uD669 \uB370\uC774\uD130\uB97C \uAE30\uBC18\uC73C\uB85C \uAD6C\uCCB4\uC801\uC778 \uC548\uB0B4\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4.

## \uD604\uC7AC \uC804\uAD6D \uB3C4\uC11C\uAD00 \uC2E4\uC2DC\uAC04 \uB370\uC774\uD130
\${libraryContext}

## \uC751\uB2F5 \uADDC\uCE59
1. \uBC18\uB4DC\uC2DC \uD55C\uAD6D\uC5B4\uB85C \uB2F5\uBCC0\uD558\uC138\uC694
2. \uC0AC\uC6A9\uC790\uC758 \uC9C8\uBB38\uC774\uB098 \uC694\uAD6C\uC0AC\uD56D\uC5D0 \uB9DE\uB294 \uB3C4\uC11C\uAD00 1~3\uACF3\uC744 \uCD94\uCC9C\uD558\uC138\uC694
3. \uAC01 \uCD94\uCC9C\uC5D0 \uB300\uD574 \uC774\uC720\uB97C \uAD6C\uCCB4\uC801\uC73C\uB85C \uC124\uBA85\uD558\uC138\uC694
4. \uCD94\uCC9C \uC810\uC218(100\uC810 \uB9CC\uC810)\uB97C \uD568\uAED8 \uC81C\uC2DC\uD558\uC138\uC694
5. \uC774\uBAA8\uC9C0\uB97C \uC801\uC808\uD788 \uD65C\uC6A9\uD558\uC5EC \uC77D\uAE30 \uC27D\uAC8C \uC791\uC131\uD558\uC138\uC694
6. \uC2E4\uC2DC\uAC04 \uC88C\uC11D \uD604\uD669 \uB370\uC774\uD130\uB97C \uC801\uADF9 \uD65C\uC6A9\uD558\uC138\uC694
7. \uBC29\uBB38 \uC804 \uD301\uC774\uB098 \uCD94\uAC00 \uC815\uBCF4\uAC00 \uC788\uC73C\uBA74 \uC54C\uB824\uC8FC\uC138\uC694

## \uCD94\uCC9C \uC2DC \uACE0\uB824 \uC694\uC18C
- \uC88C\uC11D \uC5EC\uC720\uC728 (\uAC00\uC7A5 \uC911\uC694)
- \uC0AC\uC6A9\uC790\uAC00 \uC6D0\uD558\uB294 \uC2DC\uC124 (WiFi, \uC8FC\uCC28, \uC57C\uAC04\uC6B4\uC601 \uB4F1)
- \uD63C\uC7A1\uB3C4 \uB808\uBCA8
- \uC811\uADFC\uC131
- \uC6B4\uC601\uC2DC\uAC04\`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
