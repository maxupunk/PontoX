import prisma from "~~/server/prisma";

export default defineEventHandler(async (event: any) => {
  let body = await readBody(event)
  const UserId: number = Number(event.context.params.id)
  const entryDateStart = body.entryDateStart ? body.entryDateStart : '';
  const entryDateEnd = body.entryDateEnd ? body.entryDateEnd : new Date().toString().split('T')[0];
  const userPoints = await prisma.point.findMany({
    select: {
      id: true,
      entryDate: true,
      entryTime: true,
      departureDate: true,
      departureTime: true,
    },
    where: {
      userId: UserId,
      entryDate: {
        gte: entryDateStart, // maior ou igual a dataInicial
        lte: entryDateEnd,
      },
    },
  });

  const labels: string[] = [];
  const data: string[] = [];

  userPoints.forEach(({ entryDate, departureDate, departureTime, entryTime }) => {
    const entryDateTime = new Date(`${entryDate}T${entryTime}`);
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    const totalTimeMinutes = (departureDateTime.getTime() - entryDateTime.getTime()) / (1000 * 60); // Convert to minutes
    const hours = Math.floor(totalTimeMinutes / 60);
    const minutes = totalTimeMinutes % 60;
    const totalTime = `${hours}.${minutes.toFixed(0).padStart(2, '0')}`; // Ensure minutes are two digits

    const labelIndex = labels.indexOf(entryDate);
    if (labelIndex !== -1) {
      const existingTime = parseFloat(data[labelIndex]!);
      const newTime = parseFloat(totalTime);
      const sumTime = (existingTime + newTime).toFixed(2);
      data[labelIndex] = sumTime;
    } else {
      labels.push(entryDate);
      data.push(totalTime);
    }
  });

  return {
    labels,
    data
  };

});