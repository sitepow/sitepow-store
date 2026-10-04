import { DB_CONNECTION_TIMEOUT, DB_IDLE_TIMEOUT } from '@/constants/system'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import pg from 'pg'

import { PrismaClient } from '../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const prismaClientSingleton = () => {
  const pool = new pg.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: DB_IDLE_TIMEOUT,
    connectionTimeoutMillis: DB_CONNECTION_TIMEOUT,
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
