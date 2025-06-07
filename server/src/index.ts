
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  locationQueryInputSchema, 
  createTideDataInputSchema, 
  createWaveDataInputSchema 
} from './schema';
import { getTideData } from './handlers/get_tide_data';
import { getWaveData } from './handlers/get_wave_data';
import { getCoyotePointTides } from './handlers/get_coyote_point_tides';
import { getMarineConditions } from './handlers/get_marine_conditions';
import { createTideData } from './handlers/create_tide_data';
import { createWaveData } from './handlers/create_wave_data';
import { seedSampleData } from './handlers/seed_sample_data';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Get tide data for a specific location with optional time range
  getTideData: publicProcedure
    .input(locationQueryInputSchema)
    .query(({ input }) => getTideData(input)),
  
  // Get wave data for a specific location with optional time range
  getWaveData: publicProcedure
    .input(locationQueryInputSchema)
    .query(({ input }) => getWaveData(input)),
  
  // Get 48-hour tide forecast for Coyote Point
  getCoyotePointTides: publicProcedure
    .query(() => getCoyotePointTides()),
  
  // Get marine conditions (waves, wind) for specific beach
  getMarineConditions: publicProcedure
    .input(z.string())
    .query(({ input }) => getMarineConditions(input)),
  
  // Create new tide data entry
  createTideData: publicProcedure
    .input(createTideDataInputSchema)
    .mutation(({ input }) => createTideData(input)),
  
  // Create new wave data entry
  createWaveData: publicProcedure
    .input(createWaveDataInputSchema)
    .mutation(({ input }) => createWaveData(input)),
  
  // Seed sample data for development/testing
  seedSampleData: publicProcedure
    .mutation(() => seedSampleData()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  
  // Seed initial data if none exists
  try {
    console.log('Checking for existing data...');
    const { db } = await import('./db');
    const { tideDataTable } = await import('./db/schema');
    const { eq } = await import('drizzle-orm');
    
    const existingTides = await db.select()
      .from(tideDataTable)
      .where(eq(tideDataTable.location, 'Coyote Point'))
      .execute();
    
    if (existingTides.length === 0) {
      console.log('No existing tide data found, seeding sample data...');
      await seedSampleData();
      console.log('Sample data seeded successfully');
    } else {
      console.log(`Found ${existingTides.length} existing tide records`);
    }
  } catch (error) {
    console.error('Error checking/seeding initial data:', error);
  }

  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
