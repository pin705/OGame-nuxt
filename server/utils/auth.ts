import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

const SALT_ROUNDS = 12

export interface JwtPayload {
  playerId: string
  username: string
  iat?: number
  exp?: number
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  })
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Get token from request headers or cookies
 */
export function getTokenFromEvent(event: H3Event): string | null {
  // Check Authorization header
  const authHeader = getHeader(event, 'Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check cookie
  const token = getCookie(event, 'auth_token')
  if (token) {
    return token
  }

  return null
}

/**
 * Set auth token as cookie
 */
export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, 'auth_token', {
    path: '/',
  })
}

/**
 * Get authenticated player from request
 */
export async function getAuthPlayer(event: H3Event): Promise<JwtPayload | null> {
  const token = getTokenFromEvent(event)
  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  const player = await getAuthPlayer(event)
  if (!player) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }
  return player
}
