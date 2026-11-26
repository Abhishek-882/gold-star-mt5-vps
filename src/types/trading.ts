export type TradeDirection = 'BUY' | 'SELL';

export interface Position {
  ticket: number;
  symbol: string;
  type: TradeDirection;
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number;
  pips: number;
  openTime: string;
  duration: string;
}

export interface HistoricalTrade {
  ticket: number;
  closeTime: string;
  symbol: string;
  type: TradeDirection;
  lots: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  pips: number;
  duration: string;
}

export interface AccountMetrics {
  balance: number;
  equity: number;
  floatingPnl: number;
  closedPnl: number;
  totalDeposit: number;
  totalWithdrawal: number;
  todayPnl: number;
  todayPnlPercent: number;
  weekPnl: number;
  weekPnlPercent: number;
  monthPnl: number;
  monthPnlPercent: number;
  totalGrowthPercent: number;
  winRate: number;
  winTrades: number;
  lossTrades: number;
  totalTrades: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  maxDrawdownUsd: number;
  sharpeRatio: number;
  freeMargin: number;
  marginLevel: number;
}

export interface DailyPnl {
  date: string; // YYYY-MM-DD
  profit: number;
  tradesCount: number;
  winCount: number;
  percent: number;
}

export interface EquityPoint {
  timestamp: string;
  date: string;
  equity: number;
  balance: number;
  growthPercent: number;
}

export interface BotConfig {
  botName: string;
  status: 'LIVE' | 'PAUSED' | 'DISCONNECTED';
  broker: string;
  server: string;
  accountNumber: string;
  symbol: string;
  timeframe: string;
  version: string;
  lastUpdated: string;
  isLiveConnected: boolean;
  connectionMode: 'metaapi' | 'bridge' | 'demo';
  telegramUrl: string;
  whatsappUrl: string;
  whatsappNumber: string;
  instagramUrl: string;
}

export interface DashboardData {
  metrics: AccountMetrics;
  botConfig: BotConfig;
  openPositions: Position[];
  closedTrades: HistoricalTrade[];
  equityCurve: EquityPoint[];
  dailyPnlHistory: DailyPnl[];
  monthlyCalendar: Record<string, DailyPnl>;
}
