
import { db } from '../db';
import { tideDataTable } from '../db/schema';
import { type TideData } from '../schema';
import { eq } from 'drizzle-orm';

export const getCoyotePointTides = async (): Promise<TideData[]> => {
  try {
    const results = await db.select()
      .from(tideDataTable)
      .where(eq(tideDataTable.location, 'Coyote Point'))
      .execute();

    // Convert numeric fields back to numbers and ensure proper typing
    return results.map(result => ({
      ...result,
      height: parseFloat(result.height),
      type: result.type as 'high' | 'low' | 'rising' | 'falling'
    }));
  } catch (error) {
    console.error('Failed to fetch Coyote Point tides:', error);
    throw error;
  }
};
