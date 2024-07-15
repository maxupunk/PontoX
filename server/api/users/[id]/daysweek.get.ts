import prisma from "~/server/prisma";

export default defineEventHandler(async (event: any) => {
    const userID = Number(event.context.params?.id);

    const userQuery = await prisma.user.findUnique({
        where: { id: userID },
        select: {
            daysWeek: true,
        },
    });

    if (userQuery && userQuery?.daysWeek !== null) {
        return JSON.parse(userQuery.daysWeek);
    } else {
        return {
            'domingo': [],
            'segunda': [],
            'terca': [],
            'quarta': [],
            'quinta': [],
            'sexta': [],
            'sabado': []
        }
    }
});