"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyStat {
  date: string;
  wins: number;
  losses: number;
}

export default function WinLossChart({
  dailyStats,
}: {
  dailyStats: DailyStat[];
}) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-2">Win/Loss theo ngày</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dailyStats}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="wins" fill="#22c55e" name="Thắng" />
          <Bar dataKey="losses" fill="#ef4444" name="Thua" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
