export default defineEventHandler((event) => {
    console.log('Log request: ' + getRequestURL(event))
  })