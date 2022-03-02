import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';

logger.info('Instantiating Prisma Client');
const prisma = new PrismaClient();

export default prisma;
