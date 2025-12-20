import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            return NextResponse.json({ error: 'Club ID required' }, { status: 400 });
        }

        const supabase = createClient();

        // Get tomorrow's date and day of week
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayOfWeek = tomorrow.getDay(); // 0=Sunday, 6=Saturday
        const targetHour = 18; // Peak hour (6 PM)

        // 1. Get historical average for this day/hour
        const { data: historicalData } = await supabase
            .rpc('get_historical_average', {
                p_club_id: clubId,
                p_day_of_week: dayOfWeek,
                p_hour: targetHour
            });

        const historicalAvg = historicalData || 65; // Default to 65% if no data

        // 2. Get weather forecast (using weather service)
        const { getCurrentWeather, getWeatherImpact } = await import('@/lib/weather-service');
        const weather = await getCurrentWeather('Amsterdam'); // TODO: Get from club settings
        const weatherCondition = weather?.condition || 'sunny';
        const temperature = weather?.temperature || 18;

        // 3. Calculate prediction with weather adjustment
        const weatherMultiplier = getWeatherImpact(weather || {
            condition: 'sunny',
            temperature: 18,
            precipitation: 0,
            windSpeed: 0,
            description: ''
        }, true); // true = indoor courts

        let predictedOccupancy = historicalAvg * weatherMultiplier;

        // 4. Day type adjustment
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend) {
            predictedOccupancy = Math.min(100, predictedOccupancy * 1.2); // +20% on weekends
        }

        // 5. Calculate confidence based on data availability
        const confidence = calculateConfidence(historicalAvg, weatherCondition);

        // 6. Generate recommendation
        const recommendation = generateRecommendation(predictedOccupancy, weatherCondition);

        // 7. Cache the prediction
        await supabase
            .from('occupancy_predictions')
            .upsert({
                club_id: clubId,
                prediction_date: tomorrow.toISOString().split('T')[0],
                hour: targetHour,
                predicted_occupancy: predictedOccupancy,
                confidence_level: confidence,
                factors: {
                    historical: historicalAvg,
                    weather: weatherCondition,
                    dayType: isWeekend ? 'weekend' : 'weekday',
                    weatherMultiplier: weatherMultiplier
                },
                recommended_staff: Math.ceil(predictedOccupancy / 25) // 1 staff per 25% occupancy
            }, {
                onConflict: 'club_id,prediction_date,hour'
            });

        return NextResponse.json({
            predictedOccupancy: Math.round(predictedOccupancy),
            confidence: confidence,
            recommendation: recommendation,
            weatherCondition: weatherCondition,
            temperature: temperature,
            factors: {
                historical: Math.round(historicalAvg),
                weather: weatherCondition,
                dayType: isWeekend ? 'Weekend' : 'Doordeweeks'
            }
        });

    } catch (error) {
        console.error('Forecast API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate forecast' },
            { status: 500 }
        );
    }
}

// Calculate confidence based on data quality
function calculateConfidence(historicalAvg: number, weather: string): number {
    let confidence = 60; // Base confidence

    // Historical data available
    if (historicalAvg > 0) {
        confidence += 20; // +20% for having historical data
    }

    // Weather data available
    if (weather) {
        confidence += 10; // +10% for weather data
    }

    // Bonus for high data quality (would need to track data points count)
    // This is a simplified version
    confidence += 5;

    return Math.min(95, confidence); // Cap at 95% (never 100% certain)
}

// Generate actionable recommendation
function generateRecommendation(occupancy: number, weather: string): string {
    if (occupancy >= 85) {
        return "Plan extra personeel in. Verwacht hoge drukte - overweeg premium pricing.";
    } else if (occupancy >= 70) {
        return "Normale bezetting verwacht. Standaard personeelsbezetting is voldoende.";
    } else if (occupancy >= 50) {
        return "Gemiddelde drukte. Overweeg een promotie om bezetting te verhogen.";
    } else {
        if (weather === 'rainy') {
            return "Lage bezetting ondanks regen. Stuur een 'Regendag Korting' push notificatie.";
        }
        return "Rustige dag verwacht. Perfect voor onderhoud of marketing campagnes.";
    }
}
