import axios from "axios";
import { City } from "@/models/city.js";
import type { CacheClient } from "@/types/cache.js";

const DEFAULT_UNITS = "metric";
// Add timeout configuration for axios requests
const AXIOS_TIMEOUT = 10000; // 10 seconds
const AXIOS_CONFIG = {
  timeout: AXIOS_TIMEOUT,
  headers: {
    'User-Agent': 'WeatherApp/1.0'
  }
};

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function for retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (maxRetries === 0 || (error.response?.status && error.response.status >= 400 && error.response.status < 500)) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
};

const buildKey = (prefix: string, city: string, country?: string, units?: string) => {
  const norm = `${city.trim().toLowerCase()}${country ? "," + country.trim().toLowerCase() : ""}`;
  return `${prefix}:${norm}:${units || DEFAULT_UNITS}`;
};

export class WeatherService {
  constructor(private readonly redis: CacheClient, private readonly apiKey: string) {}

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
      await this.redis.set(key, value, expiry);
    } catch (error) {
      console.warn(`Cache set failed for key ${key}:`, error);
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
      const { data } = await retryWithBackoff(
        () => axios.get(url, { 
          ...AXIOS_CONFIG,
          params: { q, appid: this.apiKey, units } 
        })
      );
      
      try {
        await this.safeRedisSet(key, JSON.stringify(data), "300");
      } catch (error) {
        console.warn("Failed to cache weather data:", error);
      }
      
      await this.trackCitySearch(city, country);
      return { ...data, cache: false };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout: Weather API took too long to respond`);
      }
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      if (error.response?.status === 429) {
        throw new Error(`Rate limit exceeded: Too many requests to weather API`);
      }
      if (error.response?.status >= 500) {
        throw new Error(`Weather API server error: ${error.response.status}`);
      }
      throw new Error(`Failed to fetch weather data: ${error.message}`);
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
      const { data } = await retryWithBackoff(
        () => axios.get(url, { 
          ...AXIOS_CONFIG,
          params: { q, appid: this.apiKey, units } 
        })
      );
      
      try {
        await this.safeRedisSet(key, JSON.stringify(data), "900");
      } catch (error) {
        console.warn("Failed to cache forecast data:", error);
      }
      
      await this.trackCitySearch(city, country);
      return { ...data, cache: false };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout: Weather API took too long to respond`);
      }
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      if (error.response?.status === 429) {
        throw new Error(`Rate limit exceeded: Too many requests to weather API`);
      }
      if (error.response?.status >= 500) {
        throw new Error(`Weather API server error: ${error.response.status}`);
      }
      throw new Error(`Failed to fetch forecast data: ${error.message}`);
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