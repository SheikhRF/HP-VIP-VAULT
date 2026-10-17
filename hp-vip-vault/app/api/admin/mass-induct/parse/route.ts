import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXTRACT_CARS_TOOL: Anthropic.Tool = {
  name: "extract_cars",
  description: "Extract a structured list of cars from free-form text describing a fleet to be added.",
  input_schema: {
    type: "object",
    properties: {
      cars: {
        type: "array",
        description: "Every distinct car mentioned in the text, in the order they appear.",
        items: {
          type: "object",
          properties: {
            make: { type: "string", description: "Manufacturer, e.g. Ferrari, McLaren, Lamborghini." },
            model: { type: "string", description: "Model name, e.g. F40, 720S, Huracan." },
            registration: {
              type: "string",
              description:
                "UK number plate if one is mentioned, normalized with no spaces and uppercased (e.g. AB12CDE). Empty string if none is given.",
            },
          },
          required: ["make", "model", "registration"],
        },
      },
    },
    required: ["cars"],
  },
};

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (!check.ok) return check.response;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "AI parsing isn't configured yet — set ANTHROPIC_API_KEY to enable it." },
      { status: 503 }
    );
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ ok: false, error: "No text provided" }, { status: 400 });
  }
  // Keep the prompt bounded — this is meant for a pasted list, not a document dump.
  const clipped = text.slice(0, 8000);

  const anthropic = new Anthropic({ apiKey });

  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      tools: [EXTRACT_CARS_TOOL],
      tool_choice: { type: "tool", name: "extract_cars" },
      messages: [
        {
          role: "user",
          content: `Extract every car mentioned in the following text (could be a casual description, a messy list, or notes from an induction session). Text:\n\n${clipped}`,
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    return NextResponse.json({ ok: false, error: "AI did not return a structured car list" }, { status: 502 });
  }

  const input = toolUse.input as { cars?: Array<{ make?: string; model?: string; registration?: string }> };
  const cars = Array.isArray(input.cars) ? input.cars : [];

  const normalized = cars
    .map((c) => ({
      make: (c.make ?? "").trim(),
      model: (c.model ?? "").trim(),
      registration: (c.registration ?? "").toUpperCase().replace(/\s+/g, ""),
    }))
    .filter((c) => c.make || c.model || c.registration);

  return NextResponse.json({ ok: true, cars: normalized });
}
