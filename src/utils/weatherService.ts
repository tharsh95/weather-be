// import axios from "axios";
// import type Redis from "ioredis";
// import { City } from "@/models/city.js";

// const DEFAULT_UNITS = "metric";

// const buildKey = (prefix: string, city: string, country?: string, units?: string) => {
//   const norm = `${city.trim().toLowerCase()}${country ? "," + country.trim().toLowerCase() : ""}`;
//   return `${prefix}:${norm}:${units || DEFAULT_UNITS}`;
// };

// export class WeatherService {
//   constructor(private readonly redis: Redis, private readonly apiKey: string) {}

//   private async trackCitySearch(city: string, country?: string, incrementCount: boolean = true) {
//     try {

      
//       const cityDoc = await City.findOneAndUpdate(
//         { name: city },
//         { upsert: true, new: true }
//       );
//       return cityDoc;
//     } catch (error) {
//       console.error("Error tracking city search:", error);
//     }
//   }

//   async getCurrentByCity(city: string, country?: string, units: string = DEFAULT_UNITS) {
//     const key = buildKey("current", city, country, units);
//     const cached = await this.redis.get(key);
    
//     if (cached) {
//       // Update last searched time but don't increment count for cached results
//       await this.trackCitySearch(city, country, false);
//       const data = JSON.parse(cached);
//       return { ...data, cache: true };
//     }

//     const q = country ? `${city},${country}` : city;
//     const url = `https://api.openweathermap.org/data/2.5/weather`;
    
//     try {
//       const { data } = await axios.get(url, { params: { q, appid: this.apiKey, units } });
      
//       await this.redis.set(key, JSON.stringify(data), "EX", 300);
//       await this.trackCitySearch(city, country);
//       return { ...data, cache: false };
//     } catch (error: any) {
//       if (error.response?.status === 404) {
//         throw new Error(`City "${city}" not found`);
//       }
//       throw error;
//     }
//   }

//   async getForecastByCity(city: string, country?: string, units: string = DEFAULT_UNITS) {
//     const key = buildKey("forecast", city, country, units);
//     const cached = await this.redis.get(key);
    
//     if (cached) {
//       // Update last searched time but don't increment count for cached results
//       await this.trackCitySearch(city, country, false);
//       const data = JSON.parse(cached);
//       return { ...data, cache: true };
//     }

//     const q = country ? `${city},${country}` : city;
//     const url = `https://api.openweathermap.org/data/2.5/forecast`;
    
//     try {
//       const { data } = await axios.get(url, { params: { q, appid: this.apiKey, units } });
      
//       await this.redis.set(key, JSON.stringify(data), "EX", 900);
//       await this.trackCitySearch(city, country);
//       return { ...data, cache: false };
//     } catch (error: any) {
//       if (error.response?.status === 404) {
//         throw new Error(`City "${city}" not found`);
//       }
//       throw error;
//     }
//   }


//   async searchCities(query: string, limit: number = 10) {
//     if (!query || query.trim().length < 2) {
//       return [];
//     }

//     const searchQuery = query.trim().toLowerCase();
    
//     return await City.find({
//       $or: [
//         { name: { $regex: `^${searchQuery}`, $options: 'i' } },
//         { name: { $regex: searchQuery, $options: 'i' } }
//       ]
//     })
//     .sort({ searchCount: -1, name: 1 })
//     .limit(limit)
//     .select('name state');
//   }
// }
// export function capitalize(str:string|undefined) {
//     if (!str) return ""; // handle empty string
//     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//   }

import axios from "axios";
import type Redis from "ioredis";
import { City } from "@/models/city.js";

const DEFAULT_UNITS = "metric";

const buildKey = (prefix: string, city: string, country?: string, units?: string) => {
  const norm = `${city.trim().toLowerCase()}${country ? "," + country.trim().toLowerCase() : ""}`;
  return `${prefix}:${norm}:${units || DEFAULT_UNITS}`;
};

export class WeatherService {
  constructor(private readonly redis: Redis, private readonly apiKey: string) {}

  // Safe Redis methods with fallbacks
  private async safeRedisGet(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.warn(`Redis get failed for key ${key}:`, error);
      return null;
    }
  }

  private async safeRedisSet(key: string, value: string, expiry: string): Promise<void> {
    try {
      await this.redis.set(key, value, "EX", expiry);
    } catch (error) {
      console.warn(`Redis set failed for key ${key}:`, error);
    }
  }

  private async trackCitySearch(city: string, country?: string, incrementCount: boolean = true) {
    try {
      const cityDoc = await City.findOneAndUpdate(
        { name: city },
        { upsert: true, new: true }
      );
      return cityDoc;
    } catch (error) {
      console.error("Error tracking city search:", error);
    }
  }

  async getCurrentByCity(city: string, country?: string, units: string = DEFAULT_UNITS) {
    const key = buildKey("current", city, country, units);
    
    try {
      const cached = await this.safeRedisGet(key);
      
      if (cached) {
        await this.trackCitySearch(city, country, false);
        const data = JSON.parse(cached);
        return { ...data, cache: true };
      }
    } catch (error) {
      console.warn("Cache read failed, proceeding with API call:", error);
    }

    const q = country ? `${city},${country}` : city;
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    
    try {
      const { data } = await axios.get(url, { params: { q, appid: this.apiKey, units } });
      
      try {
        await this.safeRedisSet(key, JSON.stringify(data), "300");
      } catch (error) {
        console.warn("Failed to cache weather data:", error);
      }
      
      await this.trackCitySearch(city, country);
      return { ...data, cache: false };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      throw error;
    }
  }

  async getForecastByCity(city: string, country?: string, units: string = DEFAULT_UNITS) {
    const key = buildKey("forecast", city, country, units);
    
    try {
      const cached = await this.safeRedisGet(key);
      
      if (cached) {
        await this.trackCitySearch(city, country, false);
        const data = JSON.parse(cached);
        return { ...data, cache: true };
      }
    } catch (error) {
      console.warn("Cache read failed, proceeding with API call:", error);
    }

    const q = country ? `${city},${country}` : city;
    const url = `https://api.openweathermap.org/data/2.5/forecast`;
    
    try {
      const { data } = await axios.get(url, { params: { q, appid: this.apiKey, units } });
      
      try {
        await this.safeRedisSet(key, JSON.stringify(data), "900");
      } catch (error) {
        console.warn("Failed to cache forecast data:", error);
      }
      
      await this.trackCitySearch(city, country);
      return { ...data, cache: false };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      throw error;
    }
  }

  async searchCities(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = query.trim().toLowerCase();
    
    return await City.find({
      $or: [
        { name: { $regex: `^${searchQuery}`, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .sort({ searchCount: -1, name: 1 })
    .limit(limit)
    .select('name state searchCount');
  }
}

export function capitalize(str:string|undefined) {
  if (!str) return ""; // handle empty string
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}