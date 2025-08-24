import { Request, Response, NextFunction } from "express";
import { TryCatch } from "@/middlewares/error.js";
import ErrorHandler from "@/utils/errorHandler.js";
import { capitalize, WeatherService } from "@/utils/weatherService.js";
import { City } from "@/models/city.js";

export const buildCityControllers = (weatherService: WeatherService) => {
  const searchCity = TryCatch(async (req: Request, res: Response, _next: NextFunction) => {
    const { city, country, units } = req.query as { city?: string; country?: string; units?: string };
    const cityName = capitalize(city)
    if (!city) throw new ErrorHandler(400, "city is required");

    const current = await weatherService.getCurrentByCity(cityName, country, units);
    const forecast = await weatherService.getForecastByCity(cityName, country, units);
    
    // Use case-insensitive search for city names
    let cityDoc = await City.findOne({
      name: { $regex: new RegExp(`^${cityName}$`, 'i') }
    });
    
    // If city doesn't exist in DB, add it automatically
    if (!cityDoc) {
      console.log(`City ${cityName} not found in DB, adding it automatically`);
      
      // Extract state from country if it's in format "City, State"
     
      
      // Create new city document
      cityDoc = new City({
        name: cityName,
        state: current?.sys.country,
        searchCount: 1,
        lastSearched: new Date()
      });
      
      await cityDoc.save();
      console.log(`City ${cityName} added to database with ID: ${cityDoc._id}`);
    } else {
      await cityDoc.save();
    }
    
    res.json({ 
      success: true, 
      data: { 
        id: cityDoc._id,
        city: current.name,
        country: current.sys?.country,
        state: cityDoc.state,
        current,
        forecast
      }
    });
  });

  const autoSuggest = TryCatch(async (req: Request, res: Response, _next: NextFunction) => {
    const { query, limit = "10" } = req.query as { query?: string; limit?: string };
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchQuery = query.trim().toLowerCase();
    const limitNum = parseInt(limit);

    // Search for cities that start with the query
    const cities = await City.find({
      $or: [
        { name: { $regex: `^${searchQuery}`, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .sort({ searchCount: -1, name: 1 })
    .limit(limitNum)
    .select('name state');

    res.json({ success: true, data: cities });
  });

  const addCity = TryCatch(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, state } = req.body as { name?: string; state?: string };
    if (!name) throw new ErrorHandler(400, "City name is required");

    const cityName = name.trim();
    const cityState = state?.trim();

    // Check if city already exists (case-insensitive)
    const existingCity = await City.findOne({
      name: { $regex: new RegExp(`^${cityName}$`, 'i') },
      state: cityState ? { $regex: new RegExp(`^${cityState}$`, 'i') } : null
    });

    if (existingCity) {
      return res.json({ 
        success: true, 
        message: "City already exists",
        data: existingCity 
      });
    }

    // Add new city
    const newCity = new City({
      name: cityName,
      state: cityState,
      searchCount: 0,
      lastSearched: new Date()
    });

    await newCity.save();

    res.json({ 
      success: true, 
      message: "City added successfully",
      data: newCity 
    });
  });

  const getPopularCities = TryCatch(async (req: Request, res: Response, _next: NextFunction) => {
    const { limit } = req.query as { limit?: string };
    const limitNum = limit ? parseInt(limit) : 10;
    const cities = await weatherService.getPopularCities(limitNum);
    res.json({ success: true, data: cities });
  });

  const getRecentlySearched = TryCatch(async (req: Request, res: Response, _next: NextFunction) => {
    const { limit } = req.query as { limit?: string };
    const limitNum = limit ? parseInt(limit) : 10;
    const cities = await weatherService.getRecentlySearchedCities(limitNum);
    res.json({ success: true, data: cities });
  });

  return { searchCity, autoSuggest, addCity, getPopularCities, getRecentlySearched };
};
