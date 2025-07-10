import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

class PrismaService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      if (process.env.NODE_ENV === 'production') {
        PrismaService.instance = new PrismaClient({
          log: ['error', 'warn'],
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        });
      } else {
        // In development, use a global instance to prevent multiple connections
        if (!global.__prisma) {
          global.__prisma = new PrismaClient({
            log: ['query', 'error', 'warn'],
            datasources: {
              db: {
                url: process.env.DATABASE_URL,
              },
            },
          });
        }
        PrismaService.instance = global.__prisma;
      }

      // Graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaService.instance.$disconnect();
      });

      process.on('SIGINT', async () => {
        await PrismaService.instance.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await PrismaService.instance.$disconnect();
        process.exit(0);
      });
    }

    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = undefined;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = PrismaService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const prisma = PrismaService.getInstance();
export default PrismaService; 