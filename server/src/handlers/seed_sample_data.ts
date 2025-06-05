
import { db } from '../db';
import { tideDataTable, waveDataTable } from '../db/schema';

export const seedSampleData = async (): Promise<{ message: string; tideCount: number; waveCount: number }> => {
  try {
    // Sample tide data for Coyote Point
    const tideData = [
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-15T06:30:00Z'),
        height: '2.5',
        type: 'high'
      },
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-15T12:45:00Z'),
        height: '0.8',
        type: 'low'
      },
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-15T18:20:00Z'),
        height: '3.1',
        type: 'high'
      },
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-16T01:15:00Z'),
        height: '0.3',
        type: 'low'
      },
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-16T07:00:00Z'),
        height: '2.8',
        type: 'high'
      }
    ];

    // Sample wave data for various beaches
    const waveData = [
      {
        location: 'Ocean Beach',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        wave_height: '4.5',
        wind_speed: '12.3',
        wind_direction: 225
      },
      {
        location: 'Ocean Beach',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        wave_height: '5.2',
        wind_speed: '15.7',
        wind_direction: 240
      },
      {
        location: 'Pacifica',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        wave_height: '3.8',
        wind_speed: '10.5',
        wind_direction: 230
      },
      {
        location: 'Pacifica',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        wave_height: '4.1',
        wind_speed: '13.2',
        wind_direction: 245
      },
      {
        location: 'Half Moon Bay',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        wave_height: '6.0',
        wind_speed: '18.5',
        wind_direction: 250
      },
      {
        location: 'Half Moon Bay',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        wave_height: '6.8',
        wind_speed: '20.1',
        wind_direction: 255
      },
      {
        location: 'Santa Cruz',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        wave_height: '3.2',
        wind_speed: '8.9',
        wind_direction: 210
      },
      {
        location: 'Santa Cruz',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        wave_height: '3.7',
        wind_speed: '11.4',
        wind_direction: 220
      }
    ];

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
