import {
  DashboardData,
  BotConfig,
  Position,
  HistoricalTrade,
  DailyPnl,
  StrategySlug,
  StrategySummary,
} from '@/types/trading';
import { defaultDashboardData, generateCalendarMap } from './defaultData';
import { redisGet, redisSet } from './redis';
import {
  STRATEGY_CATALOG,
  classifyTradeStrategy,
  getStrategyMeta,
} from './strategyCatalog';

export type TerminalId = 'primary' | 'desk-5';

interface EquitySnapshot { t: number; v: number } // timestamp ms, value

interface ServerState {
  currentData: DashboardData;
  lastHeartbeat: number;
  disconnectTimeoutMs: number;
  equitySnapshots: EquitySnapshot[]; // rolling 90-day equity curve
}

declare global {
  // eslint-disable-next-line no-var
  var __goldStarServerStateMap: Record<string, ServerState> | undefined;
}

const REDIS_KEYS: Record<TerminalId, string> = {
  primary: 'goldstar:vantage:mt5:state',
  'desk-5': 'goldstar:vantage:mt5:state:desk-5',
};

function normalizeTerminalId(id?: string | null): TerminalId {
  return id === 'desk-5' ? 'desk-5' : 'primary';
}

const createInitialState = (terminalId: TerminalId = 'primary'): ServerState => {
  const data: DashboardData = JSON.parse(JSON.stringify(defaultDashboardData));
  if (terminalId === 'desk-5') {
    data.botConfig.botName = 'Gold Star Desk (5-Strategy MT5)';
    data.botConfig.symbol = 'XAUUSD / BTCUSD';
  }
  return {
    currentData: data,
    lastHeartbeat: 0,
    disconnectTimeoutMs: 120000,
    equitySnapshots: [],
  };
};

const getMemoryStore = (terminalId: TerminalId = 'primary'): ServerState => {
  if (!global.__goldStarServerStateMap) {
    global.__goldStarServerStateMap = {};
  }
  if (!global.__goldStarServerStateMap[terminalId]) {
    global.__goldStarServerStateMap[terminalId] = createInitialState(terminalId);
  }
  return global.__goldStarServerStateMap[terminalId];
};

const loadState = async (terminalId: TerminalId = 'primary'): Promise<ServerState> => {
  const stored = await redisGet<ServerState>(REDIS_KEYS[terminalId]);
  if (stored) {
    if (!stored.equitySnapshots) stored.equitySnapshots = [];
    return stored;
  }
  return getMemoryStore(terminalId);
};

const saveState = async (state: ServerState, terminalId: TerminalId = 'primary'): Promise<void> => {
  if (!global.__goldStarServerStateMap) {
    global.__goldStarServerStateMap = {};
  }
  global.__goldStarServerStateMap[terminalId] = state;
  await redisSet(REDIS_KEYS[terminalId], state);
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

function normalizePosition(p: Position, defaultSlug: StrategySlug = 'gold-star'): Position {
  return {
    ...p,
    strategySlug: p.strategySlug ?? classifyTradeStrategy(p, defaultSlug),
  };
}

function normalizeClosedTrade(t: HistoricalTrade, defaultSlug: StrategySlug = 'gold-star'): HistoricalTrade {
  const profit = t.profit ?? 0;
  const rawPips =
    t.pips ??
    Math.abs((t.closePrice ?? 0) - (t.openPrice ?? 0)) *
      (t.symbol?.toUpperCase().includes('XAU') || t.symbol?.toUpperCase().includes('GOLD')
        ? 10
        : t.symbol?.toUpperCase().includes('BTC')
        ? 1
        : 10000);
  const pips = Number((profit >= 0 ? Math.abs(rawPips) : -Math.abs(rawPips)).toFixed(1));
  return {
    ...t,
    pips,
    duration: t.duration ?? 'Closed',
    strategySlug: t.strategySlug ?? classifyTradeStrategy(t, defaultSlug),
  };
}

export class MT5Service {
  static async getDashboardData(terminalId: TerminalId = 'primary'): Promise<DashboardData> {
    const tid = normalizeTerminalId(terminalId);
    const store = await loadState(tid);
    const now = Date.now();
    const data: DashboardData = JSON.parse(JSON.stringify(store.currentData));

    if (store.lastHeartbeat === 0 || now - store.lastHeartbeat > store.disconnectTimeoutMs) {
      data.botConfig.isLiveConnected = false;
      data.botConfig.status = store.lastHeartbeat === 0 ? 'PAUSED' : 'DISCONNECTED';
    }

    const defaultSlug: StrategySlug = 'gold-star';
    if (Array.isArray(data.openPositions)) {
      data.openPositions = data.openPositions.map((p) => normalizePosition(p, defaultSlug));
    }
    if (Array.isArray(data.closedTrades)) {
      data.closedTrades = data.closedTrades.map((t) => normalizeClosedTrade(t, defaultSlug));
    }

    if (!data.botConfig.whatsappNumber) {
      data.botConfig.whatsappNumber = '+919963303115';
    }
    if (!data.botConfig.whatsappUrl || data.botConfig.whatsappUrl.startsWith('https://wa.me/?')) {
      data.botConfig.whatsappUrl =
        'https://wa.me/919963303115?text=Hi%2C%20I%20would%20like%20to%20request%20Gold%20Star%20MT5%20Bot%20demo%20%26%20investor%20access.';
    }
    if (!data.botConfig.telegramUrl || data.botConfig.telegramUrl.includes('YourUsername')) {
      data.botConfig.telegramUrl = 'https://t.me/Chinna119';
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
    terminalId?: string;
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
    balance?: number;
    equity?: number;
    margin?: number;
    freeMargin?: number;
    marginLevel?: number;
    broker?: string;
    server?: string;
    accountNumber?: string;
    symbol?: string;
    positions?: Position[];
    openPositions?: Position[];
    history?: HistoricalTrade[];
    closedTrades?: HistoricalTrade[];
    botName?: string;
    version?: string;
    timestamp?: number;
  }): Promise<DashboardData> {
    const tid = normalizeTerminalId(payload.terminalId);
    const store = await loadState(tid);
    store.lastHeartbeat = Date.now();
    const data = store.currentData;

    data.botConfig.isLiveConnected = true;
    data.botConfig.status = 'LIVE';
    data.botConfig.lastUpdated = new Date().toISOString();
    data.botConfig.connectionMode = 'bridge';

    if (payload.botName) data.botConfig.botName = payload.botName;
    if (payload.version) data.botConfig.version = payload.version;
    const broker = payload.account?.broker ?? payload.broker;
    const server = payload.account?.server ?? payload.server;
    const login = payload.account?.login ?? payload.accountNumber;
    if (broker) data.botConfig.broker = broker;
    if (server) data.botConfig.server = server;
    if (login) data.botConfig.accountNumber = login;
    if (payload.symbol) data.botConfig.symbol = payload.symbol;

    const inBalance = payload.account?.balance ?? payload.balance;
    const inEquity = payload.account?.equity ?? payload.equity;
    const balance = inBalance ?? data.metrics.balance;
    const equity = inEquity ?? data.metrics.equity;

    if (inBalance !== undefined) data.metrics.balance = balance;
    if (inEquity !== undefined) {
      data.metrics.equity = equity;
      data.metrics.floatingPnl = Number((equity - balance).toFixed(2));
    }

    const inFreeMargin = payload.account?.freeMargin ?? payload.freeMargin;
    const inMarginLevel = payload.account?.marginLevel ?? payload.marginLevel;
    const inMargin = payload.account?.margin ?? payload.margin;
    if (inFreeMargin !== undefined) data.metrics.freeMargin = inFreeMargin;
    if (inMarginLevel !== undefined) data.metrics.marginLevel = inMarginLevel;
    if (inMargin !== undefined) data.metrics.margin = inMargin;

    store.equitySnapshots = appendEquitySnapshot(store.equitySnapshots, equity);

    const incomingPositions = payload.positions ?? payload.openPositions;
    if (incomingPositions) {
      data.openPositions = incomingPositions.map((p) => normalizePosition(p, 'gold-star'));
    }

    const incomingHistory = payload.history ?? payload.closedTrades;
    if (incomingHistory && incomingHistory.length > 0) {
      const existing = new Map(
        data.closedTrades.map((t) => [t.ticket ?? t.closeTime, normalizeClosedTrade(t, 'gold-star')])
      );
      incomingHistory.forEach((t) =>
        existing.set(t.ticket ?? t.closeTime, normalizeClosedTrade(t, 'gold-star'))
      );
      data.closedTrades = Array.from(existing.values()).sort((a, b) =>
        a.closeTime > b.closeTime ? -1 : 1
      );
      recalculateStats(data, balance);
    }

    data.equityCurve = buildEquityCurve(store.equitySnapshots, data.dailyPnlHistory, balance, equity);

    await saveState(store, tid);
    return data;
  }

  static async getStrategySummaries(): Promise<{
    primaryConnected: boolean;
    desk5Connected: boolean;
    strategies: StrategySummary[];
  }> {
    const [primary, desk5] = await Promise.all([
      MT5Service.getDashboardData('primary'),
      MT5Service.getDashboardData('desk-5'),
    ]);

    const strategies: StrategySummary[] = STRATEGY_CATALOG.map((meta) => {
      const source = meta.terminalSource === 'primary' ? primary : desk5;
      const trades =
        meta.terminalSource === 'primary'
          ? source.closedTrades
          : source.closedTrades.filter((t) => t.strategySlug === meta.slug);
      const positions =
        meta.terminalSource === 'primary'
          ? source.openPositions
          : source.openPositions.filter((p) => p.strategySlug === meta.slug);

      let grossWin = 0;
      let grossLoss = 0;
      let winTrades = 0;
      let lossTrades = 0;
      for (const t of trades) {
        const p = t.profit ?? 0;
        if (p >= 0) {
          winTrades++;
          grossWin += p;
        } else {
          lossTrades++;
          grossLoss += Math.abs(p);
        }
      }
      const totalTrades = trades.length;
      const netProfit = Number((grossWin - grossLoss).toFixed(2));
      const floatingPnl = Number(positions.reduce((s, p) => s + (p.profit ?? 0), 0).toFixed(2));
      const winRate = totalTrades > 0 ? Number(((winTrades / totalTrades) * 100).toFixed(1)) : 0;
      const profitFactor =
        grossLoss > 0 ? Number((grossWin / grossLoss).toFixed(2)) : grossWin > 0 ? 99 : 0;

      return {
        meta,
        isLiveConnected: source.botConfig.isLiveConnected,
        totalTrades,
        winTrades,
        lossTrades,
        winRate,
        netProfit,
        floatingPnl,
        openCount: positions.length,
        profitFactor,
        lastUpdated: source.botConfig.lastUpdated,
      };
    });

    return {
      primaryConnected: primary.botConfig.isLiveConnected,
      desk5Connected: desk5.botConfig.isLiveConnected,
      strategies,
    };
  }

  static async getStrategyDashboard(slug: StrategySlug): Promise<{
    strategy: NonNullable<ReturnType<typeof getStrategyMeta>>;
    data: DashboardData;
  } | null> {
    const meta = getStrategyMeta(slug);
    if (!meta) return null;

    const source = await MT5Service.getDashboardData(meta.terminalSource);
    if (meta.terminalSource === 'primary') {
      return { strategy: meta, data: source };
    }

    const filtered: DashboardData = JSON.parse(JSON.stringify(source));
    filtered.botConfig.botName = meta.name;
    filtered.botConfig.symbol = meta.symbol;
    filtered.openPositions = source.openPositions.filter((p) => p.strategySlug === slug);
    filtered.closedTrades = source.closedTrades.filter((t) => t.strategySlug === slug);
    filtered.metrics.floatingPnl = Number(
      filtered.openPositions.reduce((s, p) => s + (p.profit ?? 0), 0).toFixed(2)
    );

    const baseBalance = filtered.metrics.balance > 0 ? filtered.metrics.balance : 100;
    recalculateStats(filtered, baseBalance);
    filtered.equityCurve = buildEquityCurve(
      [],
      filtered.dailyPnlHistory,
      baseBalance,
      baseBalance + filtered.metrics.floatingPnl
    );

    return { strategy: meta, data: filtered };
  }

  static async updateConfig(
    partialConfig: Partial<BotConfig>,
    terminalId: TerminalId = 'primary'
  ): Promise<BotConfig> {
    const tid = normalizeTerminalId(terminalId);
    const store = await loadState(tid);
    store.currentData.botConfig = {
      ...store.currentData.botConfig,
      ...partialConfig,
      lastUpdated: new Date().toISOString(),
    };
    await saveState(store, tid);
    return store.currentData.botConfig;
  }

  static async resetToDemo(terminalId: TerminalId = 'primary'): Promise<DashboardData> {
    const tid = normalizeTerminalId(terminalId);
    const store = createInitialState(tid);
    await saveState(store, tid);
    return store.currentData;
  }
}
