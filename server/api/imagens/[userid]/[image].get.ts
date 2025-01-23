import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

export default defineEventHandler(async (event: any) => {
    try {
        const userId: number = event.context.params?.userid;
        const tenantId: number = event.context.auth.tenantId;
        const image: any = event.context.params?.image;
        if (userId && image) {
            const dirPath = path.join('storage', 'imagens', `${tenantId}`, `${userId}`);
            const filePath = path.join(dirPath, image);
            const imageData = await fs.readFile(filePath).catch(() => {
                throw new Error('Imagem não encontrada');
            });
            const blob = await fetch(`data:image/jpeg;base64,${imageData.toString('base64')}`).then((res: any) => res.blob());
            return blob;
        } else {
            throw new Error('Usuário ou imagem não informados');
        }
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }
});