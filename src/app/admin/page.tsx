/* eslint-disable @next/next/no-img-element */

export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminActions } from "./AdminActions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) redirect("/");

  const pending = await prisma.verification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">管理员后台：学生证审核</h1>
          <Link className="text-sm underline" href="/">
            返回首页
          </Link>
        </header>

        {pending.length === 0 ? (
          <div className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            暂无待审核。
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((v) => (
              <div key={v.id} className="rounded border border-zinc-200 bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm">
                      用户：<span className="font-medium">{v.user.email}</span>
                    </div>
                    <div className="text-xs text-zinc-500">提交时间：{v.createdAt.toISOString()}</div>
                    <div className="pt-2">
                      <img
                        alt="student card"
                        className="max-h-64 rounded border border-zinc-200"
                        src={`/api/admin/verification-image?userId=${encodeURIComponent(v.userId)}`}
                      />
                    </div>
                  </div>

                  <div className="min-w-[220px]">
                    <AdminActions userId={v.userId} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
