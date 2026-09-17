export async function sendDiscordNotification(
  webhookUrl: string,
  content: string
) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    throw new Error(`Discord webhook failed: ${res.status}`);
  }
}

export function formatMatchNotification(params: {
  personaName: string;
  win: boolean;
  heroId: number;
  mmrDelta: number;
  cumulativeEstimate: number;
}) {
  const { personaName, win, heroId, mmrDelta, cumulativeEstimate } = params;
  const resultLabel = win ? "🟢 THẮNG" : "🔴 THUA";
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

  return [
    `**${personaName}** vừa đấu xong trận ranked`,
    `${resultLabel} | Hero ID: ${heroId}`,
    `MMR ước tính: ${sign(mmrDelta)} (tổng ước tính: ${sign(cumulativeEstimate)})`,
  ].join("\n");
}
