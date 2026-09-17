import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPlayerMatches, didWin, isRanked } from "@/lib/opendota";
import { sendDiscordNotification, formatMatchNotification } from "@/lib/discord";

// Vercel Cron (xem vercel.json) gọi endpoint này mỗi 5 phút với header
// Authorization: Bearer <CRON_SECRET>. Nếu tự host, tự setup 1 scheduler
// (node-cron, GitHub Actions cron, ...) để gọi GET endpoint này tương tự.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany();
  const results: string[] = [];

  for (const sub of subscriptions) {
    try {
      const matches = await fetchPlayerMatches(sub.accountId.toString(), 5);
      const rankedMatches = matches.filter(isRanked);
      if (rankedMatches.length === 0) continue;

      const latest = rankedMatches[0];
      const latestMatchId = BigInt(latest.match_id);

      if (sub.lastNotifiedMatchId && latestMatchId <= sub.lastNotifiedMatchId) {
        continue; // đã notify trận này rồi, bỏ qua
      }

      const player = await prisma.player.findUnique({
        where: { accountId: sub.accountId },
      });

      const win = didWin(latest);
      const mmrDelta = win ? 25 : -25;

      // Đảm bảo trận mới nhất cũng đã có trong DB để tính tổng cumulative đúng
      await prisma.match.upsert({
        where: {
          accountId_matchId: { accountId: sub.accountId, matchId: latestMatchId },
        },
        create: {
          accountId: sub.accountId,
          matchId: latestMatchId,
          startTime: new Date(latest.start_time * 1000),
          win,
          heroId: latest.hero_id,
          lobbyType: latest.lobby_type,
          gameMode: latest.game_mode,
          kills: latest.kills,
          deaths: latest.deaths,
          assists: latest.assists,
        },
        update: {},
      });

      const allRankedMatches = await prisma.match.findMany({
        where: { accountId: sub.accountId, lobbyType: 7 },
      });
      const cumulativeEstimate = allRankedMatches.reduce(
        (sum, m) => sum + (m.win ? 25 : -25),
        0
      );

      await sendDiscordNotification(
        sub.discordWebhookUrl,
        formatMatchNotification({
          personaName: player?.personaName ?? sub.accountId.toString(),
          win,
          heroId: latest.hero_id,
          mmrDelta,
          cumulativeEstimate,
        })
      );

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { lastNotifiedMatchId: latestMatchId },
      });

      results.push(`Notified ${sub.accountId.toString()} cho trận ${latestMatchId}`);
    } catch (err) {
      results.push(
        `Lỗi với ${sub.accountId.toString()}: ${(err as Error).message}`
      );
    }
  }

  return NextResponse.json({ results });
}
