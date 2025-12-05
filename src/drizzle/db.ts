import { env } from '@/data/env/server';
// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/drizzle/schema';

export const db = drizzle(env.DATABASE_URL, {schema});
 
// const result = await db.execute('select 1');
