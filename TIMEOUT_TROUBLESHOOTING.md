# Timeout Troubleshooting Guide

## Problem
You were experiencing timeout errors with the message:
```json
{"success":false,"message":"Command timed out","error":{"statusCode":500}}
```

## Root Causes
1. **No timeout configuration** on axios requests to OpenWeather API
2. **No request timeout handling** in Express app
3. **External API dependency** on OpenWeather which could be slow/unresponsive
4. **No retry mechanism** for temporary failures

## Solutions Implemented

### 1. Axios Timeout Configuration
- Added 10-second timeout to all weather API calls
- Prevents requests from hanging indefinitely

```typescript
const AXIOS_TIMEOUT = 10000; // 10 seconds
const AXIOS_CONFIG = {
  timeout: AXIOS_TIMEOUT,
  headers: {
    'User-Agent': 'WeatherApp/1.0'
  }
};
```

### 2. Express Request Timeout Middleware
- Added 30-second timeout for all incoming requests
- Returns 408 status code for timed-out requests

```typescript
app.use((req, res, next) => {
  const timeout = 30000; // 30 seconds
  req.setTimeout(timeout, () => {
    res.status(408).json({
      success: false,
      message: "Request timeout",
      error: { statusCode: 408 }
    });
  });
  next();
});
```

### 3. Controller-Level Timeout Handling
- Added 25-second timeout for weather data fetching
- Uses Promise.race to prevent hanging

```typescript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Request timeout')), 25000);
});

const [current, forecast] = await Promise.race([
  Promise.all([
    weatherService.getCurrentByCity(cityName, country, units),
    weatherService.getForecastByCity(cityName, country, units)
  ]),
  timeoutPromise
]);
```

### 4. Retry Mechanism with Exponential Backoff
- Automatically retries failed requests up to 2 times
- Implements exponential backoff (1s, 2s delays)
- Only retries on server errors (5xx), not client errors (4xx)

```typescript
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
```

### 5. Enhanced Error Handling
- Specific error messages for different failure types
- Better logging and debugging information
- Graceful fallbacks when Redis fails

## Testing the Fixes

### 1. Test Weather API Connectivity
```bash
npm run test:api
```

This will test:
- API key validity
- Network connectivity
- Response times
- Error handling

### 2. Health Check Endpoint
```bash
curl http://localhost:3000/health
```

Checks:
- Redis connection status
- MongoDB connection status
- Overall service health

### 3. Monitor Logs
Watch for these log messages:
- `Request timeout: Weather API took too long to respond`
- `Rate limit exceeded: Too many requests to weather API`
- `Weather API server error: [status]`

## Configuration Options

### Timeout Values (in milliseconds)
- **Axios timeout**: 10 seconds (configurable in `AXIOS_TIMEOUT`)
- **Express request timeout**: 30 seconds (configurable in app.ts)
- **Controller timeout**: 25 seconds (configurable in cities.ts)
- **Retry attempts**: 2 (configurable in `MAX_RETRIES`)
- **Retry delay**: 1 second (configurable in `RETRY_DELAY`)

### Environment Variables
```bash
OPENWEATHER_API_KEY=your_api_key_here
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017
```

## Common Issues and Solutions

### 1. Still Getting Timeouts
- Check if OpenWeather API is down: https://status.openweathermap.org/
- Verify your API key is valid
- Check network connectivity
- Increase timeout values if needed

### 2. Rate Limiting
- OpenWeather free tier: 60 calls/minute
- Implement request queuing if needed
- Use caching more aggressively

### 3. Redis Connection Issues
- Check if Redis is running
- Verify Redis URL configuration
- Service will continue working without Redis (with warnings)

### 4. MongoDB Connection Issues
- Check if MongoDB is running
- Verify connection string
- Service will fail if MongoDB is unavailable

## Monitoring and Alerts

### Log Patterns to Watch
```
[WARN] Redis get failed for key current:london:metric
[WARN] Cache read failed, proceeding with API call
[ERROR] Error tracking city search
```

### Performance Metrics
- Response times for weather API calls
- Cache hit/miss ratios
- Retry attempt counts
- Timeout occurrence frequency

## Best Practices

1. **Always use timeouts** for external API calls
2. **Implement retry logic** with exponential backoff
3. **Use caching** to reduce API calls
4. **Monitor and log** all failures
5. **Graceful degradation** when services are unavailable
6. **Health checks** for all dependencies

## Support

If you continue to experience timeout issues:
1. Run the test script: `npm run test:api`
2. Check the health endpoint: `/health`
3. Review server logs for specific error messages
4. Verify OpenWeather API status
5. Check your network connectivity and firewall settings
