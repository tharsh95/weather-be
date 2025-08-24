import { Request, Response } from "express";
import { User } from "@/models/user.js";
import { City } from "@/models/city.js";
import { WeatherService } from "@/utils/weatherService.js";
import ErrorHandler from "@/utils/errorHandler.js";
import bcrypt from "bcrypt";

export const buildUserControllers = (weatherService: WeatherService) => {
  // Login user
  const login = async (req: Request, res: Response) => {
    console.log(req.body)
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new ErrorHandler(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorHandler(401, "Invalid email or password");
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ErrorHandler(401, "Invalid email or password");
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        favoriteCities: user.favoriteCities
      }
    });
  };

  // Register a new user
  const register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      throw new ErrorHandler(400, "Email, name, and password are required");
    }

    // Password validation
    if (password.length < 8) {
      throw new ErrorHandler(400, "Password must be at least 8 characters long");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ErrorHandler(400, "Please provide a valid email address");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ErrorHandler(400, "User already exists");
    }

    // Hash password with salt rounds of 12
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ 
      email, 
      name, 
      password: hashedPassword 
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        favoriteCities: []
      }
    });
  };

  // Get user profile with favorite cities
  const getProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('favoriteCities');
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    res.json({
      success: true,
      data: user
    });
  };

  // Add city to favorites
  const addToFavorites = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { cityId } = req.body;

    if (!cityId) {
      throw new ErrorHandler(400, "City ID is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    const city = await City.findById(cityId);
    if (!city) {
      throw new ErrorHandler(404, "City not found");
    }

    // Check if city is already in favorites
    if (user.favoriteCities.some(id => id.toString() === cityId)) {
      throw new ErrorHandler(400, "City is already in favorites");
    }

    user.favoriteCities.push(cityId);
    await user.save();

    const updatedUser = await User.findById(userId).populate('favoriteCities');

    res.json({
      success: true,
      data: updatedUser
    });
  };

  // Remove city from favorites
  const removeFromFavorites = async (req: Request, res: Response) => {
    const { userId, cityId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    const cityIndex = user.favoriteCities.findIndex(id => id.toString() === cityId);
    if (cityIndex === -1) {
      throw new ErrorHandler(400, "City is not in favorites");
    }

    user.favoriteCities.splice(cityIndex, 1);
    await user.save();

    const updatedUser = await User.findById(userId).populate('favoriteCities');

    res.json({
      success: true,
      data: updatedUser
    });
  };

  // Get user's favorite cities
  const getFavorites = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('favoriteCities');
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    res.json({
      success: true,
      data: user.favoriteCities
    });
  };

  // Get weather for all favorite cities
  const getFavoritesWithWeather = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { units = "metric" } = req.query;

    const user = await User.findById(userId).populate('favoriteCities');
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    try {
      const favoritesWithWeather = await Promise.all(
        user.favoriteCities.map(async (city: any) => {
          try {
            const currentWeather = await weatherService.getCurrentByCity(city.name, city.state, units as string);
            return {
              city: {
                id: city._id,
                name: city.name,
                state: city.state
              },
              current: currentWeather
            };
          } catch (error) {
            return {
              city: {
                id: city._id,
                name: city.name,
                state: city.state
              },
              current: null,
              error: "Failed to fetch weather"
            };
          }
        })
      );

      res.json({
        success: true,
        data: favoritesWithWeather
      });
    } catch (error: any) {
      throw new ErrorHandler(500, `Failed to fetch weather for favorites: ${error.message}`);
    }
  };

  // Get weather for a favorite city
  const getFavoriteCityWeather = async (req: Request, res: Response) => {
    const { userId, cityId } = req.params;
    const { units = "metric" } = req.query;

    // Verify user exists and has this city in favorites
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    if (!user.favoriteCities.some(id => id.toString() === cityId)) {
      throw new ErrorHandler(400, "City is not in user's favorites");
    }

    // Get city details
    const city = await City.findById(cityId);
    if (!city) {
      throw new ErrorHandler(404, "City not found");
    }

    try {
      // Use the units from query params and city state
      const current = await weatherService.getCurrentByCity(city.name, city.state, units as string);
      const forecast = await weatherService.getForecastByCity(city.name, city.state, units as string);
      
      console.log(`Favorite city weather for ${city.name}:`, {
        cityId,
        cityName: city.name,
        cityState: city.state,
        units,
        currentData: !!current,
        forecastData: !!forecast
      });

      res.json({ 
        success: true, 
        data: { 
          id: city._id,
          city: city.name,
          state: city.state,
          country: current.sys?.country,
          current,
          forecast 
        }
      });
    } catch (error: any) {
      console.error(`Error fetching weather for favorite city ${city.name}:`, error);
      throw new ErrorHandler(500, `Failed to fetch weather: ${error.message}`);
    }
  };

  return {
    login,
    register,
    getProfile,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    getFavoritesWithWeather,
    getFavoriteCityWeather
  };
};