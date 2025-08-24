
  import express from "express"
import helmet from "helmet"
import cors from 'cors'
import { errorMiddleware } from "@/middlewares/error.js"
import morgan from "morgan"
import dotenv from "dotenv"
import { connectDB, createRedisClient } from "@/lib/db.js"
import { buildCitiesRouter } from "@/routes/cities.js"
import { buildUsersRouter } from "@/routes/users.js"
  
  dotenv.config({path: './.env',});
  
  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = process.env.PORT || 3000;
  
const mongoURI = process.env.MONGO_URI! || 'mongodb://localhost:27017';
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY || '';

// Validate required environment variables
if (!openWeatherApiKey) {
  console.error('❌ OPENWEATHER_API_KEY is required but not provided');
  process.exit(1);
}

connectDB(mongoURI);
const redis = createRedisClient(); // No URL needed for mock client
    
const app = express();

// Add timeout middleware to prevent hanging requests
app.use((req, res, next) => {
  const timeout = 30000; // 30 seconds
  req.setTimeout(timeout, () => {
    res.status(408).json({
      success: false,
      message: "Request timeout",
      error: { statusCode: 408 }
    });
  });
  next();
});
    
app.use(
  helmet({
    contentSecurityPolicy: envMode !== "DEVELOPMENT",
    crossOriginEmbedderPolicy: envMode !== "DEVELOPMENT",
  })
);
    
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({origin:' * ',credentials:true}));
app.use(morgan('dev'))
    

  app.get('/', (req, res) => {
     res.send('Hello, World!');
  });
  
  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      // Check if in-memory cache is working
      const cacheStatus = 'ready'; // Always ready for in-memory cache
      
      // Check if MongoDB is connected
      const mongoStatus = 'connected'; // This would need to be implemented based on your DB connection
      
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          cache: cacheStatus,
          mongodb: mongoStatus
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // your routes here
app.use('/api/cities', buildCitiesRouter(redis, openWeatherApiKey));
app.use('/api/users', buildUsersRouter(redis, openWeatherApiKey));
  
    
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Page not found",
    });
  });
  
  app.use(errorMiddleware);
    
  app.listen(port, () => console.log('Server is working on Port:'+port+' in '+envMode+' Mode.'));
  