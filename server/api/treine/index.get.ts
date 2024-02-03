import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const filePath = path.join('storage', 'faceMatcher.json')
    const FACE_MIN_CONFIDENCE = process.env.FACE_MIN_CONFIDENCE || 0.9;
    const FACE_MAX_RESULTS = process.env.FACE_MAX_RESULTS || 0.8;
    const FACE_DISTANCE_THRESHOLD = process.env.FACE_DISTANCE_THRESHOLD || 0.6;
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
        distanceThreshold: +FACE_DISTANCE_THRESHOLD,
        fileStats: FileStats
      }
    } catch (err) {
      return {
        faceMatcherJson: {},
        Mobilenetv1Options: {
          minConfidence: +FACE_MIN_CONFIDENCE,
          maxResults: +FACE_MAX_RESULTS
        },
        distanceThreshold: +FACE_DISTANCE_THRESHOLD,
      }
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});