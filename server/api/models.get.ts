import fs from 'fs';
import path from 'path';
import { folderpathImagens } from '~~/server/utils/image';

export default defineEventHandler(() => {
  try {
    return imagesUrl();
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});


function imagesUrl(dirPath: string = folderpathImagens): { label: string, files: string[] }[] {
  let data: { label: string, files: string[] }[] = [];

  const items = fs.readdirSync(dirPath);

  items.forEach(async item => {
    const fullPath = path.join(dirPath, item);

    if (fs.statSync(fullPath).isDirectory()) {
      data = data.concat(imagesUrl(fullPath));
    } else {
      const label = path.basename(dirPath);
      const existingLabelIndex = data.findIndex(d => d.label === label);

      if (existingLabelIndex > -1) {
        const existingData = data[existingLabelIndex];
        if (existingData) {
          existingData.files.push(item);
          // Limit to the last 6 images
          //existingData.files = existingData.files.slice(-6);
        }
      } else {
        data.push({ label: label, files: [item] });
      }
    }
  });

  return data;
}
