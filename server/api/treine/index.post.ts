import prisma from "~~/server/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const jsonString = JSON.stringify(body, null, 2);

    const existingConfig = await prisma.config.findFirst({
      where: { key: 'faceMatcher' },
    });

    let faceMatcher;
    if (existingConfig) {
      faceMatcher = await prisma.config.update({
        where: { id: existingConfig.id },
        data: { value: jsonString },
      });
    } else {
      faceMatcher = await prisma.config.create({
        data: {
          key: 'faceMatcher',
          value: jsonString,
        },
      });
    }
    return {
      data: {
        faceMatcherJson: JSON.parse(faceMatcher.value as string),
        updatedAt: faceMatcher.updatedAt
      },
      message: 'Treino realizado com sucesso'
    };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: 'Erro ao salvar treinamento',
    });
  }
});

