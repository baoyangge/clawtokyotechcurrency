"use client";

import { useState } from "react";

export function AdminActions({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function act(action: "approve" | "reject") {
    setLoading(true);
    try {
      await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, note }),
      });
      location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        placeholder="备注（可选）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
      />
      <div className="flex gap-2">
        <button
          className="rounded bg-green-600 px-3 py-1.5 text-white text-sm disabled:opacity-50"
          onClick={() => act("approve")}
          disabled={loading}
        >
          通过
        </button>
        <button
          className="rounded bg-red-600 px-3 py-1.5 text-white text-sm disabled:opacity-50"
          onClick={() => act("reject")}
          disabled={loading}
        >
          拒绝
        </button>
      </div>
    </div>
  );
}
