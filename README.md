# Weather Backend API

A simple, lightweight weather API backend built with Node.js, Express, and TypeScript.

## ✨ Features

- 🌤️ Current weather and forecast data via OpenWeather API
- 🚀 **No Docker required** - simple npm setup
- 💾 **No external Redis server** - built-in in-memory caching
- 🔄 Automatic retry with exponential backoff
- ⏱️ Comprehensive timeout handling
- 📊 MongoDB for city tracking and analytics
- 🧪 Built-in API testing tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running locally
- OpenWeather API key

### Installation

1. **Clone and install dependencies**
```bash
git clone <your-repo>
cd be
npm install
```

2. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your OPENWEATHER_API_KEY
```

3. **Start MongoDB** (if not running)
```bash
# macOS
brew services start mongodb-community

# Windows
# Start MongoDB service

# Linux
sudo systemctl start mongod
```

4. **Run the application**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

5. **Test the API**
```bash
npm run test:api
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENWEATHER_API_KEY=your_api_key_here

# Optional
MONGO_URI=mongodb://localhost:27017/weather
PORT=3000
NODE_ENV=development
```

### Timeout Settings
- **API calls**: 10 seconds
- **Request timeout**: 30 seconds  
- **Controller timeout**: 25 seconds
- **Retry attempts**: 2 with exponential backoff

## 📡 API Endpoints

### Weather Data
- `GET /api/cities/search?city={city}&country={country}&units={units}` - Get current weather and forecast
- `GET /api/cities/suggest?query={query}&limit={limit}` - Auto-suggest cities
- `POST /api/cities/add` - Add a new city

### System
- `GET /health` - Health check
- `GET /` - Welcome message

## 🏗️ Architecture

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database (via Mongoose)
- **In-memory cache** - Redis-compatible caching (no external server)
- **Axios** - HTTP client with timeout and retry
- **Morgan** - Request logging

## 🧪 Testing

### Test Weather API Connectivity
```bash
npm run test:api
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 📊 Monitoring

Watch for these log patterns:
- `✅ Simple in-memory cache created`
- `🚀 Cache ready for commands`
- `Request timeout: Weather API took too long to respond`
- `Rate limit exceeded: Too many requests`

## 🚨 Troubleshooting

See [TIMEOUT_TROUBLESHOOTING.md](./TIMEOUT_TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Common Issues
1. **OpenWeather API key invalid** - Check your API key
2. **MongoDB not running** - Start MongoDB service
3. **Rate limiting** - OpenWeather free tier: 60 calls/minute
4. **Network issues** - Check firewall and connectivity

## 🔄 Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Start production
npm start
```

## 📝 License

ISC

---

**No Docker, no Redis server, no complex setup - just simple, fast weather API!** 🌟
