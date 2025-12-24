import { comparePassword, generateToken, setAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  // Validate input
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }

  try {
    // Find player by email
    const player = await PlayerSchema.findOne({ email }).populate('homePlanet')

    if (!player) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, player.passwordHash)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    }

    // Update last active
    player.lastActive = new Date()
    player.isOnline = true
    await player.save()

    // Generate JWT token
    const token = generateToken({
      playerId: player._id.toString(),
      username: player.username,
    })

    // Set auth cookie
    setAuthCookie(event, token)

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        player: {
          id: player._id,
          username: player.username,
          email: player.email,
          level: player.level,
          rank: player.rank,
          experience: player.experience,
        },
        homePlanet: player.homePlanet,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: 'Login failed. Please try again.',
    })
  }
})
