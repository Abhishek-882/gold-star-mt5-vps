#!/usr/bin/env bash
# =============================================================================
# GOLD STAR MT5 DASHBOARD - LINUX VPS ONE-CLICK SETUP SCRIPT
# Supports: Ubuntu 20.04 / 22.04 / 24.04, Debian 11 / 12
# =============================================================================

set -e

echo "=========================================================="
echo "   🌟 GOLD STAR - MT5 PERFORMANCE DASHBOARD INSTALLER"
echo "=========================================================="

# 1. Update OS packages
echo "[*] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw build-essential

# 2. Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
    echo "[*] Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "[+] Node version: $(node -v)"
echo "[+] NPM version: $(npm -v)"

# 3. Install PM2 process manager
if ! command -v pm2 &> /dev/null; then
    echo "[*] Installing PM2 process manager globally..."
    sudo npm install -g pm2
fi

# 4. Install dashboard dependencies & build
echo "[*] Installing npm dependencies..."
npm install

echo "[*] Building Next.js production bundle..."
npm run build

# 5. Start with PM2
echo "[*] Starting Gold Star Dashboard on port 3000 with PM2..."
pm2 delete gold-star-dashboard 2>/dev/null || true
pm2 start npm --name "gold-star-dashboard" -- start
pm2 save
pm2 startup | tail -n 1 | sudo bash || true

# 6. Allow port 3000 on firewall
sudo ufw allow 3000/tcp || true

echo "=========================================================="
echo "   ✅ DEPLOYMENT SUCCESSFUL!"
echo "   Dashboard is running on port 3000."
echo "   View PM2 logs: pm2 logs gold-star-dashboard"
echo "   Stop service: pm2 stop gold-star-dashboard"
echo "=========================================================="
