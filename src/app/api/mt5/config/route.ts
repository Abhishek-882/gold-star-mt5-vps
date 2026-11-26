import { NextRequest, NextResponse } from 'next/server';
import { MT5Service } from '@/lib/mt5Service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await MT5Service.getDashboardData();
  return NextResponse.json({
    success: true,
    config: data.botConfig,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'reset_demo') {
      const resetData = await MT5Service.resetToDemo();
      return NextResponse.json({
        success: true,
        message: 'Reset to awaiting live MT5 telemetry',
        config: resetData.botConfig,
      });
    }

    if (body.action === 'simulate_disconnect') {
      const updatedConfig = await MT5Service.updateConfig({
        status: 'DISCONNECTED',
        isLiveConnected: false,
        connectionMode: 'bridge',
      });
      return NextResponse.json({
        success: true,
        message: 'Simulated MT5 disconnect',
        config: updatedConfig,
      });
    }

    const updatedConfig = await MT5Service.updateConfig(body);
    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
      config: updatedConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error updating config' },
      { status: 400 }
    );
  }
}
