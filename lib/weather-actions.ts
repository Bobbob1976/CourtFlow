// PHASE 2: Growth Features - Weather Actions
// Server-side functions for interacting with the OpenWeatherMap API.

interface WeatherForecast {
  isRaining: boolean;
  details: {
    main: string;
    description: string;
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
  };
}

/**
 * Fetches the weather forecast for a given city.
 * @param cityName The name of the city.
 * @returns A promise that resolves to a WeatherForecast object.
 */
export async function getWeatherForecast(
  cityName: string
): Promise<{ success: boolean; data?: WeatherForecast; error?: string }> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    // Mock implementation for development when API key is not available
    console.warn("OPENWEATHERMAP_API_KEY is not set. Using mock data.");
    return {
      success: true,
      data: {
        isRaining: true, // Assume it's raining for testing the rain-check feature
        details: {
          main: "Rain",
          description: "moderate rain",
          temperature: 15,
          feels_like: 14,
          humidity: 80,
          wind_speed: 5,
        },
      },
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.status !== 200) {
      return { success: false, error: data.message || "Failed to fetch weather data" };
    }

    const isRaining = data.weather[0]?.main.toLowerCase().includes("rain");

    const forecast: WeatherForecast = {
      isRaining,
      details: {
        main: data.weather[0]?.main,
        description: data.weather[0]?.description,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
      },
    };

    return { success: true, data: forecast };
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
