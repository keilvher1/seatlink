import { streamText } from "ai";
import { mockLibraries } from "@/lib/mock-data";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const libraryContext = mockLibraries.map((lib) => {
    const rooms = lib.rooms.map((r) =>
      "  - " + r.name + ": " + r.totalSeats + " seats, " + r.availableSeats + " available (" + r.congestionLevel + ")"
    ).join("\n");
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
    "3. Explain reasons concretely for each recommendation",
    "4. Include recommendation score (out of 100)",
    "5. Use emojis appropriately for readability",
    "6. Actively use real-time seat data",
    "7. Share tips or additional info if available",
    "",
    "Consideration factors:",
    "- Seat availability rate (most important)",
    "- Desired facilities (WiFi, parking, night operation, etc.)",
    "- Congestion level",
    "- Accessibility",
    "- Operating hours",
  ].join("\n");

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
