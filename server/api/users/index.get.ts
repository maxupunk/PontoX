
import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    let status = null
    
    if (query?.status) {
      status = query?.status == 'true' ? true : false
    }
    // Create where clause once to reuse
    const whereClause = status !== null ? { status } : undefined;

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const [usersResp, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          login: true,
          rule: true,
          status: true,
        },
        orderBy: [
          { status: 'desc' },
          { id: 'asc' }
        ],
        skip,
        take: limit,
      }),
      // Get total count
      prisma.user.count({
        where: whereClause,
      })
    ]);

    return {
      users: usersResp,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + limit < total
      }
    };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});