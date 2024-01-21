import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const folderpath = path.join('storage', 'imagens')
    const imageUrls = getImageUrls(folderpath)
    return imageUrls
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});

function getImageUrls(dirPath: string): { label: string, files: string[] }[] {
  let data: { label: string, files: string[] }[] = [];

  const items = fs.readdirSync(dirPath);

  items.forEach(async item => {
    const fullPath = path.join(dirPath, item);

    if (fs.statSync(fullPath).isDirectory()) {
      data = data.concat(getImageUrls(fullPath));
    } else {
      const label = path.basename(dirPath);
      const existingLabelIndex = data.findIndex(d => d.label === label);

      if (existingLabelIndex > -1) {
        data[existingLabelIndex].files.push(item);
        // Limit to the last 20 images
        data[existingLabelIndex].files = data[existingLabelIndex].files.slice(-20);
      } else {
        data.push({ label: label, files: [item] });
      }
    }
  });

  return data;
}

// Uso da função
// const imageUrls = getImageUrls('public/labels');


