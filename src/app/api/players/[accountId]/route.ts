import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPlayer, fetchPlayerMatches, didWin } from "@/lib/opendota";
import { buildDailyStats } from "@/lib/mmr";

const SYNC_TTL_MS = 5 * 60 * 1000; // 5 phút — trong khoảng này dùng cache DB, không gọi lại OpenDota

export async function GET(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  let accountId: bigint;
  try {
    accountId = BigInt(params.accountId);
  } catch {
    return NextResponse.json(
      { error: "accountId không hợp lệ" },
      { status: 400 }
    );
  }

  let player = await prisma.player.findUnique({ where: { accountId } });

  const isStale =
    !player?.lastSyncedAt ||
    Date.now() - player.lastSyncedAt.getTime() > SYNC_TTL_MS;

  if (isStale) {
    try {
      const [profile, matches] = await Promise.all([
        fetchPlayer(accountId.toString()),
        fetchPlayerMatches(accountId.toString(), 100)
      ]);
      console.log("🚀 ~ GET ~ profile, matches:", profile, matches);

      player = await prisma.player.upsert({
        where: { accountId },
        create: {
          accountId,
          personaName: profile.profile?.personaname ?? null,
          avatar: profile.profile?.avatarfull ?? null,
          rankTier: profile.rank_tier ?? null,
          leaderboardRank: profile.leaderboard_rank ?? null,
          lastSyncedAt: new Date()
        },
        update: {
          personaName: profile.profile?.personaname ?? null,
          avatar: profile.profile?.avatarfull ?? null,
          rankTier: profile.rank_tier ?? null,
          leaderboardRank: profile.leaderboard_rank ?? null,
          lastSyncedAt: new Date()
        }
      });

      for (const m of matches) {
        await prisma.match.upsert({
          where: {
            accountId_matchId: { accountId, matchId: BigInt(m.match_id) }
          },
          create: {
            accountId,
            matchId: BigInt(m.match_id),
            startTime: new Date(m.start_time * 1000),
            win: didWin(m),
            heroId: m.hero_id,
            lobbyType: m.lobby_type,
            gameMode: m.game_mode,
            kills: m.kills,
            deaths: m.deaths,
            assists: m.assists
          },
          update: {}
        });
      }
    } catch (err) {
      // Nếu OpenDota lỗi mà đã có cache cũ thì cứ trả cache cũ, không fail cứng
      if (!player) {
        return NextResponse.json(
          { error: "Không tìm thấy player và sync OpenDota thất bại" },
          { status: 404 }
        );
      }
    }
  }

  if (!player) {
    return NextResponse.json(
      { error: "Không tìm thấy player" },
      { status: 404 }
    );
  }

  const matches = await prisma.match.findMany({
    where: { accountId },
    orderBy: { startTime: "asc" }
  });

  const dailyStats = buildDailyStats(matches);

  return NextResponse.json({
    player: {
      accountId: player.accountId.toString(),
      personaName: player.personaName,
      avatar: player.avatar,
      rankTier: player.rankTier,
      leaderboardRank: player.leaderboardRank
    },
    dailyStats
  });
}
