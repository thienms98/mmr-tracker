"use client";

import { useState, FormEvent } from "react";

export default function SubscribeForm({ accountId }: { accountId: string }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, discordWebhookUrl: webhookUrl }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t pt-6">
      <h2 className="text-lg font-medium mb-2">
        Nhận thông báo Discord sau mỗi trận
      </h2>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Discord webhook URL"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={status === "saving"}
        >
          Đăng ký
        </button>
      </div>
      {status === "done" && (
        <p className="text-sm text-green-600 mt-2">Đã đăng ký thành công!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500 mt-2">Có lỗi, thử lại.</p>
      )}
    </form>
  );
}
