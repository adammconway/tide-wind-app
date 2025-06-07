
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tideDataTable, waveDataTable } from '../db/schema';
import { seedSampleData } from '../handlers/seed_sample_data';
import { eq } from 'drizzle-orm';

describe('seedSampleData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should seed sample data successfully', async () => {
    const result = await seedSampleData();

    expect(result.message).toEqual('Sample data seeded successfully');
    expect(result.tideCount).toBeGreaterThan(0);
    expect(result.waveCount).toBeGreaterThan(0);
  });

  it('should insert tide data correctly', async () => {
    await seedSampleData();

    const tideRecords = await db.select()
      .from(tideDataTable)
      .execute();

    expect(tideRecords.length).toBeGreaterThan(0);

    // Check first tide record
    const firstTide = tideRecords[0];
    expect(firstTide.location).toEqual('Coyote Point');
    expect(firstTide.timestamp).toBeInstanceOf(Date);
    expect(parseFloat(firstTide.height)).toBeGreaterThan(0);
    expect(['high', 'low', 'rising', 'falling', 'predicted']).toContain(firstTide.type);
    expect(firstTide.created_at).toBeInstanceOf(Date);
    expect(firstTide.updated_at).toBeInstanceOf(Date);
  });

  it('should insert wave data correctly', async () => {
    await seedSampleData();

    const waveRecords = await db.select()
      .from(waveDataTable)
      .execute();

    expect(waveRecords.length).toBeGreaterThan(0);

    // Check first wave record
    const firstWave = waveRecords[0];
    expect(firstWave.location).toBeDefined();
    expect(firstWave.timestamp).toBeInstanceOf(Date);
    expect(parseFloat(firstWave.wave_height)).toBeGreaterThan(0);
    expect(parseFloat(firstWave.wind_speed)).toBeGreaterThan(0);
    expect(firstWave.wind_direction).toBeGreaterThanOrEqual(0);
    expect(firstWave.wind_direction).toBeLessThanOrEqual(360);
    expect(firstWave.created_at).toBeInstanceOf(Date);
    expect(firstWave.updated_at).toBeInstanceOf(Date);
  });

  it('should create data for multiple locations', async () => {
    await seedSampleData();

    // Check tide data locations
    const tideLocations = await db.select({ location: tideDataTable.location })
      .from(tideDataTable)
      .execute();

    const uniqueTideLocations = [...new Set(tideLocations.map(t => t.location))];
    expect(uniqueTideLocations).toContain('Coyote Point');

    // Check wave data locations
    const waveLocations = await db.select({ location: waveDataTable.location })
      .from(waveDataTable)
      .execute();

    const uniqueWaveLocations = [...new Set(waveLocations.map(w => w.location))];
    expect(uniqueWaveLocations.length).toBeGreaterThan(1);
    expect(uniqueWaveLocations).toContain('Ocean Beach');
  });

  it('should handle numeric field conversions properly', async () => {
    await seedSampleData();

    // Test tide data numeric conversion
    const tideRecord = await db.select()
      .from(tideDataTable)
      .where(eq(tideDataTable.location, 'Coyote Point'))
      .execute();

    expect(tideRecord.length).toBeGreaterThan(0);
    const tide = tideRecord[0];
    expect(typeof parseFloat(tide.height)).toBe('number');
    expect(parseFloat(tide.height)).toBeGreaterThan(0);

    // Test wave data numeric conversions
    const waveRecord = await db.select()
      .from(waveDataTable)
      .execute();

    expect(waveRecord.length).toBeGreaterThan(0);
    const wave = waveRecord[0];
    expect(typeof parseFloat(wave.wave_height)).toBe('number');
    expect(typeof parseFloat(wave.wind_speed)).toBe('number');
    expect(typeof wave.wind_direction).toBe('number');
  });
});
