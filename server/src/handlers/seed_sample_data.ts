import { db } from '../db';
import { tideDataTable, waveDataTable } from '../db/schema';

export const seedSampleData = async (): Promise<{ message: string; tideCount: number; waveCount: number }> => {
  try {
    const now = new Date();
    
    // Generate tide data for the next 48 hours (every 6 hours)
    const tideData = [];
    for (let i = 0; i < 8; i++) {
      const timestamp = new Date(now.getTime() + (i * 6 * 60 * 60 * 1000)); // Every 6 hours
      const baseHeight = 3; // Base tide height
      const variation = Math.sin((i * Math.PI) / 4) * 2; // Sine wave variation
      const height = baseHeight + variation;
      
      tideData.push({
        location: 'Coyote Point',
        timestamp,
        height: height.toFixed(1),
        type: 'predicted' as const
      });
    }

    // Sample wave data for various beaches with recent timestamps
    const locations = ['Asilomar State Beach', 'Lovers Point', 'Ocean Beach', 'Pacifica', 'Half Moon Bay', 'Santa Cruz'];
    const waveData = [];
    
    for (const location of locations) {
      // Current conditions
      waveData.push({
        location,
        timestamp: new Date(now.getTime() - (30 * 60 * 1000)), // 30 minutes ago
        wave_height: (Math.random() * 4 + 2).toFixed(1), // 2-6 feet
        wind_speed: (Math.random() * 15 + 5).toFixed(1), // 5-20 mph
        wind_direction: Math.floor(Math.random() * 360)
      });
      
      // Forecast data (next 12 hours, every 3 hours)
      for (let i = 1; i <= 4; i++) {
        const forecastTime = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000));
        waveData.push({
          location,
          timestamp: forecastTime,
          wave_height: (Math.random() * 4 + 2).toFixed(1),
          wind_speed: (Math.random() * 15 + 5).toFixed(1),
          wind_direction: Math.floor(Math.random() * 360)
        });
      }
    }

    // Insert tide data
    const tideResults = await db.insert(tideDataTable)
      .values(tideData)
      .returning()
      .execute();

    // Insert wave data
    const waveResults = await db.insert(waveDataTable)
      .values(waveData)
      .returning()
      .execute();

    return {
      message: 'Sample data seeded successfully',
      tideCount: tideResults.length,
      waveCount: waveResults.length
    };
  } catch (error) {
    console.error('Sample data seeding failed:', error);
    throw error;
  }
};