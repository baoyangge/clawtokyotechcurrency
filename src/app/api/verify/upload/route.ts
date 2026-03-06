import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "MISSING_FILE" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const uploadsDir = path.join(process.cwd(), "uploads", "verifications");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${user.id}-${randomUUID()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  await prisma.verification.upsert({
    where: { userId: user.id },
    create: { userId: user.id, imagePath: filename, status: "PENDING" },
    update: { imagePath: filename, status: "PENDING", note: null, reviewedAt: null, reviewedBy: null },
  });

  await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });

  return NextResponse.json({ ok: true });
}
