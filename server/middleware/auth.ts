import prisma from "../prisma";
import { pathToRegexp } from 'path-to-regexp';
import { H3Event, createError } from 'h3';

const pathWhitelist = ['/api/login', '/api/treine', '/api/imagens/:label/:file', '/api/reports/resumo', '/api/reports/:id'];
const regexWhitelist = pathWhitelist.map(path => pathToRegexp(path));

// verifica se o path é da API ou se está na whitelist
function isPathWhiteList(path: string, event: any): boolean {
  const pathAPI = event.path.startsWith("/api/");
  const whiteList = regexWhitelist.some(re => re.regexp.test(path));
  if (!pathAPI || whiteList) {
    return true;
  }
  return false;
}

async function validateAuthorization(token: string | null) {
  if (!token) {
    throw createError({
      status: 401,
      message: 'Não autorizado',
    });
  }

  const userQuery = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      token: token,
    },
  });

  if (!userQuery) {
    throw createError({
      status: 401,
      message: 'Não autorizado',
    });
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const isWhiteList = isPathWhiteList(event.path, event);

  if (!isWhiteList) {
    const authorization = event.headers.get('authorization');
    try {
      await validateAuthorization(authorization);
    } catch (error) {
      event.node.res.statusCode = 401;
      event.node.res.end('Unauthorized');
    }
  }
});