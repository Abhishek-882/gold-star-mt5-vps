import { NextRequest, NextResponse } from 'next/server';
import { MT5Service } from '@/lib/mt5Service';
import { StrategySlug } from '@/types/trading';
import { getStrategyMeta } from '@/lib/strategyCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    if (slug) {
      const meta = getStrategyMeta(slug);
      if (!meta) {
        return NextResponse.json({ success: false, error: 'Unknown strategy slug' }, { status: 404 });
      }
      const result = await MT5Service.getStrategyDashboard(slug as StrategySlug);
      return NextResponse.json({
        success: true,
        strategy: result?.strategy,
        data: result?.data,
        timestamp: new Date().toISOString(),
      });
    }

    const summary = await MT5Service.getStrategySummaries();
    return NextResponse.json({
      success: true,
      ...summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load strategy telemetry';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
