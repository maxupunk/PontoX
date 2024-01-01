import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const filePath = path.join('public', 'faceMatcher.json')
    const FACE_MIN_CONFIDENCE = process.env.FACE_MIN_CONFIDENCE || 512;
    const FACE_MAX_RESULTS = process.env.FACE_MAX_RESULTS || 0.8;
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      const conteFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      const FileStats = await fs.promises.stat(filePath);
      return {
        faceMatcherJson: conteFile,
        Mobilenetv1Options: {
          minConfidence: +FACE_MIN_CONFIDENCE,
          maxResults: +FACE_MAX_RESULTS
        },
        fileStats: FileStats
      }
    } catch (err) {
      return {
        Mobilenetv1Options: {
          minConfidence: +FACE_MIN_CONFIDENCE,
          maxResults: +FACE_MAX_RESULTS
        }
      }
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});