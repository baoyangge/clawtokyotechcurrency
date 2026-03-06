"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-md space-y-4 rounded border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">上传学生证（人工审核）</h1>
        <p className="text-sm text-zinc-600">
          上传清晰的学生证照片。审核通过后你的账号会被激活，才能发帖。
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <button
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading || !file}
          onClick={async () => {
            if (!file) return;
            setError(null);
            setLoading(true);
            try {
              const fd = new FormData();
              fd.append("file", file);
              const res = await fetch("/api/verify/upload", { method: "POST", body: fd });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.error ?? "上传失败");
                return;
              }
              router.push("/");
              router.refresh();
            } finally {
              setLoading(false);
            }
          }}
        >
          提交审核
        </button>

        <Link className="text-sm underline" href="/">
          返回首页
        </Link>
      </div>
    </div>
  );
}
