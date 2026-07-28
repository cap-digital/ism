import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.CAP_WEBHOOK_SECRET!; // mesmo secret da inscrição no CAP

// Buffer em memória com os últimos eventos recebidos (só para inspeção/debug).
// ATENÇÃO: é por-instância e efêmero na Vercel — se houver mais de uma instância
// serverless, o GET pode cair numa instância diferente da que recebeu o POST e
// não mostrar o evento. Fonte 100% confiável continua sendo os Logs da Vercel.
interface StoredEvent {
  received_at: string;
  delivery: string;
  payload: unknown;
}
const MAX_EVENTS = 10;
const lastEvents: StoredEvent[] = [];

export async function POST(req: Request) {
  const raw = await req.text(); // corpo CRU — a assinatura é sobre os bytes exatos
  const sig = req.headers.get("x-cap-signature") || "";
  const expected =
    "sha256=" + crypto.createHmac("sha256", SECRET).update(raw).digest("hex");

  // valida a assinatura (rejeita se não bater); checa tamanho antes do timingSafeEqual
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const evt = JSON.parse(raw);
  const delivery = req.headers.get("x-cap-delivery") || "—";
  // Log do payload COMPLETO para inspecionar o que o CAP realmente envia.
  console.log("[CAP webhook] event:", evt.evento, "delivery:", delivery);
  console.log("[CAP webhook] payload:", JSON.stringify(evt));

  // Guarda o último payload para inspeção via GET ?debug=1 (mais recente primeiro).
  lastEvents.unshift({
    received_at: new Date().toISOString(),
    delivery,
    payload: evt,
  });
  if (lastEvents.length > MAX_EVENTS) lastEvents.length = MAX_EVENTS;

  // >>> RECONCILIAÇÃO fica para a Fase 2 (não faz nada com os dados ainda) <<<
  return NextResponse.json({ ok: true, received: evt }); // responder rápido (2xx)
}

// GET simples → info da rota. GET ?debug=1 → últimos payloads recebidos.
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.has("debug")) {
    return NextResponse.json({
      ok: true,
      count: lastEvents.length,
      events: lastEvents,
    });
  }
  return NextResponse.json({ ok: true, hint: "use POST (webhook do CAP)" });
}
