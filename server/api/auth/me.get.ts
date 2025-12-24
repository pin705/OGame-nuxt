import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  try {
    const player = await PlayerSchema.findById(auth.playerId)
      .populate('homePlanet')
      .select('-passwordHash')

    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    // Update last active
    player.lastActive = new Date()
    await player.save()

    return {
      success: true,
      data: {
        player: {
          id: player._id,
          username: player.username,
          email: player.email,
          level: player.level,
          rank: player.rank,
          experience: player.experience,
          planets: player.planets,
          homePlanet: player.homePlanet,
          researches: player.researches,
          createdAt: player.createdAt,
          lastActive: player.lastActive,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Get me error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get player data',
    })
  }
})
