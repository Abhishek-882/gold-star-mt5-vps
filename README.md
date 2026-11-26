# 🌟 Gold Star - MT5 Live Bot Performance Dashboard (Production VPS Pack)

An institutional, real-time performance dashboard for MetaTrader 5 Expert Advisors (Gold XAUUSD bots).

> **🛡️ Strict Security & Authenticity Policy**:
> - **100% Real MT5 Values**: ZERO fake numbers, ZERO fake demo values, ZERO made-up PnL. When MT5 is not connected or paused, the dashboard clearly displays `"Live Data Paused - Last Updated: [Time]"` or awaits MT5 stream.
> - **Zero Password Leakage**: The MT5 Investor Password is **NEVER** displayed, leaked, or given away to website visitors. The read-only credentials stay strictly on your private VPS inside the MetaTrader 5 terminal. Visitors inspect the verified performance via the dashboard telemetry only.

---

## 📦 What's Inside This Package

```
gold-star-dashboard/
├── src/
│   ├── app/
│   │   ├── api/mt5/live/route.ts      # 30s auto-refresh MT5 telemetry endpoint
│   │   ├── api/mt5/history/route.ts   # Audited closed trades ledger
│   │   ├── api/mt5/webhook/route.ts   # Webhook endpoint receiving real MT5 data
│   │   ├── api/mt5/config/route.ts    # Settings & configuration API
│   │   ├── globals.css                # Obsidian black + Gold accent (#FFD700) theme
│   │   ├── layout.tsx                 # App layout with ScrollProgressBar & AOS
│   │   └── page.tsx                   # Intro page gate vs. Full Terminal switcher
│   ├── components/                    # High-precision UI components
│   ├── context/                       # Auth, Language (English + Telugu), Data providers
│   └── lib/                           # Data models & bilingual translations
├── mt5_bridge/
│   ├── mt5_bridge.py                  # Real MetaTrader 5 Python connector
│   └── GoldStar_Exporter.mq5          # Native MQL5 WebRequest EA exporter
├── setup_vps.sh                       # 1-Click Linux VPS setup script (Ubuntu/Debian)
├── setup_windows_vps.bat              # 1-Click Windows VPS setup script
├── nginx_goldstar.conf                # Production Nginx reverse-proxy template
├── package.json
└── README.md
```

---

## 🚀 Setting Up on Another VPS

### 🖥️ Option 1: Windows VPS Setup (Recommended for MT5 Bots)
*Most forex traders run MT5 on a Windows VPS. This runs the dashboard and the MT5 bridge on the same machine.*

1. **Prerequisites**:
   - Install **Node.js 20 LTS** from [https://nodejs.org](https://nodejs.org)
   - Install **Python 3.10+** from [https://python.org](https://python.org) (check "Add Python to PATH")
   - Install **MetaTrader 5** and log in to your trading account.

2. **Extract & Run**:
   - Extract `gold-star-mt5-vps-package.zip` into `C:\gold-star-dashboard\`
   - Open command prompt in that directory and run:
     ```cmd
     setup_windows_vps.bat
     ```
   - This automatically installs dependencies, builds the production app, installs `MetaTrader5` and `requests` python packages, and launches both:
     - The Dashboard on `http://localhost:3000`
     - The Python MT5 Bridge streaming real trades every 30 seconds

3. **Configure Your MT5 Credentials in `mt5_bridge\mt5_bridge.py`**:
   ```python
   MT5_LOGIN = 12345678               # Your MT5 Account Login
   MT5_PASSWORD = "YourInvestorPass"  # Investor Read-Only Password
   MT5_SERVER = "YourBroker-Server"   # Broker Server Name
   IS_PAUSED = False                  # Set to False to start active streaming
   ```

---

### 🐧 Option 2: Linux VPS Setup (Ubuntu 22.04 / 24.04 or Debian)
*If you host the web dashboard on a Linux VPS (or DigitalOcean/Hetzner) and have MT5 running on your home PC or separate Windows VPS.*

1. **Upload & Extract**:
   ```bash
   unzip gold-star-mt5-vps-package.zip -d gold-star-dashboard
   cd gold-star-dashboard
   ```

2. **Run One-Click Installer**:
   ```bash
   chmod +x setup_vps.sh
   ./setup_vps.sh
   ```
   *This automatically updates system packages, installs Node.js 20, PM2, builds the Next.js bundle, and registers the system service to restart on reboot.*

3. **Useful PM2 Commands**:
   - Check status: `pm2 status`
   - View live logs: `pm2 logs gold-star-dashboard`
   - Restart server: `pm2 restart gold-star-dashboard`
   - Stop server: `pm2 stop gold-star-dashboard`

4. **Add Domain & Free SSL (Nginx)**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   sudo cp nginx_goldstar.conf /etc/nginx/sites-available/goldstar.conf
   # Edit your domain name in /etc/nginx/sites-available/goldstar.conf
   sudo ln -s /etc/nginx/sites-available/goldstar.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

### ☁️ Option 3: Deploying Web on Vercel
1. Push this folder to a GitHub repository.
2. In [Vercel](https://vercel.com), import the repository and deploy.
3. On your Windows machine / VPS where MT5 runs, update `DASHBOARD_URL` in `mt5_bridge.py`:
   ```python
   DASHBOARD_URL = "https://your-domain.vercel.app/api/mt5/webhook"
   ```
4. Run `python mt5_bridge.py` to stream live ticks to your Vercel URL!

---

### 🔗 Connecting MT5 with Native MQL5 EA (No Python Needed)
If you prefer not using Python:
1. Open MT5: Go to **Tools -> Options -> Expert Advisors**.
2. Check **"Allow WebRequest for listed URL"** and add:
   - `http://localhost:3000` (or your domain / VPS IP)
3. Copy `mt5_bridge/GoldStar_Exporter.mq5` into `MQL5/Experts/` inside MetaTrader 5.
4. Compile in MetaEditor and drag onto any Gold (XAUUSD) chart. It will stream live account stats and open positions every 30 seconds.

---

### ⚙️ How to Update Social Links (Telegram / WhatsApp / Instagram)
You can update your links in **two ways**:
1. **Directly in the Live UI (No code restart!)**:
   - Click the **Gear icon (Settings)** in the top right header.
   - Go to **"2. Contact & Social Links"**.
   - Enter your Telegram link, WhatsApp link & contact number, and Instagram link.
   - Click **Save Settings** — all buttons update instantly across the site and mobile bar.
2. **In Code**:
   - Edit `src/lib/defaultData.ts`.
