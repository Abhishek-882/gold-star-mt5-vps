//+------------------------------------------------------------------+
//|                                           GoldStar_Exporter.mq5  |
//|               Gold Star MT5 Performance Dashboard Live Exporter  |
//|                                  Copyright 2026, Gold Star Desk  |
//+------------------------------------------------------------------+
#property copyright "Gold Star Desk"
#property link      "https://t.me/YourUsername"
#property version   "1.00"
#property description "Streams real-time account equity, balance, and open gold positions to the web dashboard"

//--- Inputs
input string DashboardUrl   = "http://localhost:3000/api/mt5/webhook"; // Dashboard Webhook URL
input string WebhookSecret  = "";                                      // Optional Bearer Token
input int    SyncIntervalSec = 30;                                      // Sync interval in seconds

datetime lastSyncTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("[Gold Star Exporter] Initialized. Streaming to: ", DashboardUrl);
   EventSetTimer(SyncIntervalSec);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("[Gold Star Exporter] Stopped.");
}

//+------------------------------------------------------------------+
//| Timer event function                                             |
//+------------------------------------------------------------------+
void OnTimer()
{
   SendTelemetry();
}

//+------------------------------------------------------------------+
//| Compiles JSON payload and calls WebRequest                       |
//+------------------------------------------------------------------+
void SendTelemetry()
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity  = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin  = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   string company = AccountInfoString(ACCOUNT_COMPANY);
   string server  = AccountInfoString(ACCOUNT_SERVER);
   long login     = AccountInfoInteger(ACCOUNT_LOGIN);

   // Build JSON payload string
   string json = "{";
   json += "\"botName\":\"Gold Star (XAUUSD Pro)\",";
   json += "\"version\":\"v4.8.2 Institutional\",";
   json += "\"account\":{";
   json += "\"balance\":" + DoubleToString(balance, 2) + ",";
   json += "\"equity\":" + DoubleToString(equity, 2) + ",";
   json += "\"margin\":" + DoubleToString(margin, 2) + ",";
   json += "\"freeMargin\":" + DoubleToString(freeMargin, 2) + ",";
   json += "\"broker\":\"" + company + "\",";
   json += "\"server\":\"" + server + "\",";
   json += "\"login\":\"" + IntegerToString(login) + "\"";
   json += "},";

   // Collect open positions
   json += "\"positions\":[";
   int totalPositions = PositionsTotal();
   int count = 0;
   for(int i = 0; i < totalPositions; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
      {
         string sym = PositionGetString(POSITION_SYMBOL);
         if(StringFind(sym, "XAU") >= 0 || StringFind(sym, "GOLD") >= 0)
         {
            long type = PositionGetInteger(POSITION_TYPE);
            string dir = (type == POSITION_TYPE_BUY) ? "BUY" : "SELL";
            double vol = PositionGetDouble(POSITION_VOLUME);
            double openP = PositionGetDouble(POSITION_PRICE_OPEN);
            double currP = PositionGetDouble(POSITION_PRICE_CURRENT);
            double sl = PositionGetDouble(POSITION_SL);
            double tp = PositionGetDouble(POSITION_TP);
            double profit = PositionGetDouble(POSITION_PROFIT);
            datetime openT = (datetime)PositionGetInteger(POSITION_TIME);

            if(count > 0) json += ",";
            json += "{";
            json += "\"ticket\":" + IntegerToString(ticket) + ",";
            json += "\"symbol\":\"" + sym + "\",";
            json += "\"type\":\"" + dir + "\",";
            json += "\"lots\":" + DoubleToString(vol, 2) + ",";
            json += "\"openPrice\":" + DoubleToString(openP, 2) + ",";
            json += "\"currentPrice\":" + DoubleToString(currP, 2) + ",";
            json += "\"sl\":" + DoubleToString(sl, 2) + ",";
            json += "\"tp\":" + DoubleToString(tp, 2) + ",";
            json += "\"profit\":" + DoubleToString(profit, 2) + ",";
            json += "\"pips\":" + DoubleToString(MathAbs(currP - openP) * 10, 1) + ",";
            json += "\"openTime\":\"" + TimeToString(openT, TIME_DATE|TIME_SECONDS) + "\",";
            json += "\"duration\":\"Active\"";
            json += "}";
            count++;
         }
      }
   }
   json += "]}";

   // Headers
   string headers = "Content-Type: application/json\r\n";
   if(StringLen(WebhookSecret) > 0)
   {
      headers += "Authorization: Bearer " + WebhookSecret + "\r\n";
   }

   char postData[];
   char result[];
   string resultHeaders;
   StringToCharArray(json, postData, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(postData, ArraySize(postData) - 1); // remove null terminator

   int res = WebRequest("POST", DashboardUrl, headers, 3000, postData, result, resultHeaders);
   if(res == 200)
   {
      Print("[Gold Star Exporter] Successfully synced telemetry to dashboard at ", TimeToString(TimeCurrent()));
   }
   else
   {
      Print("[Gold Star Exporter] WebRequest error: code=", res, ", err=", GetLastError());
      Print("Make sure to add URL '", DashboardUrl, "' to MT5: Tools -> Options -> Expert Advisors -> Allow WebRequest for listed URL");
   }
}
//+------------------------------------------------------------------+
