const { PrismaClient } = require('@prisma/client');

class PrismaService {
  constructor() {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Graceful shutdown
    process.on('beforeExit', async () => {
      await this.prisma.$disconnect();
    });

    process.on('SIGINT', async () => {
      await this.prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.prisma.$disconnect();
      process.exit(0);
    });

    PrismaService.instance = this;
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  getClient() {
    return this.prisma;
  }
}

// Export singleton instance
const prismaService = new PrismaService();
module.exports = prismaService; 