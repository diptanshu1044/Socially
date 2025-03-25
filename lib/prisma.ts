// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Define an interface to extend globalThis with the prisma property
interface GlobalWithPrisma {
  prisma?: PrismaClient;
}

// Create a singleton function for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Initialize prisma as a singleton, checking if it already exists in globalThis
const prisma: PrismaClient =
  (globalThis as GlobalWithPrisma).prisma ?? prismaClientSingleton();

// Store the instance in globalThis only in non-production environments
if (process.env.NODE_ENV !== "production") {
  (globalThis as GlobalWithPrisma).prisma = prisma;
}

export { prisma };
