import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const jsonString = JSON.stringify(body, null, 2);
    const filePath = path.join('storage', 'faceMatcher.json')
    fs.writeFile(filePath, jsonString, err => {
      if (err) {
        console.log('Erro ao escrever arquivo: ', err);
      }
    });
    return { message: 'Treino realizado com sucesso' };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});

