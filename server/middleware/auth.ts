import { prismaTenant } from "../prisma";
import { setTenent } from "../prisma";
import { pathToRegexp } from 'path-to-regexp';
import { H3Event, createError } from 'h3';

import jwt from 'jsonwebtoken';
const config = useRuntimeConfig();

const SECRETJWT = config.secretJwt as string

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

  const jwtDecoded: any = jwt.verify(token, SECRETJWT);

  if (!jwtDecoded) {
    throw createError({
      status: 401,
      message: 'Não autorizado',
    });
  }

  const userQuery: any = await prismaTenant.user.findUnique({
    select: {
      id: true,
      tenantId: true,
      Tenant: {
        select: {
          id: true,
          name: true,
          active: true,
        }
      }
    },
    where: {
      id: jwtDecoded.id,
    },
  });

  // Set the global tenantId
  setTenent(jwtDecoded.tenantId);

  return {
    userId: userQuery.id,
    tenantId: userQuery.tenantId
  };
}

export default defineEventHandler(async (event: H3Event) => {
  // console.log('event', event);
  const isWhiteList = isPathWhiteList(event.path, event);

  if (!isWhiteList) {
    const token: any = getHeader(event, 'authorization');
    const authInfo = await validateAuthorization(token);
    event.context.auth = authInfo; // Store auth info in context
  }
});