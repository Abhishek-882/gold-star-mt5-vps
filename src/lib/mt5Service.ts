import { DashboardData, BotConfig, Position, HistoricalTrade, DailyPnl } from '@/types/trading';
import { defaultDashboardData, generateCalendarMap } from './defaultData';

interface ServerState {
  currentData: DashboardData;
  lastHeartbeat: number; // Unix timestamp ms
  disconnectTimeoutMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __goldStarServerState: ServerState | undefined;
}

const REDIS_KEY = 'goldstar:vantage:mt5:state';

const createInitialState = (): ServerState => ({
  currentData: JSON.parse(JSON.stringify(defaultDashboardData)),
  lastHeartbeat: 0,
  disconnectTimeoutMs: 120000, // 2 minutes without ping triggers DISCONNECTED
});

const getMemoryStore = (): ServerState => {
  if (!global.__goldStarServerState) {
    global.__goldStarServerState = createInitialState();
  }
  return global.__goldStarServerState;
};

const getRedisConfig = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
};

const loadState = async (): Promise<ServerState> => {
  const redis = getRedisConfig();
  if (!redis) return getMemoryStore();

  try {
    const res = await fetch(`${redis.url}/get/${REDIS_KEY}`, {
      headers: { Authorization: `Bearer ${redis.token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.result) {
        return JSON.parse(json.result) as ServerState;
      }
    }
  } catch (err) {
    console.error('[MT5Service] Redis read error, falling back to memory:', err);
  }
  return getMemoryStore();
};

const saveState = async (state: ServerState): Promise<void> => {
  global.__goldStarServerState = state;
  const redis = getRedisConfig();
  if (!redis) return;

  try {
    await fetch(`${redis.url}/set/${REDIS_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redis.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(state)),
    });
  } catch (err) {
    console.error('[MT5Service] Redis write error:', err);
  }
};

export class MT5Service {
  /**
   * Returns current live MT5 telemetry. Never fabricates demo values.
   */
  static async getDashboardData(): Promise<DashboardData> {
    const store = await loadState();
    const now = Date.now();
    const data = store.currentData;

    if (store.lastHeartbeat === 0 || now - store.lastHeartbeat > store.disconnectTimeoutMs) {
      data.botConfig.isLiveConnected = false;
      data.botConfig.status = store.lastHeartbeat === 0 ? 'PAUSED' : 'DISCONNECTED';
    }

    return data;
  }

  /**
   * Ingest webhook data from Native MQL5 WebRequest EA or Python MT5 bridge
   */
  static async ingestMT5Update(payload: {
    account?: {
      balance?: number;
      equity?: number;
      margin?: number;
      freeMargin?: number;
      broker?: string;
      server?: string;
      login?: string;
    };
    positions?: Position[];
    history?: HistoricalTrade[];
    botName?: string;
    version?: string;
  }): Promise<DashboardData> {
    const store = await loadState();
    store.lastHeartbeat = Date.now();
    const data = store.currentData;

    data.botConfig.isLiveConnected = true;
    data.botConfig.status = 'LIVE';
    data.botConfig.lastUpdated = new Date().toISOString();
    data.botConfig.connectionMode = 'bridge';

    if (payload.botName) data.botConfig.botName = payload.botName;
    if (payload.version) data.botConfig.version = payload.version;
    if (payload.account?.broker) data.botConfig.broker = payload.account.broker;
    if (payload.account?.server) data.botConfig.server = payload.account.server;
    if (payload.account?.login) data.botConfig.accountNumber = payload.account.login;

    if (payload.account?.balance !== undefined) data.metrics.balance = payload.account.balance;
    if (payload.account?.equity !== undefined) {
      data.metrics.equity = payload.account.equity;
      data.metrics.floatingPnl = Number(
        (payload.account.equity - (payload.account.balance || data.metrics.balance)).toFixed(2)
      );
    }
    if (payload.account?.freeMargin !== undefined) data.metrics.freeMargin = payload.account.freeMargin;

    if (payload.positions) {
      data.openPositions = payload.positions;
    }

    if (payload.history && payload.history.length > 0) {
      data.closedTrades = payload.history;
      this.recalculateStats(data);
    }

    await saveState(store);
    return data;
  }

  private static recalculateStats(data: DashboardData) {
    const trades = data.closedTrades;
    if (trades.length === 0) return;

    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let totalRealized = 0;

    const dailyBuckets: Record<string, { profit: number; trades: number; wins: number }> = {};

    trades.forEach((t) => {
      totalRealized += t.profit;
      if (t.profit > 0) {
        wins++;
        grossProfit += t.profit;
      } else {
        losses++;
        grossLoss += Math.abs(t.profit);
      }

      const dateStr = t.closeTime.split(' ')[0];
      if (!dailyBuckets[dateStr]) {
        dailyBuckets[dateStr] = { profit: 0, trades: 0, wins: 0 };
      }
      dailyBuckets[dateStr].profit += t.profit;
      dailyBuckets[dateStr].trades += 1;
      if (t.profit > 0) dailyBuckets[dateStr].wins += 1;
    });

    data.metrics.closedPnl = Number(totalRealized.toFixed(2));
    data.metrics.totalTrades = trades.length;
    data.metrics.winTrades = wins;
    data.metrics.lossTrades = losses;
    data.metrics.winRate = Number(((wins / trades.length) * 100).toFixed(1));
    data.metrics.profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : 99.0;

    const dailyList: DailyPnl[] = Object.entries(dailyBuckets)
      .map(([date, val]) => ({
        date,
        profit: Number(val.profit.toFixed(2)),
        tradesCount: val.trades,
        winCount: val.wins,
        percent: Number(((val.profit / (data.metrics.balance || 10000)) * 100).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    data.dailyPnlHistory = dailyList;
    data.monthlyCalendar = generateCalendarMap(dailyList);
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
