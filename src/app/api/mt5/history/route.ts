import { NextRequest, NextResponse } from 'next/server';
import { MT5Service } from '@/lib/mt5Service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const type = searchParams.get('type')?.toUpperCase() || 'ALL';

    const data = await MT5Service.getDashboardData();
    let trades = [...data.closedTrades];

    if (type === 'BUY' || type === 'SELL') {
      trades = trades.filter((t) => t.type === type);
    }

    if (search) {
      trades = trades.filter(
        (t) =>
          t.ticket.toString().includes(search) ||
          t.closeTime.toLowerCase().includes(search) ||
          t.symbol.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      totalCount: trades.length,
      trades,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error fetching trade history' },
      { status: 500 }
    );
  }
}
