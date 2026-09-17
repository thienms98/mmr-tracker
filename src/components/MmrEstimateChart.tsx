"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyStat {
  date: string;
  mmrEstimateCumulative: number;
}

export default function MmrEstimateChart({
  dailyStats,
}: {
  dailyStats: DailyStat[];
}) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-2">
        MMR ước tính (cộng dồn, ±25/trận ranked)
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dailyStats}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="mmrEstimateCumulative"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        * Đây là số ước tính (flat ±25/trận ranked), không phải MMR thật —
        Valve không public MMR chính xác qua API.
      </p>
    </div>
  );
}
