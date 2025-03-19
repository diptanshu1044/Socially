// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

export const prisma: PrismaClient = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
