import { Router } from "express";
import { buildUserControllers } from "@/controllers/users.js";
import { WeatherService } from "@/utils/weatherService.js";
import type { CacheClient } from "@/types/cache.js";

export const buildUsersRouter = (redis: CacheClient, apiKey: string) => {
  const router = Router();
  const weatherService = new WeatherService(redis, apiKey);
  const { 
    login,
    register, 
    getProfile, 
    addToFavorites, 
    removeFromFavorites, 
    getFavorites,
    getFavoritesWithWeather,
    getFavoriteCityWeather
  } = buildUserControllers(weatherService);

  // User management
  router.post("/login", login);
  router.post("/register", register);
  router.get("/:userId/profile", getProfile);
  
  // Favorites management
  router.get("/:userId/favorites", getFavorites);
  router.get("/:userId/favorites/weather", getFavoritesWithWeather);
  router.post("/:userId/favorites", addToFavorites);
  router.delete("/:userId/favorites/:cityId", removeFromFavorites);
  router.get("/:userId/favorites/:cityId/weather", getFavoriteCityWeather);

  return router;
};
