import { NextResponse } from "next/server";
import { getPayload } from "@/lib/server-data";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  try {
    const data = await getPayload();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=1800" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Falha ao carregar dados" },
      { status: 502 },
    );
  }
}
