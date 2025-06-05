
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { waveDataTable } from '../db/schema';
import { getMarineConditions } from '../handlers/get_marine_conditions';

describe('getMarineConditions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return marine conditions with current data', async () => {
    // Create test wave data
    const testTimestamp = new Date('2024-01-15T12:00:00Z');
    await db.insert(waveDataTable)
      .values({
        location: 'Coyote Point',
        timestamp: testTimestamp,
        wave_height: '3.5',
        wind_speed: '15.2',
        wind_direction: 270
      })
      .execute();

    const result = await getMarineConditions('Coyote Point');

    expect(result.location).toBe('Coyote Point');
    expect(result.current_conditions.wave_height).toBe(3.5);
    expect(result.current_conditions.wind_speed).toBe(15.2);
    expect(result.current_conditions.wind_direction).toBe(270);
    expect(result.current_conditions.timestamp).toEqual(testTimestamp);
    expect(result.forecast).toHaveLength(1);
    expect(typeof result.forecast[0].wave_height).toBe('number');
    expect(typeof result.forecast[0].wind_speed).toBe('number');
  });

  it('should return null conditions when no data exists', async () => {
    const result = await getMarineConditions('Unknown Location');

    expect(result.location).toBe('Unknown Location');
    expect(result.current_conditions.wave_height).toBeNull();
    expect(result.current_conditions.wind_speed).toBeNull();
    expect(result.current_conditions.wind_direction).toBeNull();
    expect(result.current_conditions.timestamp).toBeNull();
    expect(result.forecast).toHaveLength(0);
  });

  it('should return multiple forecast entries ordered by timestamp', async () => {
    // Create multiple wave data entries
    const baseTime = new Date('2024-01-15T12:00:00Z');
    
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(baseTime.getTime() + (i * 60 * 60 * 1000)); // Each hour apart
      await db.insert(waveDataTable)
        .values({
          location: 'Half Moon Bay',
          timestamp: timestamp,
          wave_height: (2.0 + i * 0.5).toString(),
          wind_speed: (10.0 + i * 2).toString(),
          wind_direction: 180 + (i * 30)
        })
        .execute();
    }

    const result = await getMarineConditions('Half Moon Bay');

    expect(result.location).toBe('Half Moon Bay');
    expect(result.forecast).toHaveLength(5);
    
    // Verify forecast is ordered by most recent first
    expect(result.forecast[0].wave_height).toBe(4.0); // Last entry (i=4)
    expect(result.forecast[1].wave_height).toBe(3.5); // Second to last (i=3)
    
    // Verify current conditions match the most recent entry
    expect(result.current_conditions.wave_height).toBe(4.0);
    expect(result.current_conditions.wind_speed).toBe(18.0);
    expect(result.current_conditions.wind_direction).toBe(300);
  });

  it('should handle numeric conversions correctly', async () => {
    await db.insert(waveDataTable)
      .values({
        location: 'Test Beach',
        timestamp: new Date(),
        wave_height: '12.75',
        wind_speed: '25.33',
        wind_direction: 45
      })
      .execute();

    const result = await getMarineConditions('Test Beach');

    // Verify types are numbers, not strings
    expect(typeof result.current_conditions.wave_height).toBe('number');
    expect(typeof result.current_conditions.wind_speed).toBe('number');
    expect(typeof result.current_conditions.wind_direction).toBe('number');
    
    // Verify values are correctly parsed
    expect(result.current_conditions.wave_height).toBe(12.75);
    expect(result.current_conditions.wind_speed).toBe(25.33);
    expect(result.current_conditions.wind_direction).toBe(45);
    
    // Verify forecast data types
    expect(typeof result.forecast[0].wave_height).toBe('number');
    expect(typeof result.forecast[0].wind_speed).toBe('number');
    expect(result.forecast[0].wave_height).toBe(12.75);
    expect(result.forecast[0].wind_speed).toBe(25.33);
  });
});
