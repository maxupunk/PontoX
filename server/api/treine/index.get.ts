import prisma from "~~/server/prisma";

export default defineEventHandler(async () => {
  try {
    const faceMatcher = await prisma.config.findFirst({
      where: { key: 'faceMatcher' },
    });

    if (!faceMatcher || !faceMatcher.value) {
      return {
        faceMatcherJson: {},
        updatedAt: null,
      }
    }
    return {
      faceMatcherJson: JSON.parse(faceMatcher.value as string),
      updatedAt: faceMatcher.updatedAt,
    }

  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});