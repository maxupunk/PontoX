import { PrismaClient, Prisma } from '@prisma/client'

let tenantId: number | null = 1

export const setTenent = (id: number) => {
  tenantId = id
}

const MultiTenantExtension = Prisma.defineExtension({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        if (tenantId && model !== 'Tenant') {
          if ('where' in args) {
            args.where = {
              ...args.where,
              tenantId: tenantId,
            }
          }
          if (operation === 'create') {
            args.data = {
              ...args.data,
              tenantId: tenantId,
            }
          }
        }
        // console.log('operation', operation);
        // console.log('args', args);
        return query(args)
      }
    }
  }
})

export const prismaTenant = new PrismaClient()

const prisma = new PrismaClient().$extends(MultiTenantExtension)
export default prisma