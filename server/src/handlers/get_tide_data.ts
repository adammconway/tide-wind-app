
import { db } from '../db';
import { tideDataTable } from '../db/schema';
import { type LocationQueryInput, type TideData } from '../schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export const getTideData = async (input: LocationQueryInput): Promise<TideData[]> => {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    // Always filter by location
    conditions.push(eq(tideDataTable.location, input.location));

    // Add optional time range filters
    if (input.start_time) {
      conditions.push(gte(tideDataTable.timestamp, input.start_time));
    }

    if (input.end_time) {
      conditions.push(lte(tideDataTable.timestamp, input.end_time));
    }

    // Build and execute query
    const results = await db.select()
      .from(tideDataTable)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(tideDataTable.timestamp)
      .execute();

    // Convert numeric fields back to numbers and ensure type is properly typed
    return results.map(tide => ({
      ...tide,
      height: parseFloat(tide.height),
      type: tide.type as 'high' | 'low' | 'rising' | 'falling'
    }));
  } catch (error) {
    console.error('Tide data retrieval failed:', error);
    throw error;
  }
};
