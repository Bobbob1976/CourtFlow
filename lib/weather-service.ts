// Weather Service for Admin Intelligence
// Uses Open-Meteo API (100% FREE - no API key needed!)

interface WeatherData {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    temperature: number;
    precipitation: number;
    windSpeed: number;
    description: string;
}

interface ForecastData {
    date: string;
    hour: number;
    weather: WeatherData;
}

/**
 * Fetch current weather using Open-Meteo (FREE!)
 * No API key required!
 */
export async function getCurrentWeather(location: string): Promise<WeatherData | null> {
    try {
        // Get coordinates for location (hardcoded for now - Amsterdam)
        // TODO: Add geocoding or get from club settings
        const lat = 52.3676; // Amsterdam
        const lon = 4.9041;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`,
            { next: { revalidate: 1800 } } // Cache for 30 minutes
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        const current = data.current;

        return {
            condition: mapWeatherCode(current.weather_code),
            temperature: Math.round(current.temperature_2m),
            precipitation: current.precipitation || 0,
            windSpeed: current.wind_speed_10m,
            description: getWeatherDescription(current.weather_code)
        };

    } catch (error) {
        console.error('Weather API error:', error);
        return getMockWeather();
    }
}

/**
 * Fetch weather forecast using Open-Meteo (FREE!)
 */
export async function getWeatherForecast(location: string): Promise<ForecastData[]> {
    try {
        const lat = 52.3676; // Amsterdam
        const lon = 4.9041;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&forecast_days=2&timezone=auto`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }

        const data = await response.json();
        const hourly = data.hourly;

        // Get next 24 hours
        return hourly.time.slice(0, 24).map((time: string, idx: number) => ({
            date: time.split('T')[0],
            hour: new Date(time).getHours(),
            weather: {
                condition: mapWeatherCode(hourly.weather_code[idx]),
                temperature: Math.round(hourly.temperature_2m[idx]),
                precipitation: hourly.precipitation[idx] || 0,
                windSpeed: hourly.wind_speed_10m[idx],
                description: getWeatherDescription(hourly.weather_code[idx])
            }
        }));

    } catch (error) {
        console.error('Forecast API error:', error);
        return getMockForecast();
    }
}

/**
 * Map Open-Meteo weather codes to our simplified conditions
 * https://open-meteo.com/en/docs
 */
function mapWeatherCode(code: number): WeatherData['condition'] {
    if (code === 0 || code === 1) return 'sunny'; // Clear sky, mainly clear
    if (code === 2 || code === 3) return 'cloudy'; // Partly cloudy, overcast
    if (code >= 51 && code <= 67) return 'rainy'; // Drizzle, rain
    if (code >= 71 && code <= 77) return 'snowy'; // Snow
    if (code >= 80 && code <= 82) return 'rainy'; // Rain showers
    if (code >= 85 && code <= 86) return 'snowy'; // Snow showers
    if (code >= 95 && code <= 99) return 'rainy'; // Thunderstorm
    return 'cloudy'; // Default
}

/**
 * Get weather description from code
 */
function getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}

/**
 * Mock weather data for development/fallback
 */
function getMockWeather(): WeatherData {
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
        condition: randomCondition,
        temperature: Math.floor(Math.random() * 15) + 10, // 10-25°C
        precipitation: randomCondition === 'rainy' ? Math.random() * 5 : 0,
        windSpeed: Math.random() * 10,
        description: randomCondition === 'rainy' ? 'Light rain' : randomCondition === 'cloudy' ? 'Partly cloudy' : 'Clear sky'
    };
}

/**
 * Mock forecast data for development/fallback
 */
function getMockForecast(): ForecastData[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    return Array.from({ length: 24 }, (_, i) => ({
        date: dateStr,
        hour: i,
        weather: getMockWeather()
    }));
}

/**
 * Get weather impact on occupancy
 * Returns a multiplier (0.5 - 1.15) based on weather conditions
 */
export function getWeatherImpact(weather: WeatherData, isIndoor: boolean = true): number {
    if (isIndoor) {
        // Indoor courts benefit from bad weather
        if (weather.condition === 'rainy') return 1.15; // +15% on rainy days
        if (weather.condition === 'snowy') return 1.10; // +10% on snowy days
        return 1.0;
    } else {
        // Outdoor courts suffer from bad weather
        if (weather.condition === 'rainy') return 0.5; // -50% on rainy days
        if (weather.condition === 'snowy') return 0.3; // -70% on snowy days
        if (weather.condition === 'cloudy') return 0.9; // -10% on cloudy days
        return 1.0;
    }
}
