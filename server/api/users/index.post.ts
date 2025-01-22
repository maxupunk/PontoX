import prisma from "~~/server/prisma";
import bcrypt from 'bcrypt';
import joi from 'joi';
import { messages } from 'joi-translation-pt-br';

export default defineEventHandler(async (event) => {
  let body = await readBody(event);

  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().email(),
    login: joi.string(),
    password: joi.string(),
    rule: joi.string(),
    status: joi.boolean(),
  });

  const { error } = schema.validate(body, { messages });

  if (error) {
    throw createError({
      status: 400,
      message: error.message,
    });
  }

  try {
    if (body.password !== undefined) {
      const password = body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      body.password = hashedPassword;
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: body.email,
          },
          {
            name: body.name,
          },
        ],
      },
    });

    if (user) {
      throw createError({
        status: 400,
        message: 'Esse nome de usuário ou email já existe',
      });
    }

    const newUser = await prisma.user.create({
      data: body,
    });

    return {
      data: newUser,
      message: 'Usuário cadastrado com sucesso'
    };
  } catch (e: any) {
    throw createError({
      status: 400,
      message: e.message,
    });
  }
});