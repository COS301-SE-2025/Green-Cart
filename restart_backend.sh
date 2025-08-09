#!/bin/bash

echo "🔧 Manual Backend Restart Script"
echo "================================="

# Change to the correct directory
cd /home/ubuntu/Green-Cart

# Check current container status
echo "Current container status:"
sudo docker ps -a | grep green-cart-backend

# Stop and remove existing container
echo "Stopping existing container..."
sudo docker stop green-cart-backend || true
sudo docker rm green-cart-backend || true

# Check disk space
echo "Current disk usage:"
df -h

# List files in current directory
echo "Files in deployment directory:"
ls -la

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file missing!"
    exit 1
fi

# Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile found"
else
    echo "❌ Dockerfile missing!"
    exit 1
fi

# Build new container
echo "Building new container..."
sudo docker build -t green-cart-backend .

# Run new container
echo "Starting new container..."
sudo docker run -d --name green-cart-backend -p 8000:8000 --env-file .env green-cart-backend

# Check container status
echo "New container status:"
sudo docker ps | grep green-cart-backend

# Check container logs
echo "Container logs (last 20 lines):"
sudo docker logs --tail 20 green-cart-backend

echo "✅ Backend restart completed!"
