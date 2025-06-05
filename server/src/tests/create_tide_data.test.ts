
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tideDataTable } from '../db/schema';
import { type CreateTideDataInput } from '../schema';
import { createTideData } from '../handlers/create_tide_data';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTideDataInput = {
  location: 'Coyote Point',
  timestamp: new Date('2024-01-15T10:30:00Z'),
  height: 6.25,
  type: 'high'
};

describe('createTideData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create tide data', async () => {
    const result = await createTideData(testInput);

    // Basic field validation
    expect(result.location).toEqual('Coyote Point');
    expect(result.timestamp).toEqual(testInput.timestamp);
    expect(result.height).toEqual(6.25);
    expect(typeof result.height).toBe('number');
    expect(result.type).toEqual('high');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save tide data to database', async () => {
    const result = await createTideData(testInput);

    // Query using proper drizzle syntax
    const tideDataRecords = await db.select()
      .from(tideDataTable)
      .where(eq(tideDataTable.id, result.id))
      .execute();

    expect(tideDataRecords).toHaveLength(1);
    expect(tideDataRecords[0].location).toEqual('Coyote Point');
    expect(tideDataRecords[0].timestamp).toEqual(testInput.timestamp);
    expect(parseFloat(tideDataRecords[0].height)).toEqual(6.25);
    expect(tideDataRecords[0].type).toEqual('high');
    expect(tideDataRecords[0].created_at).toBeInstanceOf(Date);
    expect(tideDataRecords[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different tide types', async () => {
    const lowTideInput: CreateTideDataInput = {
      location: 'Half Moon Bay',
      timestamp: new Date('2024-01-15T04:15:00Z'),
      height: -1.5,
      type: 'low'
    };

    const result = await createTideData(lowTideInput);

    expect(result.type).toEqual('low');
    expect(result.height).toEqual(-1.5);
    expect(typeof result.height).toBe('number');
    expect(result.location).toEqual('Half Moon Bay');
  });

  it('should handle rising and falling tide types', async () => {
    const risingTideInput: CreateTideDataInput = {
      location: 'Santa Cruz',
      timestamp: new Date('2024-01-15T08:00:00Z'),
      height: 3.75,
      type: 'rising'
    };

    const fallingTideInput: CreateTideDataInput = {
      location: 'Pacifica',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      height: 2.1,
      type: 'falling'
    };

    const risingResult = await createTideData(risingTideInput);
    const fallingResult = await createTideData(fallingTideInput);

    expect(risingResult.type).toEqual('rising');
    expect(risingResult.height).toEqual(3.75);
    expect(fallingResult.type).toEqual('falling');
    expect(fallingResult.height).toEqual(2.1);
  });
});
