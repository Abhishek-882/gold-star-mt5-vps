export type Language = 'en' | 'te';

export interface Translations {
  brand: string;
  subtitle: string;
  liveBadge: string;
  pausedBadge: string;
  verifiedInvestor: string;
  lastUpdated: string;
  liveFeedPaused: string;
  reconnectNotice: string;
  demoModeNotice: string;
  configSettings: string;
  
  // KPIs
  todayPnl: string;
  weekPnl: string;
  monthPnl: string;
  totalGrowth: string;
  winRate: string;
  totalTrades: string;
  profitFactor: string;
  maxDrawdown: string;
  balance: string;
  equity: string;
  floatingPnl: string;
  closedPnl: string;
  deposits: string;
  withdrawals: string;
  
  // Charts
  equityCurveTitle: string;
  equityCurveDesc: string;
  filterToday: string;
  filter7D: string;
  filter30D: string;
  filterAllTime: string;
  dailyPnlTitle: string;
  dailyPnlDesc: string;
  
  // Tables
  openTradesTitle: string;
  openTradesDesc: string;
  closedTradesTitle: string;
  closedTradesDesc: string;
  noOpenTrades: string;
  ticket: string;
  symbol: string;
  type: string;
  lot: string;
  entry: string;
  currentPrice: string;
  closePrice: string;
  profit: string;
  duration: string;
  openTime: string;
  closeTime: string;
  searchPlaceholder: string;
  filterAll: string;
  downloadCsv: string;
  
  // Calendar
  calendarTitle: string;
  calendarDesc: string;
  monthlyNetProfit: string;
  winningDays: string;
  losingDays: string;
  
  // Bot Status
  botStatusTitle: string;
  botStatusDesc: string;
  botName: string;
  status: string;
  broker: string;
  server: string;
  timeframe: string;
  version: string;
  strategy: string;
  riskModel: string;
  
  // Conversion / Contact
  ctaTitle: string;
  ctaSubtitle: string;
  telegramBtn: string;
  whatsappBtn: string;
  instagramBtn: string;
  requestDemoTitle: string;
  requestDemoDesc: string;
  nameLabel: string;
  phoneLabel: string;
  capitalLabel: string;
  requestDemoSubmit: string;
  demoSuccessTitle: string;
  demoSuccessMsg: string;
  
  // FAQs
  faqTitle: string;
  faqSubtitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  faq5Q: string;
  faq5A: string;
  
  // Compliance
  disclaimerTitle: string;
  disclaimerText: string;
  complianceWarning: string;
  verifiedAuditNotice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brand: "GOLD STAR - MT5",
    subtitle: "Real-Time Institutional XAUUSD Algorithmic Execution Telemetry",
    liveBadge: "LIVE MT5 FEED",
    pausedBadge: "FEED PAUSED",
    verifiedInvestor: "Verified Investor Password (Read-Only)",
    lastUpdated: "Last Synced",
    liveFeedPaused: "Live Data Paused - Last Updated:",
    reconnectNotice: "MT5 terminal or bridge disconnected. Auto-retrying every 15s...",
    demoModeNotice: "Demo / Simulation Mode Active. Connect live MT5 account in Settings.",
    configSettings: "Connect MT5 / Settings",
    
    // KPIs
    todayPnl: "Today's PnL",
    weekPnl: "This Week PnL",
    monthPnl: "This Month PnL",
    totalGrowth: "Total Growth",
    winRate: "Win Rate",
    totalTrades: "Total Trades",
    profitFactor: "Profit Factor",
    maxDrawdown: "Max Drawdown",
    balance: "Account Balance",
    equity: "Live Equity",
    floatingPnl: "Floating PnL",
    closedPnl: "Realized PnL",
    deposits: "Total Deposit",
    withdrawals: "Total Withdrawal",
    
    // Charts
    equityCurveTitle: "Live Equity & Growth Curve",
    equityCurveDesc: "Continuous net asset value progression with fixed stop-loss adherence",
    filterToday: "Today",
    filter7D: "7 Days",
    filter30D: "30 Days",
    filterAllTime: "All Time",
    dailyPnlTitle: "Daily Net Realized PnL",
    dailyPnlDesc: "Last 30 trading sessions (Green = Profit, Red = Loss)",
    
    // Tables
    openTradesTitle: "Live Active Positions",
    openTradesDesc: "Real-time floating market exposure monitored on MT5 server",
    closedTradesTitle: "Audited Closed Trade Ledger",
    closedTradesDesc: "Historical order executions, durations, and net profit results",
    noOpenTrades: "No open positions currently active. Bot waiting for next institutional entry setup.",
    ticket: "Ticket #",
    symbol: "Symbol",
    type: "Direction",
    lot: "Lot Size",
    entry: "Entry Price",
    currentPrice: "Current Price",
    closePrice: "Exit Price",
    profit: "Net Profit ($)",
    duration: "Duration",
    openTime: "Open Time",
    closeTime: "Closed Time",
    searchPlaceholder: "Search ticket or date...",
    filterAll: "All Orders",
    downloadCsv: "Export CSV",
    
    // Calendar
    calendarTitle: "Performance Calendar",
    calendarDesc: "Day-by-day PnL distribution matching institutional Myfxbook audit standards",
    monthlyNetProfit: "Monthly Net Return",
    winningDays: "Profitable Days",
    losingDays: "Loss Days",
    
    // Bot Status
    botStatusTitle: "Bot Architecture & Runtime Telemetry",
    botStatusDesc: "Cryptographically verified read-only MT5 account metadata",
    botName: "Algorithm Name",
    status: "Execution Status",
    broker: "Broker Entity",
    server: "MT5 Server",
    timeframe: "Execution TF",
    version: "Engine Version",
    strategy: "Core Strategy",
    riskModel: "Risk Governance",
    
    // Conversion / Contact
    ctaTitle: "Want Gold Star Bot For Your MT5 Account?",
    ctaSubtitle: "Connect directly to our verified algorithmic trading setup. Fully automated, strict Stop Loss on every single position, zero dangerous martingale, zero grid.",
    telegramBtn: "Telegram Channel",
    whatsappBtn: "WhatsApp Direct",
    instagramBtn: "Instagram Page",
    requestDemoTitle: "Request Free Demo Access & Performance Pass",
    requestDemoDesc: "Submit your details below to receive read-only investor credentials and speak directly with our quantitative desk.",
    nameLabel: "Your Full Name",
    phoneLabel: "WhatsApp / Mobile Number",
    capitalLabel: "Planned Trading Capital",
    requestDemoSubmit: "Request Free Demo Access via WhatsApp",
    demoSuccessTitle: "Request Prepared!",
    demoSuccessMsg: "Redirecting to WhatsApp with your personalized demo invitation...",
    
    // FAQs
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Transparent answers regarding broker compatibility, risk, and deployment",
    faq1Q: "What is the minimum recommended capital to run Gold Star?",
    faq1A: "The minimum capital to run Gold Star with safe risk management (0.01 lot per $500) is $500. For optimal margin and institutional drawdown buffer, $1,000 to $5,000 is recommended.",
    faq2Q: "Which broker is required or recommended?",
    faq2A: "Any MT5 broker supporting raw spread / ECN accounts on XAUUSD (Gold) with low commission. Recommended brokers include Exness Pro/Raw, IC Markets Raw Spread, or Pepperstone Razor.",
    faq3Q: "Is a Virtual Private Server (VPS) required?",
    faq3A: "Yes. Gold Star trades 24/5 on London and New York liquidity sessions with sub-millisecond execution. A low-latency Forex VPS (London or New York location, <5ms ping) ensures zero missed trades.",
    faq4Q: "Does Gold Star use Grid, Hedging, or Martingale?",
    faq4A: "Strictly NO. Gold Star is an institutional momentum and mean-reversion algorithm. Every single position is deployed with a pre-calculated hard Stop Loss (typically 25-45 pips) and dynamic profit trailing. It never doubles down on losing trades.",
    faq5Q: "Can I inspect the live investor password before purchasing?",
    faq5A: "Yes, 100%. Contact us via WhatsApp or Telegram and our team will provide real read-only MT5 investor login credentials so you can verify trades directly inside your own MetaTrader 5 terminal.",
    
    // Compliance
    disclaimerTitle: "Regulatory Disclaimer & Risk Disclosure",
    disclaimerText: "Past performance is not indicative of future results. Trading foreign exchange and spot gold (XAUUSD) on margin carries a high level of risk and may not be suitable for all investors. High leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. Only trade with money you can afford to lose. No claims of guaranteed profit or risk-free returns are made.",
    complianceWarning: "High-Risk Asset Warning: Spot Gold (XAUUSD) possesses elevated intraday volatility during Tier-1 macroeconomic news releases (CPI, FOMC, NFP). Risk filters halt algorithmic entry during high-impact slippage windows.",
    verifiedAuditNotice: "Live data streamed directly from MetaTrader 5 Investor Read-Only feed. Execution orders are verified against broker tick logs."
  },
  te: {
    brand: "గోల్డ్ స్టార్ - MT5",
    subtitle: "నిజ సమయ ఇన్‌స్టిట్యూషనల్ XAUUSD అల్గారిథమిక్ ట్రేడింగ్ పనితీరు",
    liveBadge: "లైవ్ MT5 ఫీడ్",
    pausedBadge: "ఫీడ్ ఆగింది",
    verifiedInvestor: "ధృవీకరించబడిన ఇన్వెస్టర్ పాస్‌వర్డ్ (రీడ్-ఓన్లీ)",
    lastUpdated: "చివరి అప్‌డేట్",
    liveFeedPaused: "లైవ్ డేటా తాత్కాలికంగా ఆగింది - చివరి అప్‌డేట్:",
    reconnectNotice: "MT5 టెర్మినల్ లేదా బ్రిడ్జ్ డిస్‌కనెక్ట్ అయింది. 15 సెకన్లలో పునఃప్రయత్నిస్తోంది...",
    demoModeNotice: "డెమో / సిమ్యులేషన్ మోడ్ యాక్టివ్‌గా ఉంది. సెట్టింగ్స్‌లో మీ లైవ్ MT5ని కనెక్ట్ చేయండి.",
    configSettings: "MT5 కనెక్ట్ / సెట్టింగ్స్",
    
    // KPIs
    todayPnl: "ఈరోజు లాభం/నష్టం",
    weekPnl: "ఈ వారం లాభం",
    monthPnl: "ఈ నెల లాభం",
    totalGrowth: "మొత్తం వృద్ధి",
    winRate: "గెలుపు శాతం (Win Rate)",
    totalTrades: "మొత్తం ట్రేడ్‌లు",
    profitFactor: "ప్రాఫిట్ ఫ్యాక్టర్",
    maxDrawdown: "గరిష్ట నష్ట పరిమితి (DD)",
    balance: "ఖాతా బ్యాలెన్స్",
    equity: "లైవ్ ఈక్విటీ",
    floatingPnl: "రన్నింగ్ PnL",
    closedPnl: "పూర్తయిన లాభం",
    deposits: "మొత్తం డిపాజిట్",
    withdrawals: "విత్‌డ్రాయల్స్",
    
    // Charts
    equityCurveTitle: "లైవ్ ఈక్విటీ & గ్రోత్ కర్వ్",
    equityCurveDesc: "ఖచ్చితమైన స్టాప్ లాస్ నియమంతో నిరంతర ఆస్తి వృద్ధి",
    filterToday: "ఈరోజు",
    filter7D: "7 రోజులు",
    filter30D: "30 రోజులు",
    filterAllTime: "మొత్తం",
    dailyPnlTitle: "రోజువారీ నికర లాభం (PnL)",
    dailyPnlDesc: "గత 30 ట్రేడింగ్ సెషన్లు (ఆకుపచ్చ = లాభం, ఎరుపు = నష్టం)",
    
    // Tables
    openTradesTitle: "ప్రస్తుత లైవ్ ఓపెన్ ట్రేడ్‌లు",
    openTradesDesc: "MT5 సర్వర్‌లో యాక్టివ్‌గా ఉన్న గోల్డ్ ట్రేడ్‌లు",
    closedTradesTitle: "ముగిసిన ట్రేడ్‌ల చరిత్ర",
    closedTradesDesc: "గత ట్రేడ్ల వివరాలు, సమయం మరియు నికర లాభం",
    noOpenTrades: "ప్రస్తుతం ఏవీ ఓపెన్ ట్రేడ్లు లేవు. బోట్ తదుపరి ఉత్తమ ఎంట్రీ కోసం వేచి ఉంది.",
    ticket: "టికెట్ #",
    symbol: "సింబల్",
    type: "దిశ (Buy/Sell)",
    lot: "లాట్ సైజు",
    entry: "ఎంట్రీ ధర",
    currentPrice: "లైవ్ ధర",
    closePrice: "ఎగ్జిట్ ధర",
    profit: "నికర లాభం ($)",
    duration: "సమయం",
    openTime: "ఓపెన్ సమయం",
    closeTime: "ముగిసిన సమయం",
    searchPlaceholder: "టికెట్ లేదా తేదీ శోధించండి...",
    filterAll: "అన్ని ఆర్డర్లు",
    downloadCsv: "CSV డౌన్‌లోడ్",
    
    // Calendar
    calendarTitle: "పనితీరు క్యాలెండర్ (Myfxbook స్టైల్)",
    calendarDesc: "రోజువారీ లాభనష్టాల క్యాలెండర్ రికార్డు",
    monthlyNetProfit: "నెల నికర లాభం",
    winningDays: "లాభపడిన రోజులు",
    losingDays: "నష్టపోయిన రోజులు",
    
    // Bot Status
    botStatusTitle: "బోట్ వివరాలు & రన్‌టైమ్ సమాచారం",
    botStatusDesc: "MT5 రీడ్-ఓన్లీ ఖాతా ధృవీకరణ వివరాలు",
    botName: "అల్గారిథమ్ పేరు",
    status: "పనితీరు స్థితి",
    broker: "బ్రోకర్",
    server: "MT5 సర్వర్",
    timeframe: "టైమ్‌ఫ్రేమ్",
    version: "బోట్ వెర్షన్",
    strategy: "ట్రేడింగ్ వ్యూహం",
    riskModel: "రిస్క్ మోడల్",
    
    // Conversion / Contact
    ctaTitle: "మీ MT5 ఖాతాలో గోల్డ్ స్టార్ బోట్ కావాలా?",
    ctaSubtitle: "మా ఇన్‌స్టిట్యూషనల్ గోల్డ్ ట్రేడింగ్ బోట్‌ను మీ ఖాతాకు కనెక్ట్ చేసుకోండి. 100% ఆటోమేటెడ్, ప్రతి ట్రేడ్‌కు ఖచ్చితమైన స్టాప్ లాస్, ప్రమాదకరమైన మార్టింగేల్ లేదు.",
    telegramBtn: "టెలిగ్రామ్ ఛానెల్",
    whatsappBtn: "వాట్సాప్ మెసేజ్",
    instagramBtn: "ఇన్‌స్టాగ్రామ్ పేజీ",
    requestDemoTitle: "ఉచిత డెమో యాక్సెస్ & ఇన్వెస్టర్ పాస్‌వర్డ్ పొందండి",
    requestDemoDesc: "కింద మీ వివరాలను సమర్పించండి, మా టీమ్ మీకు లైవ్ ఇన్వెస్టర్ పాస్‌వర్డ్ పంపుతుంది.",
    nameLabel: "మీ పూర్తి పేరు",
    phoneLabel: "వాట్సాప్ / మొబైల్ నంబర్",
    capitalLabel: "మీ ఇన్వెస్ట్‌మెంట్ క్యాపిటల్",
    requestDemoSubmit: "వాట్సాప్ ద్వారా ఉచిత డెమో అడగండి",
    demoSuccessTitle: "రిక్వెస్ట్ సిద్ధమైంది!",
    demoSuccessMsg: "మీ డెమో రిక్వెస్ట్‌తో వాట్సాప్‌కి మళ్లిస్తోంది...",
    
    // FAQs
    faqTitle: "తరచుగా అడిగే ప్రశ్నలు (FAQs)",
    faqSubtitle: "బ్రోకర్, పెట్టుబడి మరియు రిస్క్ నిర్వహణ గురించిన వివరాలు",
    faq1Q: "గోల్డ్ స్టార్ బోట్ రన్ చేయడానికి కనీస పెట్టుబడి ఎంత?",
    faq1A: "సురక్షిత రిస్క్ నిర్వహణతో రన్ చేయడానికి కనీస పెట్టుబడి $500. ఉత్తమ ఫలితాలు మరియు తక్కువ డ్రాడౌన్ కోసం $1,000 నుండి $5,000 సిఫార్సు చేయబడింది.",
    faq2Q: "ఏ బ్రోకర్ ఖాతా ఉపయోగించాలి?",
    faq2A: "XAUUSD (గోల్డ్) పై తక్కువ స్ప్రెడ్స్ అందించే ఏదైనా MT5 బ్రోకర్ (Exness Raw, IC Markets Raw, Pepperstone మొదలైనవి) అనుకూలం.",
    faq3Q: "VPS (వర్చువల్ ప్రైవేట్ సర్వర్) తప్పనిసరిగా కావాలా?",
    faq3A: "అవును. గోల్డ్ స్టార్ లండన్ మరియు న్యూయార్క్ మార్కెట్లలో 24/5 నిరంతరం పనిచేస్తుంది. ఇంటర్నెట్ అంతరాయం లేకుండా ఉండటానికి తక్కువ లేటెన్సీ ఫారెక్స్ VPS అవసరం.",
    faq4Q: "ఈ బోట్ గ్రిడ్ లేదా మార్టింగేల్ ఉపయోగిస్తుందా?",
    faq4A: "ఖచ్చితంగా లేదు. గోల్డ్ స్టార్ ప్రతి ఆర్డర్‌కు కఠినమైన స్టాప్ లాస్ (SL) పెడుతుంది. ఎట్టి పరిస్థితుల్లోనూ నష్టాల్లో ఉన్నప్పుడు లాట్ సైజును పెంచే మార్టింగేల్ పద్ధతిని వాడదు.",
    faq5Q: "కొనుగోలు చేయడానికి ముందు నేను లైవ్ ఇన్వెస్టర్ పాస్‌వర్డ్ చూడవచ్చా?",
    faq5A: "తప్పకుండా! వాట్సాప్ లేదా టెలిగ్రామ్‌లో మమ్మల్ని సంప్రదించండి. మీ స్వంత MT5 టెర్మినల్‌లో లాగిన్ అయి లైవ్ ట్రేడ్లను నేరుగా చూసుకోవడానికి రీడ్-ఓన్లీ ఇన్వెస్టర్ పాస్‌వర్డ్ ఇస్తాము.",
    
    // Compliance
    disclaimerTitle: "రెగ్యులేటరీ డిస్క్లైమర్ & రిస్క్ హెచ్చరిక",
    disclaimerText: "గత పనితీరు భవిష్యత్ ఫలితాలకు హామీ కాదు. ఫారెక్స్ మరియు స్పాట్ గోల్డ్ (XAUUSD) ట్రేడింగ్‌లో గణనీయమైన నష్ట భయం ఉంటుంది. మీరు నష్టాన్ని భరించగలిగే మొత్తంతో మాత్రమే ట్రేడ్ చేయండి. ఎటువంటి గ్యారెంటీ లాభాల వాగ్దానాలు చేయబడవు.",
    complianceWarning: "అధిక రిస్క్ హెచ్చరిక: ప్రధాన ఆర్థిక వార్తల సమయంలో గోల్డ్ మార్కెట్లో తీవ్రమైన ఒడిదుడుకులు ఉంటాయి. మా రిస్క్ ఫిల్టర్లు స్లిప్పేజ్ సమయంలో ఆర్డర్లను నియంత్రిస్తాయి.",
    verifiedAuditNotice: "లైవ్ డేటా నేరుగా MetaTrader 5 ఇన్వెస్టర్ రీడ్-ఓన్లీ ఫీడ్ ద్వారా ప్రసారం చేయబడుతోంది."
  }
};
