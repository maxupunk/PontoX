import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import { folderStorage, folderBackup } from '~~/server/utils/image';

export default defineEventHandler(async () => {
  try {
    const date = new Date()
    const dateTime = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
    const fileBackup = path.join(folderBackup, `${dateTime}.zip`)
    return await zipDirectory(folderStorage, fileBackup);
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});

function zipDirectory(source: any, out: any) {
  const archive = archiver('zip', { zlib: { level: 9 } }); // Nível de compactação
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive.directory(source, false)
      .on('error', (err: any) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve(true));
    archive.finalize();
  });
}