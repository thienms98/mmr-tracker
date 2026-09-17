# Dota 2 MMR Delta Tracker

Track W/L analytics theo ngày và MMR ước tính (flat ±25/trận ranked) cho nhiều
Dota 2 account bất kỳ, cộng thêm tính năng gửi thông báo Discord sau mỗi trận
ranked mới.

## Vì sao chỉ là "ước tính"?

Valve đã ẩn số MMR chính xác khỏi API công khai từ ~2018 (kể cả OpenDota lẫn
Steam Web API chính thức) vì lý do privacy. App này dùng cách ước lượng phổ
biến: mỗi trận ranked thắng +25, thua -25, cộng dồn theo thời gian. Con số
thật dao động 20-30 tuỳ streak/calibration/behavior score — đây chỉ để xem xu
hướng lên/xuống, không phải MMR thật.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL (cache match history, tránh gọi OpenDota liên tục)
- Recharts (chart)
- OpenDota API (free, không cần key ở mức dùng vừa phải — 60 req/phút)
- Discord Webhook (không cần bot/OAuth)

## Setup

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Tạo `.env` từ `.env.example`, điền `DATABASE_URL` (Postgres — dùng free
   tier của Supabase/Neon/Railway đều được) và `CRON_SECRET` (chuỗi random
   bất kỳ, dùng để bảo vệ endpoint cron):

   ```bash
   cp .env.example .env
   ```

3. Tạo bảng trong DB từ Prisma schema:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Chạy dev server:

   ```bash
   npm run dev
   ```

5. Mở http://localhost:3000, nhập Steam/Dota account ID (hoặc search theo
   tên) để xem analytics.

## Cấu trúc

```
src/
  app/
    page.tsx                          # UI chính: search + chart + subscribe form
    api/players/search/route.ts       # proxy search player theo tên (OpenDota)
    api/players/[accountId]/route.ts  # sync + trả về analytics của 1 account
    api/subscriptions/route.ts        # đăng ký nhận Discord notify
    api/cron/notify/route.ts          # cron endpoint: check trận mới, gửi Discord
  lib/
    opendota.ts                       # client gọi OpenDota API
    mmr.ts                            # logic tính W/L + MMR estimate theo ngày
    discord.ts                        # gửi Discord webhook
    prisma.ts                         # Prisma client singleton
  components/                         # SearchBar, WinLossChart, MmrEstimateChart, SubscribeForm
prisma/schema.prisma                  # Player, Match, Subscription
.github/
  workflows/
    notify-cron.yml                   # cấu hình Github Cron (mỗi 5 phút)
```

## Deploy notify feature (cron)

- **Deploy Vercel**: `vercel.json` đã cấu hình cron gọi `/api/cron/notify`
  mỗi 5 phút, Vercel tự thêm header `Authorization: Bearer <CRON_SECRET>`
  (set biến môi trường `CRON_SECRET` trên Vercel dashboard).
- **Tự host**: dùng GitHub Actions cron hoặc `node-cron` để gọi
  `GET /api/cron/notify` với header `Authorization: Bearer <CRON_SECRET>`
  mỗi vài phút.

## Lưu ý về rate limit OpenDota

Free tier OpenDota giới hạn ~60 request/phút. App đã cache trong DB và chỉ
re-sync nếu dữ liệu cũ quá 5 phút (`SYNC_TTL_MS` trong
`api/players/[accountId]/route.ts`), tăng lên nếu có nhiều user tra cứu cùng
lúc.

## TODO / hướng mở rộng

- Lọc thêm các lobby_type ranked khác (Ranked Roles = 8, Ranked Solo Mid,...)
  nếu muốn chính xác hơn thay vì chỉ 7 (Ranked All Pick)
- Thêm OpenDota API key (`api_key` query param) nếu rate limit không đủ
- Thêm auth để mỗi user tự quản lý subscription Discord của họ
