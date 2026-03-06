import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const Schema = z.object({
  userId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const status = parsed.data.action === "approve" ? "APPROVED" : "REJECTED";
  const reviewedAt = new Date();

  const v = await prisma.verification.update({
    where: { userId: parsed.data.userId },
    data: {
      status,
      note: parsed.data.note ?? null,
      reviewedAt,
      reviewedBy: admin.id,
    },
  });

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { isActive: status === "APPROVED" },
  });

  return NextResponse.json({ ok: true, verification: v });
}
