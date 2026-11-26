import { NextRequest, NextResponse } from 'next/server';
import { MT5Service } from '@/lib/mt5Service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.MT5_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const payload = await request.json();
    const updated = await MT5Service.ingestMT5Update(payload);

    return NextResponse.json({
      success: true,
      message: 'MT5 telemetry ingested successfully',
      serverTime: new Date().toISOString(),
      balance: updated.metrics.balance,
      equity: updated.metrics.equity,
      openPositionsCount: updated.openPositions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process webhook' },
      { status: 400 }
    );
  }
}
