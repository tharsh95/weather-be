# 🐳 Docker Deployment Guide

This guide explains how to deploy the Weather API using Docker with Redis.

## 📋 Prerequisites

- Docker and Docker Compose installed
- MongoDB running externally (not containerized)
- OpenWeather API key

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and update it:
```bash
cp env.example .env
```

Edit `.env` with your actual values:
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://localhost:27017/weather
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 2. Build and Run

Use the provided script:
```bash
./docker-build.sh
```

Or manually:
```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Host     │    │   Docker        │    │   External      │
│                 │    │   Container     │    │   MongoDB       │
│                 │    │                 │    │                 │
│  Port 3000     │◄──►│  Weather API    │    │  Port 27017     │
│  Port 6379     │◄──►│  Redis          │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Services

### Weather API (`app`)
- **Port**: 3000
- **Image**: Built from local Dockerfile
- **Dependencies**: Redis, MongoDB (external)
- **Health Check**: HTTP endpoint monitoring

### Redis (`redis`)
- **Port**: 6379
- **Image**: `redis:7-alpine`
- **Features**: 
  - Password protection (optional)
  - Data persistence
  - Health monitoring
  - AOF (Append Only File) enabled

## 📊 Monitoring

### Health Checks
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f redis

# Health check details
docker inspect weather-be_app_1 | grep Health -A 10
```

### Performance
```bash
# Container resource usage
docker stats

# Redis info
docker exec -it weather-be_redis_1 redis-cli info
```

## 🛠️ Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart app

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Clean up (removes volumes)
docker-compose down -v
```

## 🔒 Security Features

- **Non-root user**: App runs as `nodejs` user (UID 1001)
- **Redis password**: Optional password protection
- **Network isolation**: Custom bridge network
- **Health checks**: Automatic service monitoring

## 📁 File Structure

```
.
├── Dockerfile              # App container definition
├── docker-compose.yml      # Service orchestration
├── .dockerignore          # Build optimization
├── docker-build.sh        # Build automation script
├── env.example            # Environment template
└── DOCKER_README.md       # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :6379
   ```

2. **MongoDB connection**
   - Ensure MongoDB is running on host
   - Check `MONGO_URI` in `.env`
   - Use `host.docker.internal` for host networking

3. **Redis connection**
   ```bash
   # Test Redis connection
   docker exec -it weather-be_redis_1 redis-cli ping
   ```

4. **Build failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   ```

### Debug Mode

```bash
# Run with logs
docker-compose up

# Check container logs
docker-compose logs app
```

## 🔄 Updates

To update the application:

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 📈 Scaling

For production scaling:

```bash
# Scale app instances
docker-compose up -d --scale app=3

# Use external Redis cluster
# Update REDIS_URL in .env
```

## 🎯 Production Considerations

- Use external Redis cluster for high availability
- Implement proper logging and monitoring
- Set up backup strategies for Redis data
- Use environment-specific configurations
- Implement proper SSL/TLS termination
