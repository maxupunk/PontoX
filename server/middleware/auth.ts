import { users } from "../../models/users";
import { db } from "../sqlite-service";
import { eq } from "drizzle-orm";
import { pathToRegexp } from 'path-to-regexp';

export default defineEventHandler((event) => {
  const pathWhitelist = ['/api/login', '/', '/api/treine', '/api/imagens/:label/:file'];
  // Transforma cada caminho da lista de permissões em uma expressão regular
  const regexWhitelist = pathWhitelist.map(path => pathToRegexp(path));

  // Verifica se a URL do evento corresponde a alguma das expressões regulares
  const isPathValid = regexWhitelist.some(re => re.test(event.path));

  if (!isPathValid) {
    let authorization = event.headers.get('authorization');
    if (authorization) {
      const userQuery = db.select()
        .from(users)
        .where(eq(users.token, authorization))
        .get()

      if (!userQuery) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
        })
      }

    } else {
      sendRedirect(event, '/', 301)
    }
  }
})