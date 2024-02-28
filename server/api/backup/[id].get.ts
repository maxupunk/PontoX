import fs from 'fs';
import path from 'path';
import { folderBackup } from '~/utils/utils';

export default defineEventHandler(async (event: any) => {
    const backupPath = path.join(folderBackup, event.context.params?.id)
    try {
        const file = fs.readFileSync(backupPath);
        return `data:application/zip;base64,${file.toString('base64')}`;
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});
