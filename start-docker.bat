@echo off
REM Docker startup script for Windows

echo Starting Communication App with Docker...
echo.

REM Check if Docker exists
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker daemon is not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker.exe"
    echo Please wait for Docker to start, then run this script again.
    pause
    exit /b 1
)

echo Building and starting containers...
docker-compose up --build -d

echo.
echo ✓ Containers started!
echo.
echo Services:
echo   - PostgreSQL Database: postgresql://postgres:postgres@localhost:5432/communication
echo   - Backend API: http://localhost:3000
echo   - Frontend: http://localhost:5000
echo.
echo View logs with: docker-compose logs -f
echo Stop containers with: docker-compose down
echo.
pause
