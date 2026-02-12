# 🚀 Communication App - Server Setup Guide

This guide will help you set up and run the Communication App as a server on this PC using Docker.

## Prerequisites

- **Docker Desktop for Windows** (will be installed)
- **Git** (already installed)
- **Node.js** (already installed)
- **Admin access** (for some configurations)

## 📋 Setup Steps

### Step 1: Install Docker Desktop

1. Download installer: **Docker-Desktop-Installer.exe** (already downloaded to `%TEMP%`)
2. Right-click it → **Run as Administrator**
3. Follow the installation wizard (accept defaults)
4. Once installed, **restart your computer**
5. Docker will automatically start on reboot

### Step 2: Build and Start the App with Docker

Once Docker is installed and running:

```bash
cd C:\Users\HP\Desktop\App\communication
.\start-docker.bat
```

This will:
- Build the Docker image for the app
- Start PostgreSQL database container
- Start the Node.js backend
- All services will be available immediately

### Step 3: Configure Static IP (Optional but Recommended for Server)

To ensure consistent access from other devices:

```bash
C:\Users\HP\Desktop\set-static-ip.bat
```

Right-click → **Run as Administrator** and follow the prompts.

## 🌐 Access the Application

Once running, you can access:

- **Backend API**: http://localhost:3000 or http://your-static-ip:3000
- **Frontend**: http://localhost:5000 or http://your-static-ip:5000
- **Database**: postgresql://postgres:postgres@localhost:5432/communication

## 📊 Docker Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres

# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Access database from CLI
docker exec -it communication-db psql -U postgres -d communication
```

## 🔧 Configuration Files

- **.env.local**: Database URL and environment variables
- **docker-compose.yml**: Container orchestration
- **Dockerfile**: Application container specification
- **.dockerignore**: Files to exclude from Docker build

## ⚙️ Environment Variables

Edit `.env.local` to configure:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/communication
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

## 🔐 Database Access

**Connection Details:**
- Host: localhost (or container name `postgres` within Docker)
- Port: 5432
- Username: postgres
- Password: postgres
- Database: communication

## 🚀 Auto-Start on Boot (Windows)

To have the app automatically start when your PC boots:

1. Create a Task Scheduler task:
   - Open **Task Scheduler** (search Windows)
   - Click **Create Basic Task**
   - Name: "Start Communication App"
   - Trigger: "At startup"
   - Action: Run program → `C:\Users\HP\Desktop\App\communication\start-docker.bat`
   - Check: "Run with highest privileges"

## 🔄 Health Checks

All services have health checks enabled. If a service fails, it will automatically restart.

View health status:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 📝 Troubleshooting

### Docker won't start
- Make sure WSL 2 (Windows Subsystem for Linux 2) is installed
- Restart Docker Desktop
- Restart Windows

### Database connection error
- Check if postgres container is running: `docker ps`
- Verify DATABASE_URL in .env.local
- Check logs: `docker-compose logs postgres`

### Port already in use
- Change ports in docker-compose.yml
- Or stop other services using those ports
- Default ports: 3000 (API), 5000 (Frontend), 5432 (Database)

### Out of disk space
Clean up unused Docker resources:
```bash
docker system prune -a
```

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running
3. Ensure ports 3000, 5000, 5432 are not in use
4. Try rebuilding: `docker-compose up --build`

---

**Status:** Ready for deployment! ✅
