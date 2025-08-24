    
  import mongoose from "mongoose";
  
  export const connectDB = (uri: string) =>
    mongoose
      .connect(uri, { dbName: "Weather" })
      .then((c) => {
        console.log(`✅ Connected to MongoDB: ${c.connection.name}`);
      })
      .catch((e) => console.log("❌ MongoDB connection error:", e));
  
  // Simple in-memory cache that mimics Redis functionality
  class SimpleCache {
    private cache = new Map<string, { value: string; expiry: number }>();
  
    async get(key: string): Promise<string | null> {
      const item = this.cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    }
  
    async set(key: string, value: string, expirySeconds: string): Promise<void> {
      const expiry = Date.now() + (parseInt(expirySeconds) * 1000);
      this.cache.set(key, { value, expiry });
    }
  
    async del(key: string): Promise<void> {
      this.cache.delete(key);
    }
  
    async flushall(): Promise<void> {
      this.cache.clear();
    }
  
    // Mock Redis events for compatibility
    on(event: string, callback: Function): void {
      // Mock event handling
      if (event === 'connect') {
        setTimeout(() => callback(), 0);
      }
    }
  
    // Mock Redis status
    get status(): string {
      return 'ready';
    }
  }
  
  export const createRedisClient = (redisUrl?: string) => {
    const client = new SimpleCache();
    
    console.log("✅ Simple in-memory cache created (no external Redis server required)");
    console.log("🚀 Cache ready for commands");
    
    return client;
  };
  
  