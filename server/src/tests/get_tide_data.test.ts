
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tideDataTable } from '../db/schema';
import { type LocationQueryInput, type CreateTideDataInput } from '../schema';
import { getTideData } from '../handlers/get_tide_data';

// Helper function to create test tide data
const createTestTideData = async (input: CreateTideDataInput) => {
  const result = await db.insert(tideDataTable)
    .values({
      location: input.location,
      timestamp: input.timestamp,
      height: input.height.toString(),
      type: input.type
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('getTideData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve tide data for a location', async () => {
    // Create test data
    const testInput: CreateTideDataInput = {
      location: 'Coyote Point',
      timestamp: new Date('2024-01-15T08:00:00Z'),
      height: 5.2,
      type: 'high'
    };

    await createTestTideData(testInput);

    // Query for the data
    const queryInput: LocationQueryInput = {
      location: 'Coyote Point'
    };

    const results = await getTideData(queryInput);

    expect(results).toHaveLength(1);
    expect(results[0].location).toEqual('Coyote Point');
    expect(results[0].height).toEqual(5.2);
    expect(typeof results[0].height).toBe('number');
    expect(results[0].type).toEqual('high');
    expect(results[0].timestamp).toBeInstanceOf(Date);
    expect(results[0].id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
    expect(results[0].updated_at).toBeInstanceOf(Date);
  });

  it('should filter by time range', async () => {
    // Create multiple test records
    const baseDate = new Date('2024-01-15');
    
    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      height: 3.1,
      type: 'low'
    });

    await createTestTideData({
      location: 'Coyote Point',
      timestamp: baseDate, // exact start time
      height: 5.2,
      type: 'high'
    });

    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000), // 12 hours later
      height: 2.8,
      type: 'low'
    });

    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() + 48 * 60 * 60 * 1000), // 2 days later
      height: 6.0,
      type: 'high'
    });

    // Query with time range
    const queryInput: LocationQueryInput = {
      location: 'Coyote Point',
      start_time: baseDate,
      end_time: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000) // 1 day later
    };

    const results = await getTideData(queryInput);

    expect(results).toHaveLength(2);
    expect(results[0].height).toEqual(5.2);
    expect(results[1].height).toEqual(2.8);
    
    // Verify results are in chronological order
    expect(results[0].timestamp.getTime()).toBeLessThan(results[1].timestamp.getTime());
  });

  it('should return empty array for non-existent location', async () => {
    // Create data for one location
    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date('2024-01-15T08:00:00Z'),
      height: 5.2,
      type: 'high'
    });

    // Query for different location
    const queryInput: LocationQueryInput = {
      location: 'Half Moon Bay'
    };

    const results = await getTideData(queryInput);

    expect(results).toHaveLength(0);
  });

  it('should filter by start time only', async () => {
    const baseDate = new Date('2024-01-15');

    // Create records before and after the start time
    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
      height: 3.1,
      type: 'low'
    });

    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000),
      height: 5.2,
      type: 'high'
    });

    const queryInput: LocationQueryInput = {
      location: 'Coyote Point',
      start_time: baseDate
    };

    const results = await getTideData(queryInput);

    expect(results).toHaveLength(1);
    expect(results[0].height).toEqual(5.2);
    expect(results[0].timestamp.getTime()).toBeGreaterThanOrEqual(baseDate.getTime());
  });

  it('should filter by end time only', async () => {
    const baseDate = new Date('2024-01-15');

    // Create records before and after the end time
    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() - 12 * 60 * 60 * 1000),
      height: 3.1,
      type: 'low'
    });

    await createTestTideData({
      location: 'Coyote Point',
      timestamp: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
      height: 5.2,
      type: 'high'
    });

    const queryInput: LocationQueryInput = {
      location: 'Coyote Point',
      end_time: baseDate
    };

    const results = await getTideData(queryInput);

    expect(results).toHaveLength(1);
    expect(results[0].height).toEqual(3.1);
    expect(results[0].timestamp.getTime()).toBeLessThanOrEqual(baseDate.getTime());
  });
});
