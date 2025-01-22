import fs from 'fs';
import path from 'path';
import prisma from "../prisma";
import { folderpathImagens } from '~~/server/utils/image';

export default defineEventHandler((event: any) => {
  try {
    const tenantId = event.context.auth.tenantId;
    return imagesUrl(tenantId);
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});


async function imagesUrl(tenantId: Number, dirPath: string = folderpathImagens): Promise<{ label: string, files: string[] }[]> {
  let data: { label: string, files: string[] }[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath:string = path.join(dirPath, `${tenantId}`, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const label = Number(path.basename(fullPath));
        const userQuery = await prisma.user.findUnique({
          select: {
            status: true,
          },
          where: { id: label },
        });

        if (userQuery?.status) {
          const subDirResults = await imagesUrl(tenantId, fullPath);
          data = data.concat(subDirResults);
        }
      } else {
        const label = path.basename(dirPath);
        const existingLabelIndex = data.findIndex(d => d.label === label);

        if (existingLabelIndex > -1) {
          const existingData = data[existingLabelIndex];
          if (existingData) {
            existingData.files.push(item);
            // Limit to the last 30 images (limited to 5 in front)
            existingData.files = existingData.files.slice(-30);
          }
        } else {
          data.push({ label: label, files: [item] });
        }
      }
    }

    return data;
  } catch (error: any) {
    throw new Error(`Error reading directory: ${error.message}`);
  }
}
