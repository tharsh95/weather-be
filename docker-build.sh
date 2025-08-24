#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building and starting Weather API with Redis...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create one based on env.example${NC}"
    echo -e "${YELLOW}   Copy env.example to .env and update the values${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${GREEN}📦 Building Docker image...${NC}"
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

# Start the services
echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo -e "${GREEN}🌐 API is running at: http://localhost:3000${NC}"
    echo -e "${GREEN}🔴 Redis is running at: localhost:6379${NC}"
    echo -e "${YELLOW}📊 MongoDB should be running externally at: localhost:27017${NC}"
    echo ""
    echo -e "${GREEN}📋 Useful commands:${NC}"
    echo -e "   View logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "   Stop services: ${YELLOW}docker-compose down${NC}"
    echo -e "   Restart: ${YELLOW}docker-compose restart${NC}"
else
    echo -e "${RED}❌ Failed to start services!${NC}"
    exit 1
fi
