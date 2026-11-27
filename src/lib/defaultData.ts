import { DashboardData, HistoricalTrade, Position, EquityPoint, DailyPnl, BotConfig, AccountMetrics } from '@/types/trading';

export const initialBotConfig: BotConfig = {
  botName: "Gold Star (XAUUSD Pro)",
  status: "PAUSED",
  broker: "Vantage Markets",
  server: "Awaiting Live Vantage MT5 Connection",
  accountNumber: "Awaiting Live MT5 Connection",
  symbol: "XAUUSD (Gold)",
  timeframe: "M5 / M15 Dual Matrix",
  version: "v4.8.2 Institutional",
  lastUpdated: new Date().toISOString(),
  isLiveConnected: false,
  connectionMode: "bridge",
  telegramUrl: "https://t.me/Chinna119",
  whatsappUrl: "https://wa.me/919963303115?text=Hi%2C%20I%20would%20like%20to%20request%20Gold%20Star%20MT5%20Bot%20demo%20%26%20investor%20access.",
  whatsappNumber: "+919963303115",
  instagramUrl: "https://instagram.com/YourPage",
};

// Real zero-baseline initial metrics (Zero fake values - Real MT5 data only)
export const initialMetrics: AccountMetrics = {
  balance: 0.00,
  equity: 0.00,
  floatingPnl: 0.00,
  closedPnl: 0.00,
  totalDeposit: 0.00,
  totalWithdrawal: 0.00,
  todayPnl: 0.00,
  todayPnlPercent: 0.00,
  weekPnl: 0.00,
  weekPnlPercent: 0.00,
  monthPnl: 0.00,
  monthPnlPercent: 0.00,
  totalGrowthPercent: 0.00,
  winRate: 0.0,
  winTrades: 0,
  lossTrades: 0,
  totalTrades: 0,
  profitFactor: 0.00,
  maxDrawdownPercent: 0.00,
  maxDrawdownUsd: 0.00,
  sharpeRatio: 0.00,
  freeMargin: 0.00,
  margin: 0.00,
  marginLevel: 0.00,
};

export const initialOpenPositions: Position[] = [];

export const initialClosedTrades: HistoricalTrade[] = [];

export const initialEquityCurve: EquityPoint[] = [];

export const initialDailyPnl: DailyPnl[] = [];

export const generateCalendarMap = (dailyList: DailyPnl[]): Record<string, DailyPnl> => {
  const map: Record<string, DailyPnl> = {};
  if (!dailyList) return map;
  dailyList.forEach(item => {
    map[item.date] = item;
  });
  return map;
};

export const defaultDashboardData: DashboardData = {
  metrics: initialMetrics,
  botConfig: initialBotConfig,
  openPositions: initialOpenPositions,
  closedTrades: initialClosedTrades,
  equityCurve: initialEquityCurve,
  dailyPnlHistory: initialDailyPnl,
  monthlyCalendar: generateCalendarMap(initialDailyPnl),
};
