import prisma from "../prisma";
import { pathToRegexp } from 'path-to-regexp';
import { H3Event, sendRedirect, createError } from 'h3';

const pathWhitelist = ['/api/login', '/', '/login', '/api/treine', '/api/imagens/:label/:file', '/api/reports/resumo', '/api/reports/:id'];
const regexWhitelist = pathWhitelist.map(path => pathToRegexp(path));

function isPathWhitelisted(path: string): boolean {
  return regexWhitelist.some(re => re.test(path));
}

async function validateAuthorization(token: string | null) {
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const userQuery = await prisma.user.findFirst({
    where: {
      token: token,
    },
  });

  if (!userQuery) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const isPathValid = isPathWhitelisted(event.path);

  if (!isPathValid) {
    const authorization = event.headers.get('authorization');
    try {
      await validateAuthorization(authorization);
    } catch (error) {
      return sendRedirect(event, '/login', 401);
    }
  }
});