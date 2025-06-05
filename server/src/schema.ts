
import { z } from 'zod';

// Tide data schema for Coyote Point
export const tideDataSchema = z.object({
  id: z.number(),
  location: z.string(),
  timestamp: z.coerce.date(),
  height: z.number(), // Tide height in feet
  type: z.enum(['high', 'low', 'rising', 'falling']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type TideData = z.infer<typeof tideDataSchema>;

// Wave data schema for beaches
export const waveDataSchema = z.object({
  id: z.number(),
  location: z.string(),
  timestamp: z.coerce.date(),
  wave_height: z.number(), // Wave height in feet
  wind_speed: z.number(), // Wind speed in mph
  wind_direction: z.number(), // Wind direction in degrees (0-360)
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type WaveData = z.infer<typeof waveDataSchema>;

// Input schema for creating tide data
export const createTideDataInputSchema = z.object({
  location: z.string(),
  timestamp: z.coerce.date(),
  height: z.number(),
  type: z.enum(['high', 'low', 'rising', 'falling'])
});

export type CreateTideDataInput = z.infer<typeof createTideDataInputSchema>;

// Input schema for creating wave data
export const createWaveDataInputSchema = z.object({
  location: z.string(),
  timestamp: z.coerce.date(),
  wave_height: z.number().nonnegative(),
  wind_speed: z.number().nonnegative(),
  wind_direction: z.number().min(0).max(360)
});

export type CreateWaveDataInput = z.infer<typeof createWaveDataInputSchema>;

// Query input schema for location-based data
export const locationQueryInputSchema = z.object({
  location: z.string(),
  start_time: z.coerce.date().optional(),
  end_time: z.coerce.date().optional()
});

export type LocationQueryInput = z.infer<typeof locationQueryInputSchema>;

// Marine conditions summary schema
export const marineConditionsSchema = z.object({
  location: z.string(),
  current_conditions: z.object({
    wave_height: z.number().nullable(),
    wind_speed: z.number().nullable(),
    wind_direction: z.number().nullable(),
    timestamp: z.coerce.date().nullable()
  }),
  forecast: z.array(waveDataSchema)
});

export type MarineConditions = z.infer<typeof marineConditionsSchema>;
