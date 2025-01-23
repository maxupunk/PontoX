import { prismaTenant } from "../prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const config = useRuntimeConfig();

const SECRETJWT = config.secretJwt as string

export default defineEventHandler(async (event: any) => {
  try {
    let body = await readBody(event);
    const user = await prismaTenant.user.findUnique({
      where: { login: body.login },
    });

    if (!user) {
      throw createError({
        status: 401,
        message: 'Usuário e senha inválidos',
      });
    }

    const passwordDB = user.password ? user.password : '';
    const result = await bcrypt.compare(body.password, passwordDB);
    if (result) {
      const expiresIn = body.remenber ? '365d' : '1h';
      const token: string = jwt.sign(
        { id: user.id, tenantId: user.tenantId, rule: user.rule },
        SECRETJWT,
        { expiresIn }
      )
      // Check if token already exists
      const tokenQuery = await prismaTenant.token.findFirst({
        where: { token: token }
      });
      // If token exists and is not active, throw error
      if (tokenQuery && !tokenQuery.active) {
        throw createError({
          status: 401,
          message: 'Token inválido',
        });
      }

      await prismaTenant.token.create({
        data: {
          token: token,
          userId: user.id,
          userAgent: event.req.headers['user-agent'],
          ip: event.req.headers['x-forwarded-for'],
        }
      });

      return {
        message: 'Usuário autenticado com sucesso',
        token: token,
      };
    }
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});