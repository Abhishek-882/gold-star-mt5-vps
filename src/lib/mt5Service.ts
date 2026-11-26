import { DashboardData, BotConfig, Position, HistoricalTrade, DailyPnl } from '@/types/trading';
import { defaultDashboardData, generateCalendarMap } from './defaultData';
import { redisGet, redisSet } from './redis';

interface EquitySnapshot { t: number; v: number } // timestamp ms, value

interface ServerState {
  currentData: DashboardData;
  lastHeartbeat: number;
  disconnectTimeoutMs: number;
  equitySnapshots: EquitySnapshot[]; // rolling 90-day equity curve
}

declare global {
  // eslint-disable-next-line no-var
  var __goldStarServerState: ServerState | undefined;
}

const REDIS_KEY = 'goldstar:vantage:mt5:state';

const createInitialState = (): ServerState => ({
  currentData: JSON.parse(JSON.stringify(defaultDashboardData)),
  lastHeartbeat: 0,
  disconnectTimeoutMs: 120000,
  equitySnapshots: [],
});

const getMemoryStore = (): ServerState => {
  if (!global.__goldStarServerState) {
    global.__goldStarServerState = createInitialState();
  }
  return global.__goldStarServerState;
};

const loadState = async (): Promise<ServerState> => {
  const stored = await redisGet<ServerState>(REDIS_KEY);
  if (stored) {
    // back-fill missing equitySnapshots field for old stored states
    if (!stored.equitySnapshots) stored.equitySnapshots = [];
    return stored;
  }
  return getMemoryStore();
};

const saveState = async (state: ServerState): Promise<void> => {
  global.__goldStarServerState = state;
  await redisSet(REDIS_KEY, state);
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayUTC() {
  return new Date().toISOString().split('T')[0]; // "2026-11-26"
}
function dateFromStr(s: string) {
  // accepts "2026.11.26 12:34:56" or "2026-11-26 12:34:56" or ISO
  return s.replace(/\./g, '-').split(' ')[0].split('T')[0];
}
function startOfDayMs(isoDate: string) {
  return new Date(isoDate + 'T00:00:00Z').getTime();
}

/** Keep equity snapshots — one per 30-min bucket, 90-day window max */
function appendEquitySnapshot(snapshots: EquitySnapshot[], equity: number): EquitySnapshot[] {
  const now = Date.now();
  const cutoff = now - 90 * 86400 * 1000;
  const bucket = Math.floor(now / (30 * 60 * 1000)); // 30-min bucket id

  // Drop old entries outside 90 days
  let fresh = snapshots.filter(s => s.t > cutoff);

  // Update or append current bucket (last entry)
  if (fresh.length > 0 && Math.floor(fresh[fresh.length - 1].t / (30 * 60 * 1000)) === bucket) {
    fresh[fresh.length - 1].v = equity; // update same bucket
  } else {
    fresh.push({ t: now, v: equity });
  }

  return fresh;
}

/** Build equityCurve array from historical daily PnL + live equity snapshots */
function buildEquityCurve(
  snapshots: EquitySnapshot[],
  dailyList: DailyPnl[],
  currentBalance: number,
  currentEquity: number
): Array<{ timestamp: string; date: string; equity: number; balance: number; growthPercent: number }> {
  const points: Array<{ timestamp: string; date: string; equity: number; balance: number; growthPercent: number }> = [];

  if (dailyList && dailyList.length > 0) {
    const totalRealized = dailyList.reduce((acc, d) => acc + d.profit, 0);
    const startCap = Number(Math.max(1, currentBalance - totalRealized).toFixed(2));
    const firstDate = dailyList[0].date;

    points.push({
      timestamp: firstDate + 'T00:00:00Z',
      date: firstDate,
      equity: startCap,
      balance: startCap,
      growthPercent: 0,
    });

    let running = startCap;
    for (const day of dailyList) {
      running = Number((running + day.profit).toFixed(2));
      const growth = startCap > 0 ? Number((((running - startCap) / startCap) * 100).toFixed(2)) : 0;
      points.push({
        timestamp: day.date + 'T23:59:00Z',
        date: day.date,
        equity: running,
        balance: running,
        growthPercent: growth,
      });
    }

    // Append latest live snapshot if newer than last trade day
    const lastHistDate = dailyList[dailyList.length - 1].date;
    const liveIso = snapshots.length > 0 ? new Date(snapshots[snapshots.length - 1].t).toISOString() : new Date().toISOString();
    const liveDate = liveIso.split('T')[0];
    if (liveDate > lastHistDate || Math.abs(currentEquity - running) > 0.01) {
      const growth = startCap > 0 ? Number((((currentEquity - startCap) / startCap) * 100).toFixed(2)) : 0;
      points.push({
        timestamp: liveIso,
        date: 'Live',
        equity: currentEquity,
        balance: currentBalance,
        growthPercent: growth,
      });
    }
    return points;
  }

  const base = snapshots[0]?.v || currentEquity || 1;
  return snapshots.map(s => {
    const iso = new Date(s.t).toISOString();
    const growth = base > 0 ? Number((((s.v - base) / base) * 100).toFixed(2)) : 0;
    return {
      timestamp: iso,
      date: iso.split('T')[0],
      equity: s.v,
      balance: s.v,
      growthPercent: growth,
    };
  });
}

/** Sum profits for trades closed within [startMs, endMs] */
function sumPnlInRange(trades: HistoricalTrade[], startMs: number, endMs: number): number {
  return trades
    .filter(t => {
      const d = new Date(dateFromStr(t.closeTime) + 'T00:00:00Z').getTime();
      return d >= startMs && d <= endMs;
    })
    .reduce((acc, t) => acc + t.profit, 0);
}

/** Recalculate all stats from closed trades */
function recalculateStats(data: DashboardData, balance: number) {
  const trades = data.closedTrades;

  let wins = 0, losses = 0, grossProfit = 0, grossLoss = 0, totalRealized = 0;
  const dailyBuckets: Record<string, { profit: number; trades: number; wins: number }> = {};

  trades.forEach(t => {
    totalRealized += t.profit;
    if (t.profit > 0) { wins++; grossProfit += t.profit; }
    else             { losses++; grossLoss += Math.abs(t.profit); }

    const dateStr = dateFromStr(t.closeTime);
    if (!dailyBuckets[dateStr]) dailyBuckets[dateStr] = { profit: 0, trades: 0, wins: 0 };
    dailyBuckets[dateStr].profit += t.profit;
    dailyBuckets[dateStr].trades += 1;
    if (t.profit > 0) dailyBuckets[dateStr].wins += 1;
  });

  // Core metrics
  data.metrics.closedPnl    = Number(totalRealized.toFixed(2));
  data.metrics.totalTrades  = trades.length;
  data.metrics.winTrades    = wins;
  data.metrics.lossTrades   = losses;
  data.metrics.winRate      = trades.length > 0 ? Number(((wins / trades.length) * 100).toFixed(1)) : 0;
  data.metrics.profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 99.0 : 0);

  // Time-window PnL
  const now = Date.now();
  const todayStart = startOfDayMs(todayUTC());
  const weekStart  = todayStart - 6 * 86400 * 1000;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  data.metrics.todayPnl      = Number(sumPnlInRange(trades, todayStart, now).toFixed(2));
  data.metrics.weekPnl       = Number(sumPnlInRange(trades, weekStart, now).toFixed(2));
  data.metrics.monthPnl      = Number(sumPnlInRange(trades, monthStart, now).toFixed(2));
  data.metrics.todayPnlPercent  = balance > 0 ? Number(((data.metrics.todayPnl  / balance) * 100).toFixed(2)) : 0;
  data.metrics.weekPnlPercent   = balance > 0 ? Number(((data.metrics.weekPnl   / balance) * 100).toFixed(2)) : 0;
  data.metrics.monthPnlPercent  = balance > 0 ? Number(((data.metrics.monthPnl  / balance) * 100).toFixed(2)) : 0;
  data.metrics.totalGrowthPercent = balance > 0 ? Number(((totalRealized / balance) * 100).toFixed(2)) : 0;

  // Daily PnL history + calendar
  const dailyList: DailyPnl[] = Object.entries(dailyBuckets)
    .map(([date, val]) => ({
      date,
      profit: Number(val.profit.toFixed(2)),
      tradesCount: val.trades,
      winCount: val.wins,
      percent: balance > 0 ? Number(((val.profit / balance) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  data.dailyPnlHistory  = dailyList;
  data.monthlyCalendar  = generateCalendarMap(dailyList);
}

// ── MT5Service ───────────────────────────────────────────────────────────────

function normalizeClosedTrade(t: HistoricalTrade): HistoricalTrade {
  const profit = t.profit ?? 0;
  const rawPips =
    t.pips ??
    Math.abs((t.closePrice ?? 0) - (t.openPrice ?? 0)) *
      (t.symbol?.toUpperCase().includes('XAU') || t.symbol?.toUpperCase().includes('GOLD') ? 10 : 10000);
  const pips = Number((profit >= 0 ? Math.abs(rawPips) : -Math.abs(rawPips)).toFixed(1));
  return {
    ...t,
    pips,
    duration: t.duration ?? 'Closed',
  };
}

export class MT5Service {
  static async getDashboardData(): Promise<DashboardData> {
    const store = await loadState();
    const now = Date.now();
    const data = store.currentData;

    if (store.lastHeartbeat === 0 || now - store.lastHeartbeat > store.disconnectTimeoutMs) {
      data.botConfig.isLiveConnected = false;
      data.botConfig.status = store.lastHeartbeat === 0 ? 'PAUSED' : 'DISCONNECTED';
    }

    if (Array.isArray(data.closedTrades)) {
      data.closedTrades = data.closedTrades.map(normalizeClosedTrade);
    }

    if (!data.botConfig.whatsappNumber) {
      data.botConfig.whatsappNumber = '+919963303115';
    }
    if (!data.botConfig.whatsappUrl || data.botConfig.whatsappUrl.startsWith('https://wa.me/?')) {
      data.botConfig.whatsappUrl =
        'https://wa.me/919963303115?text=Hi%2C%20I%20would%20like%20to%20request%20Gold%20Star%20MT5%20Bot%20demo%20%26%20investor%20access.';
    }

    data.equityCurve = buildEquityCurve(
      store.equitySnapshots,
      data.dailyPnlHistory,
      data.metrics.balance,
      data.metrics.equity
    );

    return data;
  }

  static async ingestMT5Update(payload: {
    account?: {
      balance?: number;
      equity?: number;
      margin?: number;
      freeMargin?: number;
      marginLevel?: number;
      broker?: string;
      server?: string;
      login?: string;
    };
    positions?: Position[];
    history?: HistoricalTrade[];
    botName?: string;
    version?: string;
    timestamp?: number;
  }): Promise<DashboardData> {
    const store = await loadState();
    store.lastHeartbeat = Date.now();
    const data = store.currentData;

    data.botConfig.isLiveConnected = true;
    data.botConfig.status = 'LIVE';
    data.botConfig.lastUpdated = new Date().toISOString();
    data.botConfig.connectionMode = 'bridge';

    if (payload.botName)          data.botConfig.botName = payload.botName;
    if (payload.version)          data.botConfig.version = payload.version;
    if (payload.account?.broker)  data.botConfig.broker = payload.account.broker;
    if (payload.account?.server)  data.botConfig.server = payload.account.server;
    if (payload.account?.login)   data.botConfig.accountNumber = payload.account.login;

    const balance = payload.account?.balance ?? data.metrics.balance;
    const equity  = payload.account?.equity  ?? data.metrics.equity;

    if (payload.account?.balance !== undefined) data.metrics.balance = balance;
    if (payload.account?.equity  !== undefined) {
      data.metrics.equity      = equity;
      data.metrics.floatingPnl = Number((equity - balance).toFixed(2));
    }
    if (payload.account?.freeMargin   !== undefined) data.metrics.freeMargin   = payload.account.freeMargin;
    if (payload.account?.marginLevel  !== undefined) data.metrics.marginLevel  = payload.account.marginLevel;
    if (payload.account?.margin       !== undefined) data.metrics.margin       = payload.account.margin;

    // Equity curve snapshot
    store.equitySnapshots = appendEquitySnapshot(store.equitySnapshots, equity);

    // Open positions
    if (payload.positions) data.openPositions = payload.positions;

    // Closed trade history — merge & deduplicate by ticket
    if (payload.history && payload.history.length > 0) {
      const existing = new Map(data.closedTrades.map(t => [t.ticket ?? t.closeTime, normalizeClosedTrade(t)]));
      payload.history.forEach(t => existing.set(t.ticket ?? t.closeTime, normalizeClosedTrade(t)));
      data.closedTrades = Array.from(existing.values())
        .sort((a, b) => (a.closeTime > b.closeTime ? -1 : 1)); // newest first
      recalculateStats(data, balance);
    }

    data.equityCurve = buildEquityCurve(store.equitySnapshots, data.dailyPnlHistory, balance, equity);

    await saveState(store);
    return data;
  }

  static async updateConfig(partialConfig: Partial<BotConfig>): Promise<BotConfig> {
    const store = await loadState();
    store.currentData.botConfig = {
      ...store.currentData.botConfig,
      ...partialConfig,
      lastUpdated: new Date().toISOString(),
    };
    await saveState(store);
    return store.currentData.botConfig;
  }

  static async resetToDemo(): Promise<DashboardData> {
    const store = createInitialState();
    await saveState(store);
    return store.currentData;
  }
}
