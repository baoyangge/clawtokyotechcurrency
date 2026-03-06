"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-md space-y-4 rounded border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">登录</h1>

        <label className="block text-sm">
          邮箱
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block text-sm">
          密码
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <button
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              });
              if (!res.ok) {
                setError("邮箱或密码错误");
                return;
              }
              router.push("/");
              router.refresh();
            } finally {
              setLoading(false);
            }
          }}
        >
          登录
        </button>

        <div className="text-sm text-zinc-600">
          没有账号？ <a className="underline" href="/auth/signup">注册</a>
        </div>
      </div>
    </div>
  );
}
