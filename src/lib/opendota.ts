const BASE_URL = "https://api.opendota.com/api";

export interface OpenDotaPlayer {
  profile: {
    account_id: number;
    personaname: string;
    avatarfull: string;
  } | null;
  rank_tier: number | null;
}

export interface OpenDotaMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  start_time: number;
  hero_id: number;
  lobby_type: number;
  game_mode: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface OpenDotaSearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
  similarity: number;
}

function isRadiant(playerSlot: number) {
  return playerSlot < 128;
}

// player_slot < 128 nghĩa là bên Radiant; so với radiant_win để biết thắng/thua
export function didWin(match: OpenDotaMatch) {
  return isRadiant(match.player_slot) === match.radiant_win;
}

// lobby_type = 7 là Ranked All Pick (lobby ranked phổ biến nhất, ảnh hưởng MMR)
const RANKED_LOBBY_TYPES = new Set([7]);

export function isRanked(match: OpenDotaMatch) {
  return RANKED_LOBBY_TYPES.has(match.lobby_type);
}

async function opendotaFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`OpenDota request failed: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlayer(accountId: string | number) {
  return opendotaFetch<OpenDotaPlayer>(`/players/${accountId}`);
}

export async function fetchPlayerMatches(
  accountId: string | number,
  limit = 100
) {
  return opendotaFetch<OpenDotaMatch[]>(
    `/players/${accountId}/matches?limit=${limit}&significant=0`
  );
}

export async function searchPlayers(query: string) {
  return opendotaFetch<OpenDotaSearchResult[]>(
    `/search?q=${encodeURIComponent(query)}`
  );
}
