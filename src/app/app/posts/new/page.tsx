"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const [pair, setPair] = useState<"JPY->CNY" | "CNY->JPY">("JPY->CNY");
  const [expectedRate, setExpectedRate] = useState("");
  const [amount, setAmount] = useState("");
  const [campus, setCampus] = useState<"TOKYO" | "OSAKA" | "OTHER">("TOKYO");
  const [wechat, setWechat] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fromCurrency = pair === "JPY->CNY" ? "JPY" : "CNY";
  const toCurrency = pair === "JPY->CNY" ? "CNY" : "JPY";

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-md space-y-4 rounded border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">发布帖子</h1>

        <label className="block text-sm">
          换汇方向
          <select
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={pair}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "JPY->CNY" || v === "CNY->JPY") setPair(v);
            }}
          >
            <option value="JPY->CNY">日元 → 人民币</option>
            <option value="CNY->JPY">人民币 → 日元</option>
          </select>
        </label>

        <label className="block text-sm">
          期望汇率
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={expectedRate}
            onChange={(e) => setExpectedRate(e.target.value)}
            placeholder="例如 0.048"
          />
        </label>

        <label className="block text-sm">
          数额
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例如 10000"
          />
        </label>

        <label className="block text-sm">
          校区
          <select
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={campus}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "TOKYO" || v === "OSAKA" || v === "OTHER") setCampus(v);
            }}
          >
            <option value="TOKYO">TOKYO</option>
            <option value="OSAKA">OSAKA</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>

        <label className="block text-sm">
          微信号（会展示在帖子里）
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={wechat}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="你的微信号"
          />
        </label>

        <label className="block text-sm">
          备注（可选）
          <textarea
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
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
              const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fromCurrency,
                  toCurrency,
                  expectedRate: Number(expectedRate),
                  amount: Number(amount),
                  campus,
                  wechat,
                  note: note || undefined,
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                setError(data?.error ?? "发布失败（可能未激活）");
                return;
              }
              router.push("/app/posts");
              router.refresh();
            } finally {
              setLoading(false);
            }
          }}
        >
          发布
        </button>

        <a className="text-sm underline" href="/app/posts">
          返回列表
        </a>
      </div>
    </div>
  );
}
