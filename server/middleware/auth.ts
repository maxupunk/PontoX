import prisma from "../prisma";
import { pathToRegexp } from 'path-to-regexp';

export default defineEventHandler(async (event: any) => {
  const pathWhitelist = ['/api/login', '/', '/login', '/api/treine', '/api/imagens/:label/:file', '/api/relatorios/resumo', '/api/relatorios/:id'];
  // Transforma cada caminho da lista de permissões em uma expressão regular
  const regexWhitelist = pathWhitelist.map(path => pathToRegexp(path));

  // Verifica se a URL do evento corresponde a alguma das expressões regulares
  const isPathValid = regexWhitelist.some(re => re.test(event.path));

  if (!isPathValid) {
    let authorization = event.headers.get('authorization');
    if (authorization) {
      const userQuery = await prisma.users.findFirst({
        where: {
          token: authorization,
        },
      });
      if (!userQuery) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
        })
      }

    } else {
      return sendRedirect(event, '/login', 401)
    }
  }
})