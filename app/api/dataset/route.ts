import { NextResponse } from "next/server";
import { getPayload } from "@/lib/server-data";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.has("force");
  try {
    const data = await getPayload(force);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": force
          ? "no-store, max-age=0"
          : "public, max-age=0, s-maxage=1800",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Falha ao carregar dados" },
      { status: 502 },
    );
  }
}
