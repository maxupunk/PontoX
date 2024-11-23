import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
config() // Load .env file

let databaseUrl: string = process.env.DATABASE_URL?.toString() ?? ''

console.log('DB', `${databaseUrl}`)

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: databaseUrl,
  });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma