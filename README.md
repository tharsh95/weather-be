# 🌤️ Weather API - Comprehensive Backend Service

A robust, scalable Weather API built with Node.js, TypeScript, and Express. Features real-time weather data, user management, favorites system, and comprehensive caching with Redis.

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- MongoDB (local or cloud)
- Redis (local or cloud)
- OpenWeather API key

### **Installation**
```bash
# Clone the repository
git clone <your-repo-url>
cd weather-api

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Update .env with your credentials
# Build the project
npm run build

# Start development server
npm run dev
```

## 📋 **Table of Contents**

- [Core Features](#-core-features)
- [API Endpoints](#-api-endpoints)
- [Advanced Features](#-advanced-features)
- [Security Features](#-security-features)
- [Performance Features](#-performance-features)
- [Development Features](#-development-features)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Contributing](#-contributing)

## ⭐ **Core Features**

### **🌤️ Weather Data**
- **Current Weather**: Real-time temperature, humidity, wind, etc.
- **5-Day Forecast**
- **Global Coverage**: Cities worldwide with OpenWeather API

### **🏙️ City Management**
- **Smart City Search**: Intelligent city name matching
- **Auto-Suggestions**: Real-time city name suggestions
- **Auto-Add Cities**: Automatically adds new cities to database

### **👥 User Management**
- **User Registration**: Secure user account creation
- **User Authentication**: Login/logout functionality
- **Password Security**: Bcrypt hashing with salt rounds

### **❤️ Favorites System**
- **Add to Favorites**: Save preferred cities
- **Remove from Favorites**: Manage favorite cities
- **Favorites Dashboard**: View all favorite cities
- **Weather for Favorites**: Get weather for saved cities

## 🔌 **API Endpoints**

### **🏙️ Cities API** (`/api/cities`)

#### **Search City Weather**
```http
GET /api/cities/search?city=London
```
**Features:**
- Real-time weather data
- 5-day forecast
- Automatic city addition to database
- Case-insensitive city matching

#### **City Auto-Suggestions**
```http
GET /api/cities/suggest?query=New&limit=10
```
**Features:**
- Smart city name suggestions
- Configurable result limits
- Auto Suggestions for Indian cities

### **👥 Users API** (`/api/users`)

#### **User Registration**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```
**Features:**
- Email validation
- Password strength requirements (8+ characters)
- Duplicate email prevention
- Secure password hashing

#### **User Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Features:**
- Secure password comparison
- User session management
- Error handling for invalid credentials


### **❤️ Favorites API** (`/api/users/:userId/favorites`)

#### **Get Favorites**
```http
GET /api/users/:userId/favorites
```
**Features:**
- List all favorite cities
- City details and metadata
- User-specific favorites

#### **Add to Favorites**
```http
POST /api/users/:userId/favorites
Content-Type: application/json

{
  "cityId": "city123"
}
```
**Features:**
- Duplicate prevention
- City validation
- User ownership verification

#### **Remove from Favorites**
```http
DELETE /api/users/:userId/favorites/:cityId
```
**Features:**
- Safe removal
- User verification
- Cleanup operations


#### **Single Favorite Weather**
```http
GET /api/users/:userId/favorites/:cityId/weather?units=metric
```
**Features:**
- Detailed weather for specific city
- Current + forecast data
- User verification

## 🚀 **Advanced Features**

### **🔍 Smart Search & Matching**
- **Case-Insensitive Search**: Find cities regardless of case
- **Partial Matching**: Search with partial city names
- **State/Country Support**: Enhanced city identification
- **Fuzzy Search**: Intelligent city name suggestions(Only for Indian cities)
- Can search other countries city(with correct spelling )
- Other cities not in dropdown will be saved in db

### **🔄 Real-Time Updates**
- **Live Weather Data**: Fresh data from OpenWeather API
- **Cache Management**: Redis-based caching system
- **Data Freshness**: Configurable cache expiration

## 🛡️ **Security Features**

### **🔐 Authentication & Authorization**
- **Password Hashing**: Bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive request validation
- **XSS Protection**: Helmet.js security headers

### **🌐 API Security**
- **CORS Configuration**: Configurable cross-origin policies
- **Rate Limiting**: Built-in request throttling
- **Input Sanitization**: Clean and validate all inputs
- **Error Handling**: Secure error messages

### **🔒 Data Protection**
- **Environment Variables**: Secure credential management
- **API Key Protection**: Secure OpenWeather API usage
- **User Isolation**: Data separation between users

## ⚡ **Performance Features**

### **🚀 Caching System**
- **Redis Integration**: High-performance caching
- **Weather Data Caching**: Reduce API calls
- **City Data Caching**: Fast city lookups
- **Cache Expiration**: Smart cache management

### **📈 Optimization**
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Async Operations**: Non-blocking I/O
- **Memory Management**: Efficient resource usage

### **🔍 Search Optimization**
- **Indexed Queries**: Fast city searches


## 🛠️ **Development Features**

### **🔧 Development Tools**
- **TypeScript Support**: Full type safety
- **Hot Reloading**: Automatic server restart
- **Debug Logging**: Comprehensive logging system
- **Error Tracking**: Detailed error information

### **📝 Code Quality**
- **TypeScript Compilation**: Strict type checking
- **Modular Architecture**: Clean code structure
- **API Documentation**: Comprehensive endpoint docs

### **🧪 Testing Support**
- **Test Framework Ready**: Jest/Mocha setup ready

## 🐳 **Deployment**

### **Docker Support**
- **Multi-stage Builds**: Optimized production images
- **Alpine Linux**: Lightweight container base
- **Health Checks**: Container monitoring
- **Non-root User**: Security best practices

### **Railway Deployment**
- **Git Integration**: Automatic deployments
- **Environment Management**: Secure variable handling
- **Auto-scaling**: Traffic-based scaling
- **SSL Support**: Free HTTPS certificates

### **Environment Configuration**
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://localhost:27017/weather
REDIS_URL=redis://localhost:6379
OPENWEATHER_API_KEY=your_api_key_here
```

## 🏗️ **Architecture**

### **📁 Project Structure**
```
src/
├── app.ts                 # Main application entry
├── controllers/           # Business logic 
│   └── users.ts          # User management
├── models/               # Database schemas
│   ├── city.ts           # City data model
│   └── user.ts           # User data model
├── routes/               # API route 
│   ├── cities.ts         # City endpoints
│   └── users.ts          # User endpoints
├── utils/                # Utility functions
└── lib/                  # Database connections
```

### **🔄 Data Flow**
```
Client Request → Express Router → Controller → Service → Database
     ↓              ↓              ↓          ↓         ↓
   HTTP         Route Handler   Business    External   MongoDB
   Request      Middleware     Logic       APIs       Redis
```

### **🔌 Technology Stack**
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5.1+
- **Database**: MongoDB 8.17+
- **Cache**: Redis 7.4+
- **Authentication**: Bcrypt 6.0+
- **HTTP Client**: Axios 1.7+
- **Security**: Helmet.js 8.1+

## 🚀 **Getting Started**

### **1. Local Development**
```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your credentials

# Build project
npm run build

# Start development server
npm run dev
```

### **2. Docker Development**
```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **3. Production Deployment**
```bash
# Railway deployment
railway login
railway init
railway up

# Or manual deployment
npm run build
npm start
```

## 📊 **API Examples**

### **Search for Weather**
```bash
curl "http://localhost:3000/api/cities/search?city=London&units=metric"
```

### **User Registration**
```bash
curl -X POST "http://localhost:3000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John","password":"password123"}'
```

### **Add to Favorites**
```bash
curl -X POST "http://localhost:3000/api/users/userId/favorites" \
  -H "Content-Type: application/json" \
  -d '{"cityId":"city123"}'
```

## 🔧 **Configuration Options**

### **Environment Variables**
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `OPENWEATHER_API_KEY` | Weather API key | Required |

### **Cache Settings**
- **Weather Cache**: 5 minutes (current), 15 minutes (forecast)
- **City Cache**: Persistent with search count tracking
- **User Cache**: Session-based with Redis

## 🚨 **Troubleshooting**

### **Common Issues**
1. **MongoDB Connection**: Check connection string and network
2. **Redis Connection**: Verify Redis server status
3. **API Key Issues**: Validate OpenWeather API key
4. **Port Conflicts**: Ensure port 3000 is available

### **Debug Mode**
```bash
# Enable debug logging
NODE_ENV= npm run dev
```

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### **Code Standards**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

## 📄 **License**

This project is licensed under the ISC License.

## 🙏 **Acknowledgments**

- **OpenWeather API** for weather data
- **Express.js** for the web framework
- **MongoDB** for database
- **Redis** for caching
- **TypeScript** for type safety

---

**Built using modern web technologies**

*For detailed Docker deployment instructions, see [DOCKER_README.md](./DOCKER_README.md)*
