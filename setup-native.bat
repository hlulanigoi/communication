@echo off
REM Native Server Setup for Communication App
REM This script will help you set up everything without Docker

echo.
echo ============================================
echo   COMMUNICATION APP - NATIVE SERVER SETUP
echo ============================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found in PATH
    echo Please ensure Node.js is installed.
    pause
    exit /b 1
)

REM Set Node path
set NODE_PATH=C:\Users\HP\Desktop\App\node-v20.19\node-v20.19.0-win-x64
set PATH=%NODE_PATH%;%PATH%

cd /d "C:\Users\HP\Desktop\App\communication"

echo.
echo Installing dependencies...
call npm install --production

echo.
echo Building application...
call npm run build

echo.
echo ============================================
echo   Database Setup
echo ============================================
echo.
echo To complete the setup, you need to:
echo.
echo 1. Install PostgreSQL locally by running:
echo    C:\Users\HP\Desktop\install_postgres.bat
echo    (Right-click and Run as Administrator)
echo.
echo 2. After PostgreSQL is installed, update .env.local with:
echo    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/communication
echo.
echo 3. Run the database migrations:
echo    npm run db:push
echo.
echo 4. Start the server:
echo    npm run dev
echo.
echo ============================================
echo.
pause
