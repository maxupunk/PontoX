import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [bankHours, totol] = await Promise.all([
            prisma.bankHour.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                },
                skip,
                take: limit,
            }),
            prisma.bankHour.count()
        ]);

        return {
            data: bankHours,
            pagination: {
                total: totol,
                page,
                limit,
                hasMore: skip + limit < totol
            }
        }

    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }

});