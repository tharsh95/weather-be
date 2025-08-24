
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
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY || '';

// Validate required environment variables
if (!openWeatherApiKey) {
  console.error('❌ OPENWEATHER_API_KEY is required but not provided');
  process.exit(1);
}

connectDB(mongoURI);
const redis = createRedisClient(redisUrl);
    
const app = express();
  
                                
  
  
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
  