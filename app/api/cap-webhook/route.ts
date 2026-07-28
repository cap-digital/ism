import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.CAP_WEBHOOK_SECRET!; // mesmo secret da inscrição no CAP

// Buffers em memória (só para inspeção/debug via GET ?debug=1).
// ATENÇÃO: por-instância e efêmeros na Vercel — podem não refletir todos os
// eventos. Fonte 100% confiável = Logs da Vercel.
interface StoredEvent {
  received_at: string;
  delivery: string;
  payload: unknown;
}
interface RejectedAttempt {
  received_at: string;
  delivery: string;
  reason: string;
  sig_recebida: string;
  sig_esperada: string;
  body_len: number;
  body: string;
}
const MAX = 10;
const lastEvents: StoredEvent[] = [];
const lastRejected: RejectedAttempt[] = [];

export async function POST(req: Request) {
  const raw = await req.text(); // corpo CRU — a assinatura é sobre os bytes exatos
  const sig = req.headers.get("x-cap-signature") || "";
  const delivery = req.headers.get("x-cap-delivery") || "—";
  const expected =
    "sha256=" + crypto.createHmac("sha256", SECRET).update(raw).digest("hex");

  // valida a assinatura (rejeita se não bater); checa tamanho antes do timingSafeEqual
  const ok =
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) {
    // Registra a tentativa rejeitada para diagnóstico (assinatura recebida vs
    // esperada, e o corpo cru — ajuda a distinguir secret errado x corpo alterado).
    console.log("[CAP webhook] REJEITADO 401 delivery:", delivery, "sig:", sig);
    lastRejected.unshift({
      received_at: new Date().toISOString(),
      delivery,
      reason: sig ? "assinatura não confere" : "sem header x-cap-signature",
      sig_recebida: sig,
      sig_esperada: expected,
      body_len: raw.length,
      body: raw.slice(0, 2000),
    });
    if (lastRejected.length > MAX) lastRejected.length = MAX;
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const evt = JSON.parse(raw);
  // Log do payload COMPLETO para inspecionar o que o CAP realmente envia.
  console.log("[CAP webhook] event:", evt.evento, "delivery:", delivery);
  console.log("[CAP webhook] payload:", JSON.stringify(evt));

  // Guarda o último payload para inspeção via GET ?debug=1 (mais recente primeiro).
  lastEvents.unshift({ received_at: new Date().toISOString(), delivery, payload: evt });
  if (lastEvents.length > MAX) lastEvents.length = MAX;

  // >>> RECONCILIAÇÃO fica para a Fase 2 (não faz nada com os dados ainda) <<<
  return NextResponse.json({ ok: true, received: evt }); // responder rápido (2xx)
}

// GET simples → info da rota. GET ?debug=1 → últimos aceitos e rejeitados.
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.has("debug")) {
    return NextResponse.json({
      ok: true,
      aceitos: lastEvents.length,
      rejeitados: lastRejected.length,
      events: lastEvents,
      rejected: lastRejected,
    });
  }
  return NextResponse.json({ ok: true, hint: "use POST (webhook do CAP)" });
}
