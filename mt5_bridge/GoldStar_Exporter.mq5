//+------------------------------------------------------------------+
//|                                           GoldStar_Exporter.mq5  |
//|               Gold Star MT5 Performance Dashboard Live Exporter  |
//|                                  Copyright 2026, Gold Star Desk  |
//+------------------------------------------------------------------+
#property copyright "Gold Star Desk"
#property link      "https://t.me/Chinna119"
#property version   "3.00"
#property description "Streams real-time account equity, balance, open positions & closed deals (with Magic ID & Comment) across all charts on 1 MT5 terminal"

//--- Inputs
input string DashboardUrl    = "https://gold-star-mt5-vps.vercel.app/api/mt5/webhook"; // Dashboard Webhook URL
input string WebhookSecret   = "goldstar-vantage-mt5-secret-2026";                      // Optional Bearer Token
input string TerminalId      = "primary";                                               // Terminal ID ("primary" or "desk-5")
input int    SyncIntervalSec = 30;                                                      // Sync interval in seconds
input int    HistoryDays     = 90;                                                      // Days of closed deal history to export

//+------------------------------------------------------------------+
//| Escape strings safely for JSON                                   |
//+------------------------------------------------------------------+
string JsonEscape(string s)
{
   StringReplace(s, "\\", "\\\\");
   StringReplace(s, "\"", "\\\"");
   StringReplace(s, "\r", "");
   StringReplace(s, "\n", " ");
   return s;
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("[Gold Star Exporter v3] TerminalId=", TerminalId, " Streaming to: ", DashboardUrl);
   EventSetTimer(SyncIntervalSec);
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
//| Build closed deals JSON array from MT5 history                   |
//+------------------------------------------------------------------+
string BuildHistoryJson()
{
   datetime fromTime = TimeCurrent() - (datetime)(HistoryDays * 86400);
   if(!HistorySelect(fromTime, TimeCurrent())) return "[]";

   string json = "[";
   int total = HistoryDealsTotal();
   int count = 0;

   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0) continue;

      long entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT) continue;

      string sym        = HistoryDealGetString(ticket, DEAL_SYMBOL);
      long   dealType   = HistoryDealGetInteger(ticket, DEAL_TYPE);
      long   magic      = HistoryDealGetInteger(ticket, DEAL_MAGIC);
      string comment    = HistoryDealGetString(ticket, DEAL_COMMENT);
      double vol        = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      double price      = HistoryDealGetDouble(ticket, DEAL_PRICE);
      double profit     = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double swap       = HistoryDealGetDouble(ticket, DEAL_SWAP);
      double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      double netProfit  = profit + swap + commission;
      datetime closeTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      long   posId      = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      string dir        = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";

      // Capture opening price, magic & original EA comment from DEAL_ENTRY_IN
      // (closing deal comments often get replaced with "[sl ...]" or "[tp ...]")
      double openPrice = price;
      if(HistorySelectByPosition(posId))
      {
         int pDeals = HistoryDealsTotal();
         for(int j = 0; j < pDeals; j++)
         {
            ulong pt = HistoryDealGetTicket(j);
            if(HistoryDealGetInteger(pt, DEAL_ENTRY) == DEAL_ENTRY_IN)
            {
               openPrice = HistoryDealGetDouble(pt, DEAL_PRICE);
               long inMagic = HistoryDealGetInteger(pt, DEAL_MAGIC);
               string inComment = HistoryDealGetString(pt, DEAL_COMMENT);
               if(inMagic > 0) magic = inMagic;
               if(StringLen(inComment) > 0) comment = inComment;
               break;
            }
         }
         HistorySelect(fromTime, TimeCurrent());
      }

      if(count > 0) json += ",";
      json += "{";
      json += "\"ticket\":"     + IntegerToString(ticket)          + ",";
      json += "\"symbol\":\""   + JsonEscape(sym)                  + "\",";
      json += "\"type\":\""     + dir                              + "\",";
      json += "\"lots\":"       + DoubleToString(vol, 2)           + ",";
      json += "\"openPrice\":"  + DoubleToString(openPrice, 2)     + ",";
      json += "\"closePrice\":" + DoubleToString(price, 2)         + ",";
      json += "\"profit\":"     + DoubleToString(netProfit, 2)     + ",";
      json += "\"swap\":"       + DoubleToString(swap, 2)          + ",";
      json += "\"commission\":" + DoubleToString(commission, 2)    + ",";
      json += "\"magic\":"      + IntegerToString(magic)           + ",";
      json += "\"comment\":\""  + JsonEscape(comment)              + "\",";
      json += "\"closeTime\":\"" + TimeToString(closeTime, TIME_DATE|TIME_SECONDS) + "\"";
      json += "}";
      count++;
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

   string posJson  = BuildPositionsJson();
   string histJson = BuildHistoryJson();

   string payload = "{";
   payload += "\"terminalId\":\"" + JsonEscape(TerminalId)    + "\",";
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

   StringToCharArray(payload, post, 0, StringLen(payload), CP_UTF8);
   ArrayResize(post, ArraySize(post) - 1);

   string resHeaders;
   int res = WebRequest("POST", DashboardUrl, headers, 10000, post, result, resHeaders);
   if(res == 200)
      Print("[Gold Star Exporter v3] Sync OK (", TerminalId, "). Balance: $", DoubleToString(balance, 2), " Equity: $", DoubleToString(equity, 2));
   else
      Print("[Gold Star Exporter v3] Sync failed! HTTP ", res, " Err=", GetLastError());
}
//+------------------------------------------------------------------+
