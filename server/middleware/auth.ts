export default defineEventHandler((event) => {
    console.log('New request: ' + getRequestURL(event))
    event.context.auth = { user: 123 }
  })