export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  const verification = user
    ? await prisma.verification.findUnique({ where: { userId: user.id } })
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 text-zinc-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">校园换汇信息板 (MVP)</h1>
          <p className="text-sm text-zinc-600">
            先上传学生证人工审核，通过后才能发布换汇信息。平台不参与资金交易。
          </p>
        </header>

        {!user ? (
          <div className="flex gap-3">
            <Link className="rounded bg-black px-4 py-2 text-white" href="/auth/signup">
              注册
            </Link>
            <Link className="rounded border border-zinc-300 px-4 py-2" href="/auth/login">
              登录
            </Link>
          </div>
        ) : (
          <div className="rounded border border-zinc-200 bg-white p-4 space-y-2">
            <div className="text-sm">
              当前账号：<span className="font-medium">{user.email}</span>
            </div>
            <div className="text-sm">
              状态：
              {user.isActive ? (
                <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-green-800">已激活</span>
              ) : (
                <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">未激活</span>
              )}
              {verification ? (
                <span className="ml-2 text-zinc-600">(认证：{verification.status})</span>
              ) : (
                <span className="ml-2 text-zinc-600">(未提交学生证)</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link className="rounded border border-zinc-300 px-3 py-1.5" href="/app/verify">
                上传/重新上传学生证
              </Link>
              <Link className="rounded border border-zinc-300 px-3 py-1.5" href="/app/posts">
                浏览帖子
              </Link>
              {user.isActive ? (
                <Link className="rounded bg-black px-3 py-1.5 text-white" href="/app/posts/new">
                  发布帖子
                </Link>
              ) : null}
              {user.isAdmin ? (
                <Link className="rounded border border-zinc-300 px-3 py-1.5" href="/admin">
                  管理员后台
                </Link>
              ) : null}
            </div>

            <form
              action={async () => {
                "use server";
                const session = await getSession();
                session.destroy();
                redirect("/");
              }}
            >
              <button className="text-sm text-zinc-500 hover:underline" type="submit">
                退出登录
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
