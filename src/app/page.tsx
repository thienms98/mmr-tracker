"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import WinLossChart from "@/components/WinLossChart";
import MmrEstimateChart from "@/components/MmrEstimateChart";
import SubscribeForm from "@/components/SubscribeForm";

interface DailyStat {
  date: string;
  wins: number;
  losses: number;
  mmrDelta: number;
  mmrEstimateCumulative: number;
}

interface PlayerData {
  player: {
    accountId: string;
    personaName: string | null;
    avatar: string | null;
    rankTier: number | null;
  };
  dailyStats: DailyStat[];
}

export default function Home() {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlayer(accountId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${accountId}`);
      if (!res.ok) throw new Error("Không tìm thấy player hoặc lỗi sync");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Dota 2 MMR Delta Tracker</h1>

      <SearchBar onSelectAccountId={loadPlayer} />

      {loading && <p className="mt-4 text-sm text-gray-500">Đang tải...</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {data && (
        <div className="mt-8 space-y-8">
          <div className="flex items-center gap-3">
            {data.player.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.player.avatar}
                alt={data.player.personaName ?? ""}
                className="w-10 h-10 rounded"
              />
            )}
            <div>
              <p className="font-medium">
                {data.player.personaName ?? data.player.accountId}
              </p>
              <p className="text-sm text-gray-500">
                Rank tier: {data.player.rankTier ?? "N/A"}
              </p>
            </div>
          </div>

          <WinLossChart dailyStats={data.dailyStats} />
          <MmrEstimateChart dailyStats={data.dailyStats} />
          <SubscribeForm accountId={data.player.accountId} />
        </div>
      )}
    </main>
  );
}
