
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { waveDataTable } from '../db/schema';
import { type CreateWaveDataInput, type LocationQueryInput } from '../schema';
import { getWaveData } from '../handlers/get_wave_data';

// Test data setup
const testWaveData: CreateWaveDataInput = {
  location: 'Pacifica',
  timestamp: new Date('2024-01-15T10:00:00Z'),
  wave_height: 6.5,
  wind_speed: 15.2,
  wind_direction: 270
};

const testWaveData2: CreateWaveDataInput = {
  location: 'Pacifica',
  timestamp: new Date('2024-01-15T14:00:00Z'),
  wave_height: 7.8,
  wind_speed: 18.5,
  wind_direction: 285
};

const testWaveDataDifferentLocation: CreateWaveDataInput = {
  location: 'Half Moon Bay',
  timestamp: new Date('2024-01-15T12:00:00Z'),
  wave_height: 5.2,
  wind_speed: 12.8,
  wind_direction: 250
};

describe('getWaveData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get wave data for a specific location', async () => {
    // Create test data
    await db.insert(waveDataTable).values({
      location: testWaveData.location,
      timestamp: testWaveData.timestamp,
      wave_height: testWaveData.wave_height.toString(),
      wind_speed: testWaveData.wind_speed.toString(),
      wind_direction: testWaveData.wind_direction
    });

    await db.insert(waveDataTable).values({
      location: testWaveDataDifferentLocation.location,
      timestamp: testWaveDataDifferentLocation.timestamp,
      wave_height: testWaveDataDifferentLocation.wave_height.toString(),
      wind_speed: testWaveDataDifferentLocation.wind_speed.toString(),
      wind_direction: testWaveDataDifferentLocation.wind_direction
    });

    const input: LocationQueryInput = {
      location: 'Pacifica'
    };

    const results = await getWaveData(input);

    expect(results).toHaveLength(1);
    expect(results[0].location).toEqual('Pacifica');
    expect(results[0].wave_height).toEqual(6.5);
    expect(results[0].wind_speed).toEqual(15.2);
    expect(results[0].wind_direction).toEqual(270);
    expect(typeof results[0].wave_height).toBe('number');
    expect(typeof results[0].wind_speed).toBe('number');
  });

  it('should filter by date range', async () => {
    // Create multiple wave data entries with different timestamps
    await db.insert(waveDataTable).values({
      location: testWaveData.location,
      timestamp: testWaveData.timestamp,
      wave_height: testWaveData.wave_height.toString(),
      wind_speed: testWaveData.wind_speed.toString(),
      wind_direction: testWaveData.wind_direction
    });

    await db.insert(waveDataTable).values({
      location: testWaveData2.location,
      timestamp: testWaveData2.timestamp,
      wave_height: testWaveData2.wave_height.toString(),
      wind_speed: testWaveData2.wind_speed.toString(),
      wind_direction: testWaveData2.wind_direction
    });

    const input: LocationQueryInput = {
      location: 'Pacifica',
      start_time: new Date('2024-01-15T13:00:00Z'),
      end_time: new Date('2024-01-15T15:00:00Z')
    };

    const results = await getWaveData(input);

    expect(results).toHaveLength(1);
    expect(results[0].wave_height).toEqual(7.8);
    expect(results[0].timestamp).toEqual(new Date('2024-01-15T14:00:00Z'));
  });

  it('should return empty array for location with no data', async () => {
    const input: LocationQueryInput = {
      location: 'NonExistentLocation'
    };

    const results = await getWaveData(input);

    expect(results).toHaveLength(0);
  });

  it('should order results by timestamp descending', async () => {
    // Create wave data with different timestamps
    await db.insert(waveDataTable).values({
      location: testWaveData.location,
      timestamp: testWaveData.timestamp,
      wave_height: testWaveData.wave_height.toString(),
      wind_speed: testWaveData.wind_speed.toString(),
      wind_direction: testWaveData.wind_direction
    });

    await db.insert(waveDataTable).values({
      location: testWaveData2.location,
      timestamp: testWaveData2.timestamp,
      wave_height: testWaveData2.wave_height.toString(),
      wind_speed: testWaveData2.wind_speed.toString(),
      wind_direction: testWaveData2.wind_direction
    });

    const input: LocationQueryInput = {
      location: 'Pacifica'
    };

    const results = await getWaveData(input);

    expect(results).toHaveLength(2);
    // Most recent first (14:00 should come before 10:00)
    expect(results[0].timestamp).toEqual(new Date('2024-01-15T14:00:00Z'));
    expect(results[1].timestamp).toEqual(new Date('2024-01-15T10:00:00Z'));
  });

  it('should handle start_time filter only', async () => {
    await db.insert(waveDataTable).values({
      location: testWaveData.location,
      timestamp: testWaveData.timestamp,
      wave_height: testWaveData.wave_height.toString(),
      wind_speed: testWaveData.wind_speed.toString(),
      wind_direction: testWaveData.wind_direction
    });

    await db.insert(waveDataTable).values({
      location: testWaveData2.location,
      timestamp: testWaveData2.timestamp,
      wave_height: testWaveData2.wave_height.toString(),
      wind_speed: testWaveData2.wind_speed.toString(),
      wind_direction: testWaveData2.wind_direction
    });

    const input: LocationQueryInput = {
      location: 'Pacifica',
      start_time: new Date('2024-01-15T12:00:00Z')
    };

    const results = await getWaveData(input);

    expect(results).toHaveLength(1);
    expect(results[0].timestamp).toEqual(new Date('2024-01-15T14:00:00Z'));
  });
});
