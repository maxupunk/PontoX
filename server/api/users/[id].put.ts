import prisma from "~~/server/prisma";
import { saveUserImage } from '~~/server/utils/image';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    try {
        const userId = Number(event.context.params?.id);
        let body = await readBody(event);
        const tenantId = event.context.auth.tenantId;

        if (body.capturedImage) {
            return saveUserImage(tenantId, userId, body.capturedImage);
        } else {
            if (body.id) delete body.id;

            if (body.password) {
                const password = body.password;
                const hashedPassword = await bcrypt.hash(password, 10);
                body.password = hashedPassword;
            } else {
                delete body.password;
            }

            const userUpdate = await prisma.user.update({
                where: { id: userId },
                data: body,
            });

            return {
                data: userUpdate,
                message: 'Usuário atualizado com sucesso!'
            };
        }
    } catch (e: any) {
        throw createError({
            status: 400,
            message: e.message,
        });
    }
});