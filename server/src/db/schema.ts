
import { serial, text, pgTable, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const tideDataTable = pgTable('tide_data', {
  id: serial('id').primaryKey(),
  location: text('location').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  height: numeric('height', { precision: 6, scale: 2 }).notNull(), // Tide height in feet
  type: text('type').notNull(), // 'high', 'low', 'rising', 'falling'
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const waveDataTable = pgTable('wave_data', {
  id: serial('id').primaryKey(),
  location: text('location').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  wave_height: numeric('wave_height', { precision: 6, scale: 2 }).notNull(), // Wave height in feet
  wind_speed: numeric('wind_speed', { precision: 6, scale: 2 }).notNull(), // Wind speed in mph
  wind_direction: integer('wind_direction').notNull(), // Wind direction in degrees (0-360)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type TideData = typeof tideDataTable.$inferSelect;
export type NewTideData = typeof tideDataTable.$inferInsert;
export type WaveData = typeof waveDataTable.$inferSelect;
export type NewWaveData = typeof waveDataTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  tideData: tideDataTable,
  waveData: waveDataTable
};
