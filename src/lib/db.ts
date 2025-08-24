    
  import mongoose from "mongoose";
  import Redis from "ioredis";
  
  export const connectDB = (uri: string) =>
    mongoose
      .connect(uri, { dbName: "Weather" })
      .then((c) => {
        console.log(`Connected with ${c.connection.name}`);
      })
      .catch((e) => console.log(e));
  
      export const createRedisClient = (redisUrl: string) => {
        const client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000,
          keepAlive: 30000,
          family: 4,
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          }
        });
      
        client.on("connect", () => console.log("✅ Redis connected successfully"));
        client.on("ready", () => console.log("🚀 Redis ready for commands"));
        client.on("error", (err: unknown) => console.error("❌ Redis error:", err));
        client.on("close", () => console.log("🔴 Redis connection closed"));
        client.on("reconnecting", () => console.log("�� Redis reconnecting..."));
        client.on("end", () => console.log("🏁 Redis connection ended"));
      
        return client;
      };
  
  