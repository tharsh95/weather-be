    
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
    const client = new Redis(redisUrl);
    client.on("connect", () => console.log("Redis connected"));
    client.on("error", (err: unknown) => console.error("Redis error", err));
    return client;
  };
  
  