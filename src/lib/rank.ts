// rank_tier của OpenDota là 2 chữ số: chữ số đầu = medal (1-8), chữ số sau = sao (1-5)
// medal 8 (Immortal) không có sao, dùng leaderboard_rank riêng để hiển thị thứ hạng
const MEDAL_NAMES: Record<number, string> = {
  1: "Herald",
  2: "Guardian",
  3: "Crusader",
  4: "Archon",
  5: "Legend",
  6: "Ancient",
  7: "Divine",
  8: "Immortal"
};

export function formatRankTier(
  rankTier: number | null | undefined,
  leaderboardRank?: number | null
): string {
  if (rankTier == null) return "Chưa xác định";

  const medal = Math.floor(rankTier / 10);
  const star = rankTier % 10;
  const medalName = MEDAL_NAMES[medal] ?? "Không rõ";

  if (medal === 8) {
    return leaderboardRank ? `Immortal (#${leaderboardRank})` : "Immortal";
  }

  return star > 0 ? `${medalName} ${star}` : medalName;
}
