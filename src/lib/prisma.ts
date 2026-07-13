// src/lib/db.ts
import { PrismaClient } from "../../prisma/generated/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// 1. Pass the connection string config directly to the adapter. No manual Pool needed!
const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL as string 
});

// 2. Prevent Next.js from creating infinite instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Initialize the PrismaClient
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}