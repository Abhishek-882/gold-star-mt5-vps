import { NextResponse } from 'next/server';
import { MT5Service } from '@/lib/mt5Service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await MT5Service.getDashboardData();
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch MT5 live telemetry',
      },
      { status: 500 }
    );
  }
}
