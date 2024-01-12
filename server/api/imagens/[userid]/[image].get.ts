import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export default defineEventHandler(async (event: any) => {
    try {
        const userId: number = event.context.params?.userid;
        const image: any = event.context.params?.image;
        if (userId || image) {
            const dirPath = path.join('public', 'imagens', `${userId}`);
            const filePath = path.join(dirPath, image);
            const imageData = fs.readFileSync(filePath);
            const blob = await fetch(`data:image/jpeg;base64,${imageData.toString('base64')}`).then(res => res.blob());
            return blob;
        } else {
            throw new Error('Usuário ou imagem não informados');
        }
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message,
        });
    }
});