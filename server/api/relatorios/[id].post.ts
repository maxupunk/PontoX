import prisma from "~/server/prisma";

export default defineEventHandler(async (event: any) => {
  let body = await readBody(event)
  const id = event.context.params.id
  const entryDateStart = body.entryDateStart ? body.entryDateStart : '';
  const entryDateEnd = body.entryDateEnd ? body.entryDateEnd : new Date().toISOString().split('T')[0];
  const user = await prisma.point.findMany({
    select: {
      entryDate: true,
      entryTime: true,
      departureDate: true,
      departureTime: true,
    },
    where: {
      userId: Number(id),
      entryDate: {
        gte: entryDateStart, // maior ou igual a dataInicial
        lte: entryDateEnd,
      },
    },
  });

  const labels: string[] = [];
  const data: string[] = [];

  user.forEach(({ entryDate, departureDate, departureTime, entryTime }) => {
    const entryDateTime = new Date(`${entryDate}T${entryTime}`);
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
    const totalTime = `${Math.floor(totalTimeMinutes / 60)}.${totalTimeMinutes % 60}`

    labels.push(entryDate);
    data.push(totalTime);
  });

  return {
    labels,
    data
  };

});