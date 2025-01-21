import fs from 'fs'
import path from 'path'
import prisma from "../prisma";

export default defineEventHandler(async (event: any) => {
  return
  if (event.path == '/' && event.method == 'GET') {
    return
  }

  if (event.method !== 'GET') {
    const authorization = event.headers.get('authorization');
    const userQuery = await prisma.user.findFirst({
      where: {
        token: authorization,
      },
    });

    const body = await readBody(event)
    let logbody: string = ''
    let content: string = '';

    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        const value = body[key];
        if (!isBase64Image(value)) {
          content += `\n\t${key} - ${value}`
        }
      }
    }

    if (event.path == '/api/login') {
      logbody = `Logged - ${body.login}`
    } else if (event.path == '/api/points') {
      // anota quem deu o ponto para quem
      const pointUserQuery = await prisma.user.findUnique({
        where: {
          id: body.userId,
        },
      });
      logbody = `* Ponto - ${userQuery?.name} -> ${pointUserQuery?.name}`
    } else {
      logbody = `↳ ${event.method} - ${event.path} - user: ${userQuery?.name} ${content}`
    }


    const forwardedFor = event.req.headers['x-forwarded-for'];
    const ip = forwardedFor ? forwardedFor.split(',')[0] : event.req.socket.remoteAddress;
    const userAgent = event.req.headers['user-agent'];
    // dados de tempo
    const date = new Date();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    // Convert data to JSON string
    const dataString = `${hour}:${minute}:${second} - ${ip} - ${userAgent} \n ${logbody}\n`;
    // Create a directory path
    const dir = './logs';
    // Check if directory exists, if not create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const dateString = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
    const filename = path.resolve(dir, `${dateString}.log`);
    // Write the data to a file
    fs.appendFileSync(filename, dataString);
  }
})

function isBase64Image(str: string) {
  const base64ImagePattern = /^data:image\/[a-zA-Z]+;base64,/;
  return base64ImagePattern.test(str);
}