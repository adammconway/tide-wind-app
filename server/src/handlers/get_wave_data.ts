
import { db } from '../db';
import { waveDataTable } from '../db/schema';
import { type WaveData, type LocationQueryInput } from '../schema';
import { eq, gte, lte, and, desc } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';

export const getWaveData = async (input: LocationQueryInput): Promise<WaveData[]> => {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    // Always filter by location
    conditions.push(eq(waveDataTable.location, input.location));

    // Add date range filters if provided
    if (input.start_time) {
      conditions.push(gte(waveDataTable.timestamp, input.start_time));
    }

    if (input.end_time) {
      conditions.push(lte(waveDataTable.timestamp, input.end_time));
    }

    // Build and execute query
    const results = await db.select()
      .from(waveDataTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(waveDataTable.timestamp))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(result => ({
      ...result,
      wave_height: parseFloat(result.wave_height),
      wind_speed: parseFloat(result.wind_speed)
    }));
  } catch (error) {
    console.error('Wave data retrieval failed:', error);
    throw error;
  }
};
