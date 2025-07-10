// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Define an interface to extend globalThis with the prisma property
interface GlobalWithPrisma {
  prisma?: PrismaClient;
}

// Create a singleton function for PrismaClient with optimized configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling configuration
    // Note: These settings depend on your database provider
    // For PostgreSQL, you might want to add connection pool settings
  });
};

// Initialize prisma as a singleton, checking if it already exists in globalThis
const prisma: PrismaClient =
  (globalThis as GlobalWithPrisma).prisma ?? prismaClientSingleton();

// Store the instance in globalThis only in non-production environments
if (process.env.NODE_ENV !== "production") {
  (globalThis as GlobalWithPrisma).prisma = prisma;
}

export { prisma };
