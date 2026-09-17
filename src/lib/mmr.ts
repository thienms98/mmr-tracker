import type { Match } from "@prisma/client";

// Ước tính flat +-25 MMR mỗi trận ranked (Valve không public MMR thật qua API,
// con số thật dao động 20-30 tuỳ streak/calibration/behavior score).
const MMR_PER_WIN = 25;

export interface DailyStat {
  date: string; // YYYY-MM-DD
  wins: number;
  losses: number;
  mmrDelta: number; // thay đổi ước tính trong ngày đó
  mmrEstimateCumulative: number; // cộng dồn từ trận ranked đầu tiên có trong DB
}

function isRankedLobby(lobbyType: number) {
  return lobbyType === 7;
}

export function buildDailyStats(matches: Match[]): DailyStat[] {
  const ranked = matches
    .filter((m) => isRankedLobby(m.lobbyType))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const byDay = new Map<string, { wins: number; losses: number }>();

  for (const m of ranked) {
    const day = m.startTime.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { wins: 0, losses: 0 };
    if (m.win) entry.wins += 1;
    else entry.losses += 1;
    byDay.set(day, entry);
  }

  const days = Array.from(byDay.keys()).sort();
  let cumulative = 0;

  return days.map((date) => {
    const { wins, losses } = byDay.get(date)!;
    const mmrDelta = (wins - losses) * MMR_PER_WIN;
    cumulative += mmrDelta;
    return { date, wins, losses, mmrDelta, mmrEstimateCumulative: cumulative };
  });
}
