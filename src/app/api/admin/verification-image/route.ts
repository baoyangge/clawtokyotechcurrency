import { NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const Query = z.object({
  userId: z.string().min(1),
});

export async function GET(req: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return new NextResponse("Forbidden", { status: 403 });

  const url = new URL(req.url);
  const parsed = Query.safeParse({ userId: url.searchParams.get("userId") });
  if (!parsed.success) return new NextResponse("Bad Request", { status: 400 });

  const v = await prisma.verification.findUnique({ where: { userId: parsed.data.userId } });
  if (!v) return new NextResponse("Not Found", { status: 404 });

  const filepath = path.join(process.cwd(), "uploads", "verifications", v.imagePath);
  const bytes = await readFile(filepath);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "image/*",
      "Cache-Control": "no-store",
    },
  });
}
