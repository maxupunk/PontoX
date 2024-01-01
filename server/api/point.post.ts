import { points } from "../../models/points";
import { db } from "../sqlite-service";
import { eq, and, isNull } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;

    const pointQuery = db.select()
      .from(points)
      .where(
        and(eq(points.userId, body.userId), isNull(points.departureDate))
      )
      .get()

    // cria a pasta do usuário caso não exista      
    const dirPath = path.join('public', 'imagens', `${body.userId}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Remova o prefixo da string de dados
    let ImagenBase64Data = body.capturedImage.replace(/^data:image\/\w+;base64,/, "");
    // Converta a string de dados em um buffer
    let imageBase64 = Buffer.from(ImagenBase64Data, 'base64');
    // salva a imagem
    const nameImage = date.toISOString().replace(/[:.]/g, '.') + '.jpg';
    const filePath = path.join(dirPath, nameImage);
    fs.writeFileSync(filePath, imageBase64);

    const data: any  = {
      userId: body.userId,
      observation: body.observation,
    }

    if (!pointQuery) {
      data.entryExpressio = body.expressio
      data.entryImage = nameImage
    } else {
      data.departureExpressio = body.expressio
      data.departureDate = formattedDate
      data.departureImage = nameImage
    }

    if (pointQuery) {
      return db.update(points).set(data).where(eq(points.id, pointQuery.id)).run()
    } else {
      return db.insert(points).values(data).run();
    }

  } catch (e: any) {
    console.log(e)
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});