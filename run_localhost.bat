@echo off
setlocal EnableDelayedExpansion
title GeM PriceCompare - 1-Click Localhost Launcher
color 0B
cls

echo ===============================================================================
echo                GeM PriceCompare - Smart India Hackathon 2026
echo                       One-Click Localhost Launcher
echo ===============================================================================
echo.

:: Detect and set project directory
set "PROJECT_DIR=%~dp0"
if exist "%~dp0BurlywoodWhimsicalApplets\package.json" (
    set "PROJECT_DIR=%~dp0BurlywoodWhimsicalApplets"
)
:: Remove trailing backslash if present
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

cd /d "%PROJECT_DIR%"

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js [v18 or higher] from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo [OK] Node.js is ready: !NODE_VER!
echo.

echo [2/3] Launching GeM Backend API Server (Port 5000)...
start "GeM PriceCompare - Backend API (Port 5000)" cmd /k "cd /d "%PROJECT_DIR%" && title GeM Backend [Port 5000] && npx -y pnpm --filter @workspace/api-server run dev"
ping 127.0.0.1 -n 3 >nul 2>&1

echo [3/3] Launching GeM Frontend Portal (Port 3000)...
start "GeM PriceCompare - Frontend Web (Port 3000)" cmd /k "cd /d "%PROJECT_DIR%" && title GeM Frontend [Port 3000] && npx -y pnpm --filter @workspace/gem-pricecompare run dev"
ping 127.0.0.1 -n 4 >nul 2>&1

echo.
echo ===============================================================================
echo                          ALL SERVERS STARTED LIVE!
echo ===============================================================================
echo.
echo  - Frontend Web Portal : http://localhost:3000
echo  - Backend REST API    : http://localhost:5000
echo.
echo  - Pre-seeded Demo Logins:
echo      * Admin:        Username: admin        Password: admin123
echo      * Buyer:        Username: riya         Password: buyer123
echo      * Auditor:      Username: vikram       Password: audit123
echo      * Department:   Username: ananya       Password: buyer123
echo.
echo ===============================================================================
echo.
echo Opening http://localhost:3000 in your default web browser...
start http://localhost:3000

echo.
echo Keep the opened server terminal windows running while using the portal.
echo You can minimize this window or press any key to exit this launcher.
pause >nul
