import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const filePath = path.join('storage', 'faceMatcher.json')
    const FACE_DISTANCE_THRESHOLD = process.env.FACE_DISTANCE_THRESHOLD || 0.6;
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      const conteFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      const FileStats = await fs.promises.stat(filePath);
      return {
        faceMatcherJson: conteFile,
        distanceThreshold: +FACE_DISTANCE_THRESHOLD,
        fileStats: FileStats
      }
    } catch (err) {
      return {
        distanceThreshold: +FACE_DISTANCE_THRESHOLD,
      }
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});