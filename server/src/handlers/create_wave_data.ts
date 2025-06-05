
import { db } from '../db';
import { waveDataTable } from '../db/schema';
import { type CreateWaveDataInput, type WaveData } from '../schema';

export const createWaveData = async (input: CreateWaveDataInput): Promise<WaveData> => {
  try {
    // Insert wave data record
    const result = await db.insert(waveDataTable)
      .values({
        location: input.location,
        timestamp: input.timestamp,
        wave_height: input.wave_height.toString(), // Convert number to string for numeric column
        wind_speed: input.wind_speed.toString(), // Convert number to string for numeric column
        wind_direction: input.wind_direction // Integer column - no conversion needed
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const waveData = result[0];
    return {
      ...waveData,
      wave_height: parseFloat(waveData.wave_height), // Convert string back to number
      wind_speed: parseFloat(waveData.wind_speed) // Convert string back to number
    };
  } catch (error) {
    console.error('Wave data creation failed:', error);
    throw error;
  }
};
