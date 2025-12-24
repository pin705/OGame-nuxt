import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  try {
    const player = await PlayerSchema.findById(auth.playerId)
      .populate('planets')
      .select('-passwordHash')

    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    return {
      success: true,
      data: {
        planets: player.planets,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Get planets error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get planets',
    })
  }
})
