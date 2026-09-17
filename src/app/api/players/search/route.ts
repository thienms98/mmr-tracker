import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/lib/opendota";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "Query quá ngắn" }, { status: 400 });
  }

  try {
    const results = await searchPlayers(q);
    return NextResponse.json(results.slice(0, 10));
  } catch (err) {
    return NextResponse.json(
      { error: "OpenDota search thất bại" },
      { status: 502 }
    );
  }
}
