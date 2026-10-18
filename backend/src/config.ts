import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8787),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_PATH: z.string().default('./data/xyrafin.db'),
  LLM_BASE_URL: z.string().default('https://api.deepseek.com/v1'),
  LLM_API_KEY: z.string().optional().default(''),
  LLM_MODEL: z.string().default('deepseek-chat'),
  ANCHOR_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default('false'),
  STELLAR_SECRET_KEY: z.string().optional().default('')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = {
  ...parsed.data,
  isOfflineMode: !parsed.data.LLM_API_KEY || parsed.data.LLM_API_KEY.trim() === ''
};
