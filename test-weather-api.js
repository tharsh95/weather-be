#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const TEST_CITY = 'London';
const TIMEOUT = 10000;

if (!API_KEY) {
  console.error('❌ OPENWEATHER_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🧪 Testing Weather API connectivity...\n');

async function testWeatherAPI() {
  const url = 'https://api.openweathermap.org/data/2.5/weather';
  const params = { q: TEST_CITY, appid: API_KEY, units: 'metric' };
  
  try {
    console.log(`📍 Testing with city: ${TEST_CITY}`);
    console.log(`⏱️  Timeout set to: ${TIMEOUT}ms`);
    console.log(`🔗 URL: ${url}\n`);
    
    const startTime = Date.now();
    
    const response = await axios.get(url, {
      params,
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'WeatherApp-Test/1.0'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ API call successful!');
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`🌡️  Temperature: ${response.data.main?.temp}°C`);
    console.log(`🌤️  Weather: ${response.data.weather?.[0]?.main}`);
    console.log(`🏙️  City: ${response.data.name}`);
    console.log(`🌍 Country: ${response.data.sys?.country}`);
    
  } catch (error) {
    console.error('❌ API call failed!');
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timed out');
      console.error(`💡 Try increasing the timeout value (currently ${TIMEOUT}ms)`);
    } else if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📝 Message: ${error.response.data?.message || 'No message'}`);
      
      if (error.response.status === 401) {
        console.error('🔑 Invalid API key - check your OPENWEATHER_API_KEY');
      } else if (error.response.status === 429) {
        console.error('🚫 Rate limit exceeded - too many requests');
      } else if (error.response.status >= 500) {
        console.error('🔧 Server error - OpenWeather API might be down');
      }
    } else if (error.request) {
      console.error('🌐 Network error - check your internet connection');
    } else {
      console.error('❓ Unknown error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testWeatherAPI();
