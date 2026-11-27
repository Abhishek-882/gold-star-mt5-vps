import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { MT5Service } from '@/lib/mt5Service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  let redisOk = false;

  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      redisOk = true;
    }
  } catch {
    redisOk = false;
  }

  let mt5Connected = false;
  let lastUpdated: string | null = null;
  try {
    const data = await MT5Service.getDashboardData();
    mt5Connected = Boolean(data.botConfig.isLiveConnected);
    lastUpdated = data.botConfig.lastUpdated || null;
  } catch {
    mt5Connected = false;
  }

  return NextResponse.json(
    {
      ok: redisOk,
      service: 'gold-star-mt5-dashboard',
      redis: redisOk ? 'connected' : 'unavailable',
      mt5FeedConnected: mt5Connected,
      lastMt5Sync: lastUpdated,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: redisOk ? 200 : 503 }
  );
}
