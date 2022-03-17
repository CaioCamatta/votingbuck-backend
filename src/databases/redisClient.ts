import { logger } from '@/utils/logger';
import { createClient } from 'redis';

// Instantiating redis here allows maintaining a singleton client

logger.info('Instantiating Redis Client.');

const redisHost = process.env.REDIS_HOST;
const redisPort: number = parseInt(process.env.REDIS_PORT);
const client = createClient({ socket: { host: redisHost, port: redisPort } });

client.on('error', (err) => logger.error('Error connecting to Redis.', err));
client.connect();

export default client;
