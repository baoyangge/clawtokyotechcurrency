import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const Schema = z.object({
  fromCurrency: z.enum(["JPY", "CNY"]),
  toCurrency: z.enum(["JPY", "CNY"]),
  expectedRate: z.number().positive(),
  amount: z.number().positive(),
  campus: z.enum(["TOKYO", "OSAKA", "OTHER"]),
  wechat: z.string().min(2).max(64),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isActive) return NextResponse.json({ error: "NOT_ACTIVE" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.fromCurrency === parsed.data.toCurrency) {
    return NextResponse.json({ error: "SAME_CURRENCY" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { wechat: parsed.data.wechat } });

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      fromCurrency: parsed.data.fromCurrency,
      toCurrency: parsed.data.toCurrency,
      expectedRate: parsed.data.expectedRate,
      amount: parsed.data.amount,
      campus: parsed.data.campus,
      note: parsed.data.note ?? null,
    },
  });

  return NextResponse.json({ ok: true, post });
}
