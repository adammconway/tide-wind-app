
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { waveDataTable } from '../db/schema';
import { type CreateWaveDataInput } from '../schema';
import { createWaveData } from '../handlers/create_wave_data';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateWaveDataInput = {
  location: 'Half Moon Bay',
  timestamp: new Date('2024-01-15T10:00:00Z'),
  wave_height: 4.5,
  wind_speed: 12.3,
  wind_direction: 270
};

describe('createWaveData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create wave data', async () => {
    const result = await createWaveData(testInput);

    // Basic field validation
    expect(result.location).toEqual('Half Moon Bay');
    expect(result.timestamp).toEqual(testInput.timestamp);
    expect(result.wave_height).toEqual(4.5);
    expect(result.wind_speed).toEqual(12.3);
    expect(result.wind_direction).toEqual(270);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify numeric types are correct
    expect(typeof result.wave_height).toBe('number');
    expect(typeof result.wind_speed).toBe('number');
  });

  it('should save wave data to database', async () => {
    const result = await createWaveData(testInput);

    // Query using proper drizzle syntax
    const waveData = await db.select()
      .from(waveDataTable)
      .where(eq(waveDataTable.id, result.id))
      .execute();

    expect(waveData).toHaveLength(1);
    expect(waveData[0].location).toEqual('Half Moon Bay');
    expect(waveData[0].timestamp).toEqual(testInput.timestamp);
    expect(parseFloat(waveData[0].wave_height)).toEqual(4.5);
    expect(parseFloat(waveData[0].wind_speed)).toEqual(12.3);
    expect(waveData[0].wind_direction).toEqual(270);
    expect(waveData[0].created_at).toBeInstanceOf(Date);
    expect(waveData[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle zero values correctly', async () => {
    const zeroInput: CreateWaveDataInput = {
      location: 'Pacifica',
      timestamp: new Date('2024-01-15T11:00:00Z'),
      wave_height: 0,
      wind_speed: 0,
      wind_direction: 0
    };

    const result = await createWaveData(zeroInput);

    expect(result.wave_height).toEqual(0);
    expect(result.wind_speed).toEqual(0);
    expect(result.wind_direction).toEqual(0);
    expect(typeof result.wave_height).toBe('number');
    expect(typeof result.wind_speed).toBe('number');
  });

  it('should handle decimal precision correctly', async () => {
    const precisionInput: CreateWaveDataInput = {
      location: 'Ocean Beach',
      timestamp: new Date('2024-01-15T12:00:00Z'),
      wave_height: 3.14159,
      wind_speed: 15.789,
      wind_direction: 180
    };

    const result = await createWaveData(precisionInput);

    // Verify decimal values are truncated to 2 decimal places (numeric(6,2))
    expect(result.wave_height).toEqual(3.14);
    expect(result.wind_speed).toEqual(15.79);
  });
});
