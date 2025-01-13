import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const filePath = path.join('storage', 'faceMatcher.json');

    // Check if file exists first
    if (!fs.existsSync(filePath)) {
      return {};
    }

    // File exists, proceed with reading
    const conteFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
    const FileStats = await fs.promises.stat(filePath);

    return {
      faceMatcherJson: conteFile,
      fileStats: FileStats
    }

  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});