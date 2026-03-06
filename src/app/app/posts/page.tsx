export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Campus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams ?? {};
  const campus = typeof sp.campus === "string" ? sp.campus : undefined;
  const pair = typeof sp.pair === "string" ? sp.pair : undefined;

  const where: Prisma.PostWhereInput = { isActive: true };
  if (campus && ["TOKYO", "OSAKA", "OTHER"].includes(campus)) where.campus = campus as Campus;
  if (pair === "JPY->CNY") {
    where.fromCurrency = "JPY";
    where.toCurrency = "CNY";
  }
  if (pair === "CNY->JPY") {
    where.fromCurrency = "CNY";
    where.toCurrency = "JPY";
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">帖子列表</h1>
          <div className="flex gap-3 text-sm">
            <Link className="underline" href="/">
              首页
            </Link>
            <Link className="underline" href="/app/posts/new">
              发布
            </Link>
          </div>
        </header>

        <div className="rounded border border-zinc-200 bg-white p-4 text-sm">
          <div className="font-medium mb-2">筛选</div>
          <div className="flex flex-wrap gap-2">
            <Link className="underline" href="/app/posts">
              全部
            </Link>
            <Link className="underline" href="/app/posts?pair=JPY-%3ECNY">
              日元 → 人民币
            </Link>
            <Link className="underline" href="/app/posts?pair=CNY-%3EJPY">
              人民币 → 日元
            </Link>
            <span className="text-zinc-400">|</span>
            <Link className="underline" href="/app/posts?campus=TOKYO">
              TOKYO
            </Link>
            <Link className="underline" href="/app/posts?campus=OSAKA">
              OSAKA
            </Link>
            <Link className="underline" href="/app/posts?campus=OTHER">
              OTHER
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            暂无帖子。
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="rounded border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {p.fromCurrency} → {p.toCurrency}
                  </div>
                  <div className="text-xs text-zinc-500">{p.createdAt.toISOString()}</div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    校区：<span className="font-medium">{p.campus}</span>
                  </div>
                  <div>
                    数额：<span className="font-medium">{p.amount}</span>
                  </div>
                  <div>
                    期望汇率：<span className="font-medium">{p.expectedRate}</span>
                  </div>
                  <div>
                    微信：<span className="font-medium">{p.user.wechat ?? "(未填写)"}</span>
                  </div>
                </div>
                {p.note ? <div className="mt-2 text-sm text-zinc-700">备注：{p.note}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
