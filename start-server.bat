@echo off
REM Communication App - Native Server Startup
REM Run this after setup-native.bat completes

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   COMMUNICATION APP SERVER
echo ============================================
echo.

REM Set Node path
set NODE_PATH=C:\Users\HP\Desktop\App\node-v20.19\node-v20.19.0-win-x64
set PATH=%NODE_PATH%;%PATH%

REM Check if PostgreSQL is running
echo Checking PostgreSQL connection...
REM This is a simple check - you may need to adjust based on your setup

cd /d "C:\Users\HP\Desktop\App\communication"

REM Check .env.local exists
if not exist ".env.local" (
    echo ERROR: .env.local not found!
    echo Please run setup-native.bat first or create .env.local
    pause
    exit /b 1
)

echo.
echo ✓ Starting Communication App Server...
echo.
echo Frontend: http://localhost:5000
echo Backend:  http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
npm run dev
