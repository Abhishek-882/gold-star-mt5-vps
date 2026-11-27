import {
  HistoricalTrade,
  Position,
  StrategyMeta,
  StrategySlug,
} from '@/types/trading';

export const STRATEGY_CATALOG: StrategyMeta[] = [
  {
    slug: 'gold-star',
    name: 'Valen Prime',
    shortName: 'Valen Prime ★',
    tagline: 'Main Star • Flagship XAUUSD Breakout',
    symbol: 'XAUUSD',
    badge: 'MAIN STAR',
    isMainStar: true,
    magicNumbers: [224943],
    commentPrefixes: ['tgspace'],
    terminalSource: 'primary',
    description:
      'Our flagship XAUUSD Breakout Strategy with strict maximum Stop Loss per order and zero martingale. Runs dedicated on MT5 Terminal #1 and also active on MT5 Terminal #2.',
  },
  {
    slug: 'gold-scalp-x',
    name: 'Valen Edge',
    shortName: 'Valen Edge',
    tagline: 'Dual-Magic XAUUSD Precision Scalper',
    symbol: 'XAUUSD',
    badge: 'MT5 #2 DESK',
    magicNumbers: [1000, 2000],
    commentPrefixes: ['strikerx'],
    terminalSource: 'desk-5',
    description:
      'High-precision intraday XAUUSD scalping engine running dual magic lanes (1000 & 2000) on MT5 Terminal #2.',
  },
  {
    slug: 'zone3',
    name: 'Valen Triad',
    shortName: 'Valen Triad',
    tagline: '3-Preset XAUUSD Zone Matrix',
    symbol: 'XAUUSD',
    badge: 'MT5 #2 DESK',
    magicNumbers: [900000, 900200, 900300],
    commentPrefixes: ['janus'],
    terminalSource: 'desk-5',
    description:
      'Three-preset zone execution engine on XAUUSD H1 (Magic IDs 900000, 900200, 900300) running on MT5 Terminal #2.',
  },
  {
    slug: 'btc-swing-ea',
    name: 'Valen Arc',
    shortName: 'Valen Arc',
    tagline: '3-Lane BTCUSD Swing Architecture',
    symbol: 'BTCUSD',
    badge: 'MT5 #2 DESK',
    magicNumbers: [111, 222, 333],
    commentPrefixes: ['strategy', 'strat|'],
    terminalSource: 'desk-5',
    description:
      'Multi-strategy Bitcoin swing engine (Magic IDs 111, 222, 333) trading BTCUSD H1 on MT5 Terminal #2.',
  },
  {
    slug: 'expert-macd',
    name: 'Valen Pulse',
    shortName: 'Valen Pulse',
    tagline: 'XAUUSD M1 Momentum Execution',
    symbol: 'XAUUSD',
    badge: 'MT5 #2 DESK',
    magicNumbers: [900],
    commentPrefixes: ['strat|'],
    terminalSource: 'desk-5',
    description:
      'Fast M1 XAUUSD MACD momentum strategy (Magic ID 900) running on MT5 Terminal #2.',
  },
];

export function getStrategyMeta(slug: string): StrategyMeta | undefined {
  return STRATEGY_CATALOG.find((s) => s.slug === slug);
}

/**
 * Classifies a position or closed trade to its StrategySlug.
 * Priority: Magic Number (Expert ID) first -> Comment prefix + Symbol fallback.
 */
export function classifyTradeStrategy(
  trade: Pick<Position | HistoricalTrade, 'magic' | 'comment' | 'symbol'>,
  defaultSlug: StrategySlug = 'gold-star'
): StrategySlug {
  const magic = typeof trade.magic === 'number' ? trade.magic : Number(trade.magic);

  if (Number.isFinite(magic) && magic > 0) {
    if (magic === 224943 || (magic >= 224940 && magic <= 224999)) return 'gold-star';
    if (magic === 1000 || magic === 1001 || magic === 2000) return 'gold-scalp-x';
    if (magic === 900000 || magic === 900200 || magic === 900300 || magic === 90909103) return 'zone3';
    if (magic === 111 || magic === 222 || magic === 333) return 'btc-swing-ea';
    if (magic === 900) return 'expert-macd';
  }

  const comment = (trade.comment || '').trim().toLowerCase();
  const symbol = (trade.symbol || '').trim().toUpperCase();

  if (comment.startsWith('tgspace') || comment.includes('gold space')) {
    return 'gold-star';
  }
  if (comment.startsWith('strikerx')) {
    return 'gold-scalp-x';
  }
  if (comment.startsWith('janus')) {
    return 'zone3';
  }
  if (comment.startsWith('strat')) {
    return symbol.includes('BTC') ? 'btc-swing-ea' : 'expert-macd';
  }

  if (symbol.includes('BTC')) {
    return 'btc-swing-ea';
  }

  return defaultSlug;
}
