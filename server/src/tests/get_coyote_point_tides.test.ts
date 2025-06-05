
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tideDataTable } from '../db/schema';
import { getCoyotePointTides } from '../handlers/get_coyote_point_tides';

describe('getCoyotePointTides', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tide data exists', async () => {
    const result = await getCoyotePointTides();
    expect(result).toEqual([]);
  });

  it('should return tide data for Coyote Point only', async () => {
    // Insert test data for Coyote Point
    await db.insert(tideDataTable).values({
      location: 'Coyote Point',
      timestamp: new Date('2024-01-01T12:00:00Z'),
      height: '5.5',
      type: 'high'
    });

    // Insert test data for different location
    await db.insert(tideDataTable).values({
      location: 'Half Moon Bay',
      timestamp: new Date('2024-01-01T12:00:00Z'),
      height: '4.2',
      type: 'low'
    });

    const result = await getCoyotePointTides();

    expect(result).toHaveLength(1);
    expect(result[0].location).toEqual('Coyote Point');
    expect(result[0].height).toEqual(5.5);
    expect(typeof result[0].height).toEqual('number');
    expect(result[0].type).toEqual('high');
  });

  it('should return multiple tide records for Coyote Point', async () => {
    // Insert multiple tide records
    await db.insert(tideDataTable).values([
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-01T06:00:00Z'),
        height: '2.1',
        type: 'low'
      },
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-01T12:00:00Z'),
        height: '6.8',
        type: 'high'
      },
      {
        location: 'Coyote Point',
        timestamp: new Date('2024-01-01T18:00:00Z'),
        height: '1.9',
        type: 'low'
      }
    ]);

    const result = await getCoyotePointTides();

    expect(result).toHaveLength(3);
    result.forEach(tide => {
      expect(tide.location).toEqual('Coyote Point');
      expect(typeof tide.height).toEqual('number');
      expect(tide.id).toBeDefined();
      expect(tide.timestamp).toBeInstanceOf(Date);
      expect(tide.created_at).toBeInstanceOf(Date);
      expect(tide.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific values
    const heights = result.map(t => t.height).sort();
    expect(heights).toEqual([1.9, 2.1, 6.8]);
  });

  it('should handle numeric conversion correctly', async () => {
    await db.insert(tideDataTable).values({
      location: 'Coyote Point',
      timestamp: new Date('2024-01-01T12:00:00Z'),
      height: '3.14', // Use value that fits within precision 6, scale 2
      type: 'rising'
    });

    const result = await getCoyotePointTides();

    expect(result).toHaveLength(1);
    expect(result[0].height).toEqual(3.14);
    expect(typeof result[0].height).toEqual('number');
  });
});
