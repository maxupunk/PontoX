import prisma from "../../prisma";

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);

        const userQuery = await prisma.users.findUnique({
            where: { id: userId },
        });

        const userDate = {
            id: userQuery?.id,
            name: userQuery?.name,
            email: userQuery?.email,
            login: userQuery?.login,
            role: userQuery?.role,
            status: userQuery?.status,
        };

        const pointQuery = await prisma.points.findFirst({
            where: {
                userId: userId,
                departureDate: undefined,
            },
        });

        return { user: userDate, point: pointQuery };
    } catch (e: any) {
        return {
            statusCode: 400,
            statusMessage: e.message,
        };
    }
});