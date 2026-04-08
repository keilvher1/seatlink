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
            `  - ${r.name}: \uCD1D ${r.totalSeats}\uC11D \uC911 ${r.availableSeats}\uC11D \uC5EC\uC720 (${r.congestionLevel})`
        )
        .join("\n");
      return `\uD83D\uDCDA ${lib.name} (${lib.id})\n  \uC8FC\uC18C: ${lib.address}\n  \uD63C\uC7A1\uB3C4: ${lib.congestionLevel} (\uC774\uC6A9\uB960: ${lib.seatUsageRate}%)\n  \uC6B4\uC601\uC2DC\uAC04: \uD3C9\uC77C ${lib.operatingHours.weekday}, \uD1A0\uC694\uC77C ${lib.operatingHours.saturday}\n  \uCD1D\uC88C\uC11D: ${lib.totalSeats}\uC11D, \uC0AC\uC6A9\uC911: ${lib.totalUsed}\uC11D, \uC5EC\uC720: ${lib.totalAvailable}\uC11D\n  \uC5F4\uB78C\uC2E4:\n${rooms}`;
    })
    .join("\n\n");

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a Korean library recommendation assistant. Use the provided library data to recommend libraries. Always respond in Korean.",
    messages,
  });

  return result.toDataStreamResponse();
}
