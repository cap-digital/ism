import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.CAP_WEBHOOK_SECRET!; // mesmo secret da inscrição no CAP

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
  // evt = { evento, operacao, projeto_id, estrategia_id, campaign_id, occurred_at }
  // Log do payload COMPLETO para inspecionar o que o CAP realmente envia.
  console.log("[CAP webhook] event:", evt.evento, "delivery:", req.headers.get("x-cap-delivery") || "—");
  console.log("[CAP webhook] payload:", JSON.stringify(evt));

  // >>> RECONCILIAÇÃO fica para a Fase 2 (não faz nada com os dados ainda) <<<
  // Ecoa o payload recebido na resposta — ajuda a inspecionar em testes.
  return NextResponse.json({ ok: true, received: evt }); // responder rápido (2xx)
}

// GET só para checar no navegador se a rota subiu
export async function GET() {
  return NextResponse.json({ ok: true, hint: "use POST (webhook do CAP)" });
}
