import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    console.log(process.env.FACE_INPUT_SIZE)
    const filePath = path.join('public', 'faceMatcher.json')
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      const conteFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      return {
        faceMatcherJson: conteFile,
        tinyFaceDetectorOptions: {
          faceInputSize: process.env.FACE_INPUT_SIZE,
          faceMatchThreshold: process.env.FACE_SCORE_THRESHOLD
        }
      }
    } catch (err) {
      return {
        tinyFaceDetectorOptions: {
          faceInputSize: process.env.FACE_INPUT_SIZE,
          faceMatchThreshold: process.env.FACE_SCORE_THRESHOLD
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