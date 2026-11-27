//+------------------------------------------------------------------+
//|                                           GoldStar_Exporter.mq5  |
//|               Gold Star MT5 Performance Dashboard Live Exporter  |
//|                                  Copyright 2026, Gold Star Desk  |
//+------------------------------------------------------------------+
#property copyright "Gold Star Desk"
#property link      "https://t.me/Chinna119"
#property version   "3.01"
#property description "Streams real-time account equity, balance, open positions & closed deals (with Magic ID & Comment) across all charts on 1 MT5 terminal"

//--- Inputs
input string DashboardUrl    = "https://gold-star-mt5-vps.vercel.app/api/mt5/webhook"; // Dashboard Webhook URL
input string WebhookSecret   = "goldstar-vantage-mt5-secret-2026";                      // Bearer Token
input string TerminalId      = "primary";                                               // Terminal ID ("primary" or "desk-5")
input int    SyncIntervalSec = 30;                                                      // Sync interval in seconds
input int    HistoryDays     = 90;                                                      // Days of closed deal history to export
input int    MaxHistoryDeals = 250;                                                     // Max recent closed deals per sync

struct ClosedDealRec
{
   ulong    ticket;
   long     posId;
   string   symbol;
   string   dir;
   double   lots;
   double   openPrice;
   double   closePrice;
   double   netProfit;
   double   swap;
   double   commission;
   long     magic;
   string   comment;
   datetime closeTime;
};

//+------------------------------------------------------------------+
//| Escape strings safely for JSON                                   |
//+------------------------------------------------------------------+
string JsonEscape(string s)
{
   StringReplace(s, "\\", "\\\\");
   StringReplace(s, "\"", "\\\"");
   StringReplace(s, "\r", "");
   StringReplace(s, "\n", " ");
   StringReplace(s, "\t", " ");
   return s;
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("[Gold Star Exporter v3.01] TerminalId=", TerminalId, " Streaming to: ", DashboardUrl);
   EventSetTimer(MathMax(5, SyncIntervalSec));
   SendTelemetry();
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason) { EventKillTimer(); }
void OnTimer()                  { SendTelemetry(); }

//+------------------------------------------------------------------+
//| Build open positions JSON array (all symbols, with Magic+Comment)|
//+------------------------------------------------------------------+
string BuildPositionsJson()
{
   string json = "[";
   int total = PositionsTotal();
   int count = 0;
   for(int i = 0; i < total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;

      string sym     = PositionGetString(POSITION_SYMBOL);
      long   type    = PositionGetInteger(POSITION_TYPE);
      long   magic   = PositionGetInteger(POSITION_MAGIC);
      string comment = PositionGetString(POSITION_COMMENT);
      double vol     = PositionGetDouble(POSITION_VOLUME);
      double openP   = PositionGetDouble(POSITION_PRICE_OPEN);
      double currP   = PositionGetDouble(POSITION_PRICE_CURRENT);
      double sl      = PositionGetDouble(POSITION_SL);
      double tp      = PositionGetDouble(POSITION_TP);
      double profit  = PositionGetDouble(POSITION_PROFIT);
      double swap    = PositionGetDouble(POSITION_SWAP);
      datetime openT = (datetime)PositionGetInteger(POSITION_TIME);
      string dir     = (type == POSITION_TYPE_BUY) ? "BUY" : "SELL";
      double pips    = MathAbs(currP - openP) * (StringFind(sym, "BTC") >= 0 ? 1.0 : 10.0);

      if(count > 0) json += ",";
      json += "{";
      json += "\"ticket\":"       + IntegerToString(ticket)       + ",";
      json += "\"symbol\":\""     + JsonEscape(sym)               + "\",";
      json += "\"type\":\""       + dir                           + "\",";
      json += "\"lots\":"         + DoubleToString(vol, 2)        + ",";
      json += "\"openPrice\":"    + DoubleToString(openP, 2)      + ",";
      json += "\"currentPrice\":" + DoubleToString(currP, 2)      + ",";
      json += "\"sl\":"           + DoubleToString(sl, 2)         + ",";
      json += "\"tp\":"           + DoubleToString(tp, 2)         + ",";
      json += "\"profit\":"       + DoubleToString(profit, 2)     + ",";
      json += "\"swap\":"         + DoubleToString(swap, 2)       + ",";
      json += "\"pips\":"         + DoubleToString(pips, 1)       + ",";
      json += "\"magic\":"        + IntegerToString(magic)        + ",";
      json += "\"comment\":\""    + JsonEscape(comment)           + "\",";
      json += "\"openTime\":\""   + TimeToString(openT, TIME_DATE|TIME_SECONDS) + "\",";
      json += "\"duration\":\"Active\"";
      json += "}";
      count++;
   }
   json += "]";
   return json;
}

//+------------------------------------------------------------------+
//| Build closed deals JSON array from MT5 history (single-pass O(N))|
//+------------------------------------------------------------------+
string BuildHistoryJson()
{
   datetime nowTime  = TimeCurrent();
   datetime fromTime = nowTime - (datetime)(HistoryDays * 86400);
   if(!HistorySelect(fromTime, nowTime)) return "[]";

   int total = HistoryDealsTotal();
   if(total <= 0) return "[]";

   ClosedDealRec deals[];
   int maxCap = MathMax(10, MaxHistoryDeals);
   ArrayResize(deals, maxCap);
   int count = 0;

   // Pass 1: Walk backwards from newest to oldest to collect up to MaxHistoryDeals OUT deals
   for(int i = total - 1; i >= 0 && count < maxCap; i--)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0) continue;

      long entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT) continue;

      long   dealType   = HistoryDealGetInteger(ticket, DEAL_TYPE);
      double profit     = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double swap       = HistoryDealGetDouble(ticket, DEAL_SWAP);
      double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      double price      = HistoryDealGetDouble(ticket, DEAL_PRICE);

      deals[count].ticket     = ticket;
      deals[count].posId      = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      deals[count].symbol     = HistoryDealGetString(ticket, DEAL_SYMBOL);
      deals[count].dir        = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";
      deals[count].lots       = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      deals[count].openPrice  = price;
      deals[count].closePrice = price;
      deals[count].netProfit  = profit + swap + commission;
      deals[count].swap       = swap;
      deals[count].commission = commission;
      deals[count].magic      = HistoryDealGetInteger(ticket, DEAL_MAGIC);
      deals[count].comment    = HistoryDealGetString(ticket, DEAL_COMMENT);
      deals[count].closeTime  = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      count++;
   }

   if(count == 0) return "[]";

   // Pass 2: Match opening DEAL_ENTRY_IN deals from the same HistorySelect cache (no extra HistorySelect calls)
   for(int i = total - 1; i >= 0; i--)
   {
      ulong pt = HistoryDealGetTicket(i);
      if(pt == 0) continue;
      if(HistoryDealGetInteger(pt, DEAL_ENTRY) != DEAL_ENTRY_IN) continue;

      long posId = HistoryDealGetInteger(pt, DEAL_POSITION_ID);
      if(posId <= 0) continue;

      for(int k = 0; k < count; k++)
      {
         if(deals[k].posId == posId)
         {
            deals[k].openPrice = HistoryDealGetDouble(pt, DEAL_PRICE);
            long   inMagic     = HistoryDealGetInteger(pt, DEAL_MAGIC);
            string inComment   = HistoryDealGetString(pt, DEAL_COMMENT);
            if(inMagic > 0) deals[k].magic = inMagic;
            if(StringLen(inComment) > 0) deals[k].comment = inComment;
         }
      }
   }

   string json = "[";
   for(int k = 0; k < count; k++)
   {
      if(k > 0) json += ",";
      json += "{";
      json += "\"ticket\":"     + IntegerToString(deals[k].ticket)         + ",";
      json += "\"symbol\":\""   + JsonEscape(deals[k].symbol)              + "\",";
      json += "\"type\":\""     + deals[k].dir                             + "\",";
      json += "\"lots\":"       + DoubleToString(deals[k].lots, 2)         + ",";
      json += "\"openPrice\":"  + DoubleToString(deals[k].openPrice, 2)    + ",";
      json += "\"closePrice\":" + DoubleToString(deals[k].closePrice, 2)   + ",";
      json += "\"profit\":"     + DoubleToString(deals[k].netProfit, 2)    + ",";
      json += "\"swap\":"       + DoubleToString(deals[k].swap, 2)         + ",";
      json += "\"commission\":" + DoubleToString(deals[k].commission, 2)   + ",";
      json += "\"magic\":"      + IntegerToString(deals[k].magic)          + ",";
      json += "\"comment\":\""  + JsonEscape(deals[k].comment)             + "\",";
      json += "\"closeTime\":\"" + TimeToString(deals[k].closeTime, TIME_DATE|TIME_SECONDS) + "\"";
      json += "}";
   }
   json += "]";
   return json;
}

//+------------------------------------------------------------------+
//| Main telemetry sender                                            |
//+------------------------------------------------------------------+
void SendTelemetry()
{
   double balance    = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity     = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin     = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double marginLvl  = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
   double floatPnl   = AccountInfoDouble(ACCOUNT_PROFIT);

   string broker = AccountInfoString(ACCOUNT_COMPANY);
   string server = AccountInfoString(ACCOUNT_SERVER);
   long   accNum = AccountInfoInteger(ACCOUNT_LOGIN);
   string accStr = IntegerToString(accNum);
   if(StringLen(accStr) > 4)
      accStr = StringSubstr(accStr, 0, 2) + "****" + StringSubstr(accStr, StringLen(accStr) - 2);

   string tid = TerminalId;
   StringTrimLeft(tid);
   StringTrimRight(tid);
   StringToLower(tid);
   if(StringLen(tid) == 0) tid = "primary";

   string posJson  = BuildPositionsJson();
   string histJson = BuildHistoryJson();

   string payload = "{";
   payload += "\"terminalId\":\"" + JsonEscape(tid)               + "\",";
   payload += "\"balance\":"      + DoubleToString(balance, 2)    + ",";
   payload += "\"equity\":"       + DoubleToString(equity, 2)     + ",";
   payload += "\"floatingPnl\":"  + DoubleToString(floatPnl, 2)   + ",";
   payload += "\"margin\":"       + DoubleToString(margin, 2)     + ",";
   payload += "\"freeMargin\":"   + DoubleToString(freeMargin, 2) + ",";
   payload += "\"marginLevel\":"  + DoubleToString(marginLvl, 2)  + ",";
   payload += "\"broker\":\""     + JsonEscape(broker)            + "\",";
   payload += "\"server\":\""     + JsonEscape(server)            + "\",";
   payload += "\"accountNumber\":\"" + accStr                     + "\",";
   payload += "\"symbol\":\"Multi-Asset (XAUUSD / BTCUSD)\",";
   payload += "\"openPositions\":" + posJson  + ",";
   payload += "\"closedTrades\":"  + histJson;
   payload += "}";

   char   post[];
   char   result[];
   string headers = "Content-Type: application/json\r\n";
   if(StringLen(WebhookSecret) > 0)
      headers += "Authorization: Bearer " + WebhookSecret + "\r\n";

   int utf8Len = StringToCharArray(payload, post, 0, WHOLE_ARRAY, CP_UTF8);
   if(utf8Len > 0) ArrayResize(post, utf8Len - 1);

   string resHeaders;
   ResetLastError();
   int res = WebRequest("POST", DashboardUrl, headers, 10000, post, result, resHeaders);
   if(res == 200)
   {
      Print("[Gold Star Exporter v3.01] Sync OK (", tid, "). Balance: $", DoubleToString(balance, 2), " Equity: $", DoubleToString(equity, 2));
   }
   else
   {
      int err = GetLastError();
      string body = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
      Print("[Gold Star Exporter v3.01] Sync failed! HTTP ", res, " Err=", err, " Body=", body);
      if(err == 4014)
         Print("[Gold Star Exporter v3.01] FIX: In MT5 go to Tools -> Options -> Expert Advisors -> check 'Allow WebRequest for listed URL' and add: https://gold-star-mt5-vps.vercel.app");
   }
}
//+------------------------------------------------------------------+
