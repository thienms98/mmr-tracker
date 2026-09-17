import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accountId, discordWebhookUrl } = body as {
    accountId?: string;
    discordWebhookUrl?: string;
  };

  if (!accountId || !discordWebhookUrl) {
    return NextResponse.json(
      { error: "accountId và discordWebhookUrl là bắt buộc" },
      { status: 400 }
    );
  }

  let accountIdBig: bigint;
  try {
    accountIdBig = BigInt(accountId);
  } catch {
    return NextResponse.json({ error: "accountId không hợp lệ" }, { status: 400 });
  }

  const subscription = await prisma.subscription.upsert({
    where: {
      accountId_discordWebhookUrl: {
        accountId: accountIdBig,
        discordWebhookUrl,
      },
    },
    create: { accountId: accountIdBig, discordWebhookUrl },
    update: {},
  });

  return NextResponse.json({
    id: subscription.id,
    accountId: subscription.accountId.toString(),
  });
}
