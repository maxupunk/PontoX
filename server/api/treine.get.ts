import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const filePath = path.join('public', 'faceMatcher.json')
    const FACE_INPUT_SIZE = process.env.FACE_INPUT_SIZE || 512;
    const FACE_SCORE_THRESHOLD = process.env.FACE_SCORE_THRESHOLD || 0.8;
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      const conteFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      const FileStats = await fs.promises.stat(filePath);
      return {
        faceMatcherJson: conteFile,
        tinyFaceDetectorOptions: {
          faceInputSize: FACE_INPUT_SIZE,
          faceMatchThreshold: process.env.FACE_SCORE_THRESHOLD
        },
        fileStats: FileStats
      }
    } catch (err) {
      return {
        tinyFaceDetectorOptions: {
          faceInputSize: FACE_INPUT_SIZE,
          faceMatchThreshold: FACE_SCORE_THRESHOLD
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