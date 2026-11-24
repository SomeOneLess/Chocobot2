import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import defaults from './defaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  OWNER_NUMBER: z.string().min(8).optional(),
  BOT_PREFIX: z.string().min(1).optional(),
  AUTH_DIR: z.string().optional(),
  DATA_DIR: z.string().optional(),
  TEMP_DIR: z.string().optional(),
  LOGS_DIR: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  POLLINATIONS_API_KEY: z.string().optional(),
  PINTEREST_ACCESS_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Error en variables de entorno:');
  console.error(parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

const config = {
  ...defaults,
  owner: {
    number: env.OWNER_NUMBER || defaults.owner.number,
    jid: env.OWNER_NUMBER ? `${env.OWNER_NUMBER}@s.whatsapp.net` : defaults.owner.jid,
  },
  prefix: env.BOT_PREFIX || defaults.prefix,
  paths: {
    auth: path.resolve(env.AUTH_DIR || defaults.paths.auth),
    data: path.resolve(env.DATA_DIR || defaults.paths.data),
    temp: path.resolve(env.TEMP_DIR || defaults.paths.temp),
    logs: path.resolve(env.LOGS_DIR || defaults.paths.logs),
  },
  logLevel: env.LOG_LEVEL || defaults.logLevel,
  nodeEnv: env.NODE_ENV || defaults.nodeEnv,
  apis: {
    pollinations: env.POLLINATIONS_API_KEY || '',
    pinterest: env.PINTEREST_ACCESS_TOKEN || '',
    openai: env.OPENAI_API_KEY || '',
  },
};

export default config;
