//+------------------------------------------------------------------+
//|                                           GoldStar_Exporter.mq5  |
//|               Gold Star MT5 Performance Dashboard Live Exporter  |
//|                                  Copyright 2026, Gold Star Desk  |
//+------------------------------------------------------------------+
#property copyright "Gold Star Desk"
#property link      "https://t.me/YourUsername"
#property version   "2.00"
#property description "Streams real-time account equity, balance, open gold positions AND closed deal history to the web dashboard"

//--- Inputs
input string DashboardUrl    = "http://localhost:3000/api/mt5/webhook"; // Dashboard Webhook URL
input string WebhookSecret   = "";                                      // Optional Bearer Token
input int    SyncIntervalSec = 30;                                      // Sync interval in seconds
input int    HistoryDays     = 90;                                      // Days of closed deal history to export

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("[Gold Star Exporter v2] Initialized. Streaming to: ", DashboardUrl);
   EventSetTimer(SyncIntervalSec);
   SendTelemetry(); // immediate first ping
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason) { EventKillTimer(); }
void OnTimer()                  { SendTelemetry(); }

//+------------------------------------------------------------------+
//| Build open positions JSON array (XAU/GOLD filter)               |
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
      string sym = PositionGetString(POSITION_SYMBOL);
      if(StringFind(sym, "XAU") < 0 && StringFind(sym, "GOLD") < 0 && StringFind(sym, "xau") < 0) continue;

      long   type    = PositionGetInteger(POSITION_TYPE);
      double vol     = PositionGetDouble(POSITION_VOLUME);
      double openP   = PositionGetDouble(POSITION_PRICE_OPEN);
      double currP   = PositionGetDouble(POSITION_PRICE_CURRENT);
      double sl      = PositionGetDouble(POSITION_SL);
      double tp      = PositionGetDouble(POSITION_TP);
      double profit  = PositionGetDouble(POSITION_PROFIT);
      double swap    = PositionGetDouble(POSITION_SWAP);
      datetime openT = (datetime)PositionGetInteger(POSITION_TIME);
      string dir     = (type == POSITION_TYPE_BUY) ? "BUY" : "SELL";
      double pips    = MathAbs(currP - openP) * 10;

      if(count > 0) json += ",";
      json += "{";
      json += "\"ticket\":"    + IntegerToString(ticket)      + ",";
      json += "\"symbol\":\""  + sym                          + "\",";
      json += "\"type\":\""    + dir                          + "\",";
      json += "\"lots\":"      + DoubleToString(vol, 2)       + ",";
      json += "\"openPrice\":" + DoubleToString(openP, 2)     + ",";
      json += "\"currentPrice\":" + DoubleToString(currP, 2)  + ",";
      json += "\"sl\":"        + DoubleToString(sl, 2)        + ",";
      json += "\"tp\":"        + DoubleToString(tp, 2)        + ",";
      json += "\"profit\":"    + DoubleToString(profit, 2)    + ",";
      json += "\"swap\":"      + DoubleToString(swap, 2)      + ",";
      json += "\"pips\":"      + DoubleToString(pips, 1)      + ",";
      json += "\"openTime\":\"" + TimeToString(openT, TIME_DATE|TIME_SECONDS) + "\",";
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

      // Only include OUT deals (closing deals) with actual profit
      long entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT) continue;

      string sym = HistoryDealGetString(ticket, DEAL_SYMBOL);
      // Export ALL symbols (not just gold) so dashboard shows full account history
      // Comment next line to filter gold-only: if(StringFind(sym,"XAU")<0 && StringFind(sym,"GOLD")<0) continue;

      long     dealType  = HistoryDealGetInteger(ticket, DEAL_TYPE);
      double   vol       = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      double   price     = HistoryDealGetDouble(ticket, DEAL_PRICE);
      double   profit    = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double   swap      = HistoryDealGetDouble(ticket, DEAL_SWAP);
      double   commission= HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      double   netProfit = profit + swap + commission;
      datetime closeTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      long     posId     = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      string   dir       = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";

      // Get open price from the opening deal of this position
      double openPrice = price; // fallback
      if(HistorySelectByPosition(posId))
      {
         int pDeals = HistoryDealsTotal();
         for(int j = 0; j < pDeals; j++)
         {
            ulong pt = HistoryDealGetTicket(j);
            if(HistoryDealGetInteger(pt, DEAL_ENTRY) == DEAL_ENTRY_IN)
            {
               openPrice = HistoryDealGetDouble(pt, DEAL_PRICE);
               break;
            }
         }
         HistorySelect(fromTime, TimeCurrent()); // restore full selection
      }

      if(count > 0) json += ",";
      json += "{";
      json += "\"ticket\":"     + IntegerToString(ticket)             + ",";
      json += "\"symbol\":\""   + sym                                 + "\",";
      json += "\"type\":\""     + dir                                 + "\",";
      json += "\"lots\":"       + DoubleToString(vol, 2)              + ",";
      json += "\"openPrice\":"  + DoubleToString(openPrice, 2)        + ",";
      json += "\"closePrice\":" + DoubleToString(price, 2)            + ",";
      json += "\"profit\":"     + DoubleToString(netProfit, 2)        + ",";
      json += "\"swap\":"       + DoubleToString(swap, 2)             + ",";
      json += "\"commission\":" + DoubleToString(commission, 2)       + ",";
      json += "\"closeTime\":\"" + TimeToString(closeTime, TIME_DATE|TIME_SECONDS) + "\"";
      json += "}";
      count++;
   }
   json += "]";
   return json;
}

//+------------------------------------------------------------------+
//| Main telemetry sender                                             |
//+------------------------------------------------------------------+
void SendTelemetry()
{
   double balance    = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity     = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin     = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   string company    = AccountInfoString(ACCOUNT_COMPANY);
   string server     = AccountInfoString(ACCOUNT_SERVER);
   long   login      = AccountInfoInteger(ACCOUNT_LOGIN);
   double marginLevel= (margin > 0) ? (equity / margin * 100) : 0;

   string positions = BuildPositionsJson();
   string history   = BuildHistoryJson();

   string json = "{";
   json += "\"botName\":\"Gold Star (XAUUSD Pro)\",";
   json += "\"version\":\"v4.8.2 Institutional\",";
   json += "\"timestamp\":" + IntegerToString((long)TimeCurrent()) + ",";
   json += "\"account\":{";
   json += "\"balance\":"    + DoubleToString(balance, 2)    + ",";
   json += "\"equity\":"     + DoubleToString(equity, 2)     + ",";
   json += "\"margin\":"     + DoubleToString(margin, 2)     + ",";
   json += "\"freeMargin\":" + DoubleToString(freeMargin, 2) + ",";
   json += "\"marginLevel\":" + DoubleToString(marginLevel, 2) + ",";
   json += "\"broker\":\""   + company + "\",";
   json += "\"server\":\""   + server  + "\",";
   json += "\"login\":\""    + IntegerToString(login) + "\"";
   json += "},";
   json += "\"positions\":"  + positions + ",";
   json += "\"history\":"    + history;
   json += "}";

   string headers = "Content-Type: application/json\r\n";
   if(StringLen(WebhookSecret) > 0)
      headers += "Authorization: Bearer " + WebhookSecret + "\r\n";

   char postData[], result[];
   string resultHeaders;
   StringToCharArray(json, postData, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(postData, ArraySize(postData) - 1);

   int res = WebRequest("POST", DashboardUrl, headers, 5000, postData, result, resultHeaders);
   if(res == 200)
      Print("[Gold Star Exporter v2] ✓ Synced — balance=", DoubleToString(balance,2),
            " equity=", DoubleToString(equity,2),
            " positions=", PositionsTotal(),
            " history_deals=", HistoryDealsTotal());
   else
      Print("[Gold Star Exporter v2] WebRequest error: code=", res, " err=", GetLastError(),
            " — Make sure '", DashboardUrl, "' is whitelisted in Tools→Options→Expert Advisors");
}
//+------------------------------------------------------------------+
