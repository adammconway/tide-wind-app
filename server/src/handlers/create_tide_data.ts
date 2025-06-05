
import { db } from '../db';
import { tideDataTable } from '../db/schema';
import { type CreateTideDataInput, type TideData } from '../schema';

export const createTideData = async (input: CreateTideDataInput): Promise<TideData> => {
  try {
    // Insert tide data record
    const result = await db.insert(tideDataTable)
      .values({
        location: input.location,
        timestamp: input.timestamp,
        height: input.height.toString(), // Convert number to string for numeric column
        type: input.type
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers and ensure type safety
    const tideData = result[0];
    return {
      ...tideData,
      height: parseFloat(tideData.height), // Convert string back to number
      type: tideData.type as 'high' | 'low' | 'rising' | 'falling' // Cast to proper enum type
    };
  } catch (error) {
    console.error('Tide data creation failed:', error);
    throw error;
  }
};
