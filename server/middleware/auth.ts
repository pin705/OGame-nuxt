import { verifyToken } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Only apply to /api/game/* routes
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/game/')) {
    return
  }

  // Check for authorization
  const authHeader = getHeader(event, 'Authorization')
  const cookieToken = getCookie(event, 'auth_token')
  
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : cookieToken

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }

  // Attach player info to event context
  event.context.auth = payload
})
