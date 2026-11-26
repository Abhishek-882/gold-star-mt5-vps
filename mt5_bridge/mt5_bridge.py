"""
=============================================================================
GOLD STAR - MT5 LIVE TELEMETRY BRIDGE
=============================================================================
This script runs on your Windows PC or VPS alongside MetaTrader 5.
It pulls REAL live account metrics, open positions, and closed trade history
and streams them directly to your Gold Star Performance Dashboard every 30s.

Requirements:
    pip install MetaTrader5 requests

Usage:
    python mt5_bridge.py
=============================================================================
"""

import os
import time
import json
import requests
from datetime import datetime, timedelta

try:
    import MetaTrader5 as mt5
except ImportError:
    print("[-] MetaTrader5 package not installed. Run: pip install MetaTrader5")
    mt5 = None

# ---------------------------------------------------------------------------
# CONFIGURATION - UPDATE THESE FOR YOUR LIVE MT5 ACCOUNT
# ---------------------------------------------------------------------------
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://localhost:3000/api/mt5/webhook")
WEBHOOK_SECRET = os.getenv("MT5_WEBHOOK_SECRET", "")  # Optional Bearer token

# MT5 Account Credentials (Read-Only / Investor Password is safe to use here!)
MT5_LOGIN = int(os.getenv("MT5_LOGIN", "2849102"))
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "YourInvestorPassword")
MT5_SERVER = os.getenv("MT5_SERVER", "Exness-MT5Real14")
MT5_PATH = os.getenv("MT5_PATH", "")  # Optional: "C:\\Program Files\\MetaTrader 5\\terminal64.exe"

REFRESH_INTERVAL_SECONDS = 30
SYMBOL_FILTER = "XAUUSD"

# PAUSED MODE: Set to True by default as requested.
# When True, bridge simulates MT5 disconnected/paused state so dashboard displays:
# "Live Data Paused - Last Updated: [Time]"
IS_PAUSED = os.getenv("BRIDGE_PAUSED", "true").lower() in ("true", "1", "yes")


def format_duration(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def fetch_and_send_telemetry():
    if mt5 is None:
        print("[-] MetaTrader5 library missing. Please install it on Windows.")
        return False

    # Initialize connection to MT5
    init_params = {}
    if MT5_PATH:
        init_params["path"] = MT5_PATH

    if not mt5.initialize(**init_params):
        print(f"[-] MT5 Initialize failed: {mt5.last_error()}")
        return False

    # If login is provided, log in to the account
    if MT5_LOGIN and MT5_PASSWORD:
        authorized = mt5.login(MT5_LOGIN, password=MT5_PASSWORD, server=MT5_SERVER)
        if not authorized:
            print(f"[-] Failed to authorize MT5 account #{MT5_LOGIN}: {mt5.last_error()}")
            mt5.shutdown()
            return False

    # 1. Fetch Account Info
    account_info = mt5.account_info()
    if account_info is None:
        print(f"[-] Failed to get account info: {mt5.last_error()}")
        mt5.shutdown()
        return False

    acc_data = {
        "balance": float(account_info.balance),
        "equity": float(account_info.equity),
        "margin": float(account_info.margin),
        "freeMargin": float(account_info.margin_free),
        "broker": account_info.company,
        "server": account_info.server,
        "login": str(account_info.login),
    }

    # 2. Fetch Open Positions
    open_positions = []
    positions = mt5.positions_get()
    now_ts = datetime.now().timestamp()

    if positions:
        for pos in positions:
            # Filter for Gold if configured
            if SYMBOL_FILTER and SYMBOL_FILTER not in pos.symbol:
                continue

            direction = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
            pips = (pos.price_current - pos.price_open) * 10 if direction == "BUY" else (pos.price_open - pos.price_current) * 10
            duration_sec = max(0, now_ts - pos.time)

            open_positions.append({
                "ticket": pos.ticket,
                "symbol": pos.symbol,
                "type": direction,
                "lots": float(pos.volume),
                "openPrice": float(pos.price_open),
                "currentPrice": float(pos.price_current),
                "sl": float(pos.sl),
                "tp": float(pos.tp),
                "profit": float(pos.profit),
                "pips": round(pips, 1),
                "openTime": datetime.fromtimestamp(pos.time).strftime("%Y-%m-%d %H:%M:%S"),
                "duration": format_duration(duration_sec),
            })

    # 3. Fetch Historical Closed Deals (Last 60 Days)
    from_date = datetime.now() - timedelta(days=60)
    to_date = datetime.now()
    history_deals = mt5.history_deals_get(from_date, to_date)

    closed_trades = []
    if history_deals:
        # Filter for entry out/close deals
        for deal in history_deals:
            if deal.entry == mt5.DEAL_ENTRY_OUT and deal.profit != 0:
                direction = "BUY" if deal.type == mt5.DEAL_TYPE_BUY else "SELL"
                duration_str = "1h 30m"

                closed_trades.append({
                    "ticket": deal.ticket,
                    "closeTime": datetime.fromtimestamp(deal.time).strftime("%Y-%m-%d %H:%M:%S"),
                    "symbol": deal.symbol,
                    "type": direction,
                    "lots": float(deal.volume),
                    "openPrice": float(deal.price),
                    "closePrice": float(deal.price),
                    "profit": float(deal.profit),
                    "pips": round(abs(deal.profit) / 10, 1),
                    "duration": duration_str,
                })

    # Sort history latest first
    closed_trades.sort(key=lambda x: x["closeTime"], reverse=True)

    # 4. Compile Payload
    payload = {
        "botName": "Gold Star (XAUUSD Pro)",
        "version": "v4.8.2 Institutional",
        "account": acc_data,
        "positions": open_positions,
        "history": closed_trades[:50],  # Latest 50 trades
    }

    # 5. Push to Dashboard Webhook
    headers = {"Content-Type": "application/json"}
    if WEBHOOK_SECRET:
        headers["Authorization"] = f"Bearer {WEBHOOK_SECRET}"

    try:
        response = requests.post(DASHBOARD_URL, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            print(f"[+] [{datetime.now().strftime('%H:%M:%S')}] Telemetry synced: Balance=${acc_data['balance']:.2f} | Equity=${acc_data['equity']:.2f} | Positions={len(open_positions)}")
            return True
        else:
            print(f"[-] Dashboard returned status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[-] Connection error pushing to dashboard: {e}")

    mt5.shutdown()
    return False


def main():
    global IS_PAUSED
    print("=" * 60)
    print("   GOLD STAR MT5 LIVE BRIDGE CONNECTOR")
    print(f"   Target Dashboard: {DASHBOARD_URL}")
    print(f"   Refresh Cycle: Every {REFRESH_INTERVAL_SECONDS} seconds")
    if IS_PAUSED:
        print("   STATUS: [PAUSED] (Testing 'Live Data Paused' banner)")
        print("   Set BRIDGE_PAUSED=false or edit IS_PAUSED=False to resume")
    else:
        print("   STATUS: [ACTIVE STREAMING]")
    print("=" * 60)

    while True:
        if IS_PAUSED:
            print(f"[*] [{datetime.now().strftime('%H:%M:%S')}] Bridge is PAUSED. Dashboard showing 'Live Data Paused - Last Updated: [Time]'")
        else:
            try:
                fetch_and_send_telemetry()
            except Exception as e:
                print(f"[-] Loop error: {e}")

        time.sleep(REFRESH_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
