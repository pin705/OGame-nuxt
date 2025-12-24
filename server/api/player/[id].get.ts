

export default defineEventHandler(async (event) => {
  const playerId = getRouterParam(event, 'id')

  if (!playerId) {
    throw createError({
      statusCode: 400,
      message: 'Player ID is required',
    })
  }

  try {
    const player = await PlayerSchema.findById(playerId)
      .populate('planets')
      .populate('homePlanet')

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
          experience: player.experience,
          rank: player.rank,
          planets: player.planets,
          homePlanet: player.homePlanet,
          researches: player.researches,
          settings: player.settings,
          createdAt: player.createdAt,
          lastActive: player.lastActive,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Get player error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch player data',
    })
  }
})
