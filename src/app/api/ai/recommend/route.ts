import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { mockLibraries } from "@/lib/mock-data";

export const runtime = "edge";

const gateway = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || "",
  baseURL: "https://ai-gateway.vercel.sh/v1",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const libraryContext = mockLibraries.map(function(lib) {
    const rooms = lib.rooms.map(function(r) {
      return "  - " + r.name + ": " + r.totalSeats + " seats, " + r.availableSeats + " available (" + r.congestionLevel + ")";
    }).join("\n");
    const facilities = [
      lib.wifi ? "WiFi" : "",
      lib.parking ? "Parking" : "",
      lib.nightOperation ? "Night" : "",
      lib.reservable ? "Reservable" : "",
    ].filter(Boolean).join(", ");
    return lib.name + " (" + lib.id + ")\n" +
      "  Address: " + lib.address + "\n" +
      "  Congestion: " + lib.congestionLevel + " (" + lib.seatUsageRate + "%)\n" +
      "  Hours: Weekday " + lib.operatingHours.weekday + ", Sat " + lib.operatingHours.saturday + "\n" +
      "  Facilities: " + facilities + "\n" +
      "  Seats: " + lib.totalSeats + " total, " + lib.totalUsed + " used, " + lib.totalAvailable + " available\n" +
      "  Rooms:\n" + rooms;
  }).join("\n\n");

  const systemPrompt = [
    "You are the AI library recommendation assistant for SeatLink.",
    "Your role: Recommend optimal libraries based on real-time seat data.",
    "",
    "Current nationwide library real-time data:",
    libraryContext,
    "",
    "Response rules:",
    "1. Always respond in Korean",
    "2. Recommend 1-3 libraries matching user needs",
    "3. Include specific seat numbers and congestion info",
    "4. Consider facilities like WiFi, parking, night hours",
    "5. Explain why each library is recommended",
    "6. Show congestion score for each recommended library",
    "7. Be friendly and helpful",
    "8. If user asks about a specific area, filter by address",
    "9. Format recommendations clearly with library name, address, available seats",
    "10. Mention operating hours when relevant"
  ].join("\n");

  const result = streamText({
    model: gateway("openai/gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}

