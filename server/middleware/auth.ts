import { prismaTenant } from "../prisma";
import { setTenent } from "../prisma";
import { pathToRegexp } from 'path-to-regexp';
import { H3Event, createError } from 'h3';
import jwt from 'jsonwebtoken';

const config = useRuntimeConfig();
const SECRETJWT = config.secretJwt as string
// examplo whitelist with var: '/api/reports/resumo', '/api/reports/:id'
const pathWhitelist = ['/api/login'];
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

  try {
    const jwtDecoded: any = jwt.verify(token, SECRETJWT)

    if (!jwtDecoded) {
      throw createError({
        status: 401,
        message: 'Não autorizado',
      });
    }

    const user: any = await prismaTenant.user.findUnique({
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

    if (user.Tenant.active === false) {
      throw createError({
        status: 401,
        message: 'Tenant inativo',
      });
    }

    // Set the global tenantId
    setTenent(jwtDecoded.tenantId);

    return {
      userId: user.id,
      tenantId: user.tenantId
    };

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw createError({
        status: 401,
        message: 'Token expirado',
      });
    }
    throw createError({
      status: 401,
      message: 'Não autorizado',
    });
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const isWhiteList = isPathWhiteList(event.path, event);

  if (!isWhiteList) {
    const token: any = getHeader(event, 'authorization');
    const authInfo = await validateAuthorization(token);
    event.context.auth = authInfo; // Store auth info in context
  }
});