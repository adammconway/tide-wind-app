
import { db } from '../db';
import { waveDataTable } from '../db/schema';
import { type MarineConditions } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getMarineConditions = async (location: string): Promise<MarineConditions> => {
  try {
    // Get the most recent wave data for current conditions
    const currentConditionsQuery = await db.select()
      .from(waveDataTable)
      .where(eq(waveDataTable.location, location))
      .orderBy(desc(waveDataTable.timestamp))
      .limit(1)
      .execute();

    // Get forecast data (next 24 hours of data)
    const forecastQuery = await db.select()
      .from(waveDataTable)
      .where(eq(waveDataTable.location, location))
      .orderBy(desc(waveDataTable.timestamp))
      .limit(24)
      .execute();

    // Process current conditions
    const currentData = currentConditionsQuery[0];
    const current_conditions = currentData ? {
      wave_height: parseFloat(currentData.wave_height),
      wind_speed: parseFloat(currentData.wind_speed),
      wind_direction: currentData.wind_direction,
      timestamp: currentData.timestamp
    } : {
      wave_height: null,
      wind_speed: null,
      wind_direction: null,
      timestamp: null
    };

    // Process forecast data - convert numeric fields
    const forecast = forecastQuery.map(data => ({
      ...data,
      wave_height: parseFloat(data.wave_height),
      wind_speed: parseFloat(data.wind_speed)
    }));

    return {
      location,
      current_conditions,
      forecast
    };
  } catch (error) {
    console.error('Failed to get marine conditions:', error);
    throw error;
  }
};
