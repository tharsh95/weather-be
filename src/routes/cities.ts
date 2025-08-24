import { Router } from "express";
import type Redis from "ioredis";
import { WeatherService } from "@/utils/weatherService.js";
import { buildCityControllers } from "@/controllers/cities.js";

export const buildCitiesRouter = (redis: Redis, apiKey: string) => {
  const router = Router();
  const weatherService = new WeatherService(redis, apiKey);
  const { searchCity, autoSuggest, addCity, getPopularCities, getRecentlySearched } = buildCityControllers(weatherService);

  router.get("/search", searchCity);
  router.get("/suggest", autoSuggest);
  router.post("/add", addCity);
  router.get("/popular", getPopularCities);
  router.get("/recent", getRecentlySearched);

  return router;
};
