@echo off
REM =============================================================================
REM GOLD STAR MT5 DASHBOARD - WINDOWS VPS SETUP & RUN SCRIPT
REM Runs the Web Dashboard and Python MT5 Bridge side-by-side
REM =============================================================================

echo ==========================================================
echo    GOLD STAR MT5 PERFORMANCE DASHBOARD - WINDOWS VPS
echo ==========================================================

REM 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [-] Node.js is not installed!
    echo Please install Node.js 18+ LTS from https://nodejs.org
    pause
    exit /b 1
)

REM 2. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [-] Python is not installed!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

echo [*] Installing dashboard npm dependencies...
call npm install

echo [*] Building Next.js production build...
call npm run build

echo [*] Installing Python MT5 Bridge dependencies...
pip install MetaTrader5 requests

echo ==========================================================
echo [*] Starting Gold Star Dashboard on http://localhost:3000 ...
start "Gold Star Dashboard" cmd /k "npm start"

timeout /t 5 >nul

echo [*] Starting Python MT5 Bridge ...
start "MT5 Bridge Streamer" cmd /k "python mt5_bridge\mt5_bridge.py"

echo ==========================================================
echo    ALL SERVICES RUNNING ON YOUR WINDOWS VPS!
echo    Dashboard: http://localhost:3000
echo ==========================================================
pause
