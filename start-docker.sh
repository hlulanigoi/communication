#!/bin/bash
# Docker startup script

echo "Starting Communication App with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose up --build -d

echo ""
echo "✓ Containers started!"
echo ""
echo "Services:"
echo "  - PostgreSQL Database: postgresql://postgres:postgres@localhost:5432/communication"
echo "  - Backend API: http://localhost:3000"
echo "  - Frontend: http://localhost:5000"
echo ""
echo "View logs with: docker-compose logs -f"
echo "Stop containers with: docker-compose down"
