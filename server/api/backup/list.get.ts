import fs from 'fs';
import { folderBackup } from '~~/server/utils/image';

export default defineEventHandler(async () => {
    try {
        const files = fs.readdirSync(folderBackup);
        return files;
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});