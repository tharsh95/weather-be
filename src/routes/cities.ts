import { Router } from "express";
import { WeatherService } from "@/utils/weatherService.js";
import { buildCityControllers } from "@/controllers/cities.js";
import type { CacheClient } from "@/types/cache.js";

export const buildCitiesRouter = (redis: CacheClient, apiKey: string) => {
  const router = Router();
  const weatherService = new WeatherService(redis, apiKey);
  const { searchCity, autoSuggest, addCity } = buildCityControllers(weatherService);

  router.get("/search", searchCity);
  router.get("/suggest", autoSuggest);
  router.post("/add", addCity);

  return router;
};
